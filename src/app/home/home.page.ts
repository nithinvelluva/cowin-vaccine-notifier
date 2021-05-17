import { Component } from '@angular/core';
import { CowinService } from '../services/cowin.service';
import { interval, Subscription } from 'rxjs';
import { Session, AvailableCenterSessions, FilterGroup } from '../models/vaccinesessions';
// import { StorageService } from "../services/storage/storage.service";
// import { Plugins } from '@capacitor/core';
//const { LocalNotifications } = Plugins;

import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  states: any[];
  districts: any[];
  preferences = {
    stateId: 0,
    districtId: 0,
    searchCriteria: 1,
    pinNumber: "",
    ageGroup: 1,
    subscribe: false
  }
  not_id = 0;
  subscription: Subscription;
  preferencesKey: string = 'preferences';
  availableCenterSessions: AvailableCenterSessions[] = [];
  searchCompleted: boolean = false;
  allCenterSessions: any[];

  filterFeeGroupValue: Array<FilterGroup> = [];
  filterGroupValue: Array<FilterGroup> = [];
  toggleOptions: Array<FilterGroup> = [];
  feeOptions: Array<FilterGroup> = [];

  constructor(private cowinService: CowinService
    , private localNotifications: LocalNotifications
    //, private storageService: StorageService
    ) { }

  buildFilterOptions() {
    let id = 0;
    let ageGroups: Array<FilterGroup> = [<FilterGroup>{ Option: "18-44", Key: 'min_age_limit', Value: '18' },
    <FilterGroup>{ Option: "45+", Key: 'min_age_limit', Value: '45' }];

    let vaccineGroups: Array<FilterGroup> = [<FilterGroup>{ Option: "COVISHIELD", Key: 'vaccine', Value: 'COVISHIELD' },
    <FilterGroup>{ Option: "COVAXIN", Key: 'vaccine', Value: 'COVAXIN' }];

    let feeTypeGroups: Array<FilterGroup> = [<FilterGroup>{ Option: "Free", Key: 'fee_type', Value: 'Free' },
    <FilterGroup>{ Option: "Paid", Key: 'fee_type', Value: 'Paid' }];

    this.toggleOptions = [...this.toggleOptions, ...ageGroups, ...vaccineGroups];
    this.feeOptions = [...this.feeOptions, ...feeTypeGroups];
  }
  ngOnInit(): void {
    this.buildFilterOptions();
    //this.storageService.get(this.preferencesKey).then(async (data: any) => {
      //console.log(data);
      //this.preferences = data;
      this.cowinService.GetStates().subscribe((data: any) => {
        this.states = data.states;
        if (this.preferences.districtId) {
          this.getDistricts(this.preferences.stateId);
        }
      });
      this.getVaccineSchedule(null);

      /* const notifs = await LocalNotifications.schedule({
        notifications: [
          {
            title: "Title",
            body: "Body",
            id: 1,
            schedule: { at: new Date(Date.now() + 1000 * 5) },
            sound: null,
            attachments: null,
            actionTypeId: "",
            extra: null
          }
        ]
      }); */
    //});
  }

  onStateChange(e) {
    this.getDistricts(this.preferences.stateId);
  }
  getDistricts(stateId) {
    this.cowinService.GetDistricts(stateId).subscribe((data: any) => {
      this.districts = data.districts;
    });
  }
  parseSessionData() {
    this.availableCenterSessions = [];
    if (this.allCenterSessions) {
      var feeFilter = this.filterFeeGroupValue && this.filterFeeGroupValue.length > 0;

      var filterParams = this.filterGroupValue && this.filterGroupValue.length > 0;
      var centers = feeFilter ? this.allCenterSessions.filter(x => this.constructFeeFilterParams(x, 0, this.allCenterSessions))
      : this.allCenterSessions;

      centers.forEach((element, i, arr) => {
        var openSessions: Session[] = [];
        var allSessions: Session[] = element.sessions;
        openSessions = filterParams ?
          [...openSessions, ...allSessions.filter(x => this.constructFilterParams(x, i, allSessions))] :
          [...openSessions, ...allSessions.filter(x => x.available_capacity > 0)];
        if (openSessions && openSessions.length > 0) {
          this.availableCenterSessions.push(
            <AvailableCenterSessions>{
              Center: element,
              Sessions: openSessions
            }
          );
        }
      });
    }
  }
  getcalendarByDistrict() {
    this.searchCompleted = false;
    this.cowinService.GetCalendarByDistrict(this.preferences.districtId).subscribe((data: any) => {
      if (data && data.centers) {
        this.allCenterSessions = data.centers;
        this.parseSessionData();
        console.log('sessions available', this.availableCenterSessions);
        if (this.availableCenterSessions && this.availableCenterSessions.length > 0 && this.preferences.subscribe) {
          //alert('found !!');
          this.localNotifications.schedule({
            id: ++this.not_id,
            text: 'Vaccines slot found !! Book your slots in COWIN',
            sound: 'file://sound.mp3',
            data: { secret: 'key_data' }
          });
        }
      }
      this.searchCompleted = true;
    });
  }

  getcalendarByPincode() {
    this.searchCompleted = false;
    this.cowinService.getcalendarByPincode(this.preferences.pinNumber).subscribe((data: any) => {
      if (data && data.centers) {
        this.allCenterSessions = data.centers;
        this.parseSessionData();
        if (this.availableCenterSessions && this.availableCenterSessions.length > 0 && this.preferences.subscribe) {
          alert('found !!');
          this.localNotifications.schedule({
            id: ++this.not_id,
            text: 'Vaccines slot found !! Book your slots in COWIN',
            sound: 'file://sound.mp3',
            data: { secret: 'key_data' }
          });
        }
      }
    });
    this.searchCompleted = true;
  }

  getVaccineSchedule(e) {
    if (this.preferences.subscribe) {
      this.subscription = interval(10000).subscribe(x => {
        this.getSchedule();
      });
    }
    else {
      this.unsubscribe();
    }
  }
  getSchedule() {
    this.savePreferences();
    if (this.preferences.searchCriteria == 2) {
      this.getcalendarByDistrict();
    } else if (this.preferences.searchCriteria == 1) {
      this.getcalendarByPincode();
    }
  }
  savePreferences() {
    //this.storageService.set(this.preferencesKey, this.preferences);
  }
  actionDisabled() {
    return this.preferences.searchCriteria == 1 ? !this.preferences.pinNumber : !(this.preferences.stateId && this.preferences.districtId);
  }
  unsubscribe() {
    this.preferences.subscribe = false;
    if (this.subscription != null && this.subscription != undefined) {
      this.subscription.unsubscribe();
    }
  }
  criteriaTypeChange() {
    this.searchCompleted = false;
    this.unsubscribe();
    this.savePreferences();
  }
  /* ageGroupFilterChage(e) {
    this.parseSessionData();
  } */
  filterGroupSelectionChanged(e) {
    this.searchCompleted = false;
    this.parseSessionData();
    this.searchCompleted = true;
    console.log('sessions available', this.availableCenterSessions);
  }
  filterFeeGroupValueSelectionChanged(e){
    this.searchCompleted = false; 
    this.parseSessionData();
    this.searchCompleted = true;
    console.log('sessions available', this.availableCenterSessions);
  }

  constructFilterParams(element, index, array) {
    if (this.filterGroupValue.length == 1) {
      return element.available_capacity > 0 && element[this.filterGroupValue[0].Key] == this.filterGroupValue[0].Value;
    }
    else {
      let params: Array<any> = [];
      this.filterGroupValue.forEach(e => { params.push('element[' + e.Key + '] == "' + e.Value + '"') });
      return element.available_capacity > 0 && params.join(" || ");
    }
  }
  constructFeeFilterParams(element, index, array) {
    if (this.filterFeeGroupValue.length == 1) {
      return element[this.filterFeeGroupValue[0].Key] == this.filterFeeGroupValue[0].Value;
    }
    else {
      let params: Array<any> = [];
      this.filterFeeGroupValue.forEach(e => { params.push('element[' + e.Key + '] == "' + e.Value + '"') });
      return params.join(" || ");
    }
  }
}
