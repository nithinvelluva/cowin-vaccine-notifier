import { Component } from '@angular/core';
import { CowinService } from '../services/cowin.service';
import { interval, Subscription } from 'rxjs';
import { Session, AvailableCenterSessions, FilterGroup } from '../models/vaccinesessions';

import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { MatSnackBar } from '@angular/material/snack-bar';

import { StorageLocalDBService } from '../services/storage/storage.localdb';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
//import { StorageService } from '../services/storage/storage.service';
//import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',  
  styleUrls: ['home.page.scss']
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
  filterVaccineGroupValue: Array<FilterGroup> = [];
  toggleOptions: Array<FilterGroup> = [];
  feeOptions: Array<FilterGroup> = [];
  vaccineOptions: Array<FilterGroup> = [];

  hasResults: boolean;

  constructor(private cowinService: CowinService
    , private localNotifications: LocalNotifications
    //, private storageService: StorageService
    //,private storage: NativeStorage
    , private localDBService: StorageLocalDBService
    , private snackBar: MatSnackBar
  ) { }

  buildFilterOptions() {
    let ageGroups: Array<FilterGroup> = [<FilterGroup>{ Option: "18-44", Key: 'min_age_limit', Value: '18' },
    <FilterGroup>{ Option: "45+", Key: 'min_age_limit', Value: '45' }];

    let vaccineGroups: Array<FilterGroup> = [<FilterGroup>{ Option: "COVISHIELD", Key: 'vaccine', Value: 'COVISHIELD' },
    <FilterGroup>{ Option: "COVAXIN", Key: 'vaccine', Value: 'COVAXIN' },
    <FilterGroup>{ Option: "Sputnik V", Key: 'vaccine', Value: 'SputnikV' }];

    let feeTypeGroups: Array<FilterGroup> = [<FilterGroup>{ Option: "Free", Key: 'fee_type', Value: 'Free' },
    <FilterGroup>{ Option: "Paid", Key: 'fee_type', Value: 'Paid' }];

    this.toggleOptions = [...this.toggleOptions, ...ageGroups];
    this.feeOptions = [...this.feeOptions, ...feeTypeGroups];
    this.vaccineOptions = [...this.vaccineOptions, ...vaccineGroups];

    this.localDBService.hai();
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
      var centers = feeFilter ? this.allCenterSessions.filter(x => this.constructFeeFilterParams(x, 0, this.allCenterSessions))
        : this.allCenterSessions;

      /* var filterParams = (this.filterGroupValue && this.filterGroupValue.length > 0)
        || (this.filterVaccineGroupValue && this.filterVaccineGroupValue.length > 0); */
      centers.forEach((element, i, arr) => {
        var openSessions: Session[] = [];
        var allSessions: Session[] = element.sessions;
        /* openSessions = filterParams ?
          [...openSessions, ...allSessions.filter(x => this.constructFilterParams(x, i, allSessions))] :
          [...openSessions, ...allSessions.filter(x => x.available_capacity > 0)]; */
        openSessions = [...openSessions, ...allSessions.filter(x => this.constructFilterParams(x, i, allSessions))];
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
          this.localNotifications.schedule({
            id: ++this.not_id,
            text: 'Vaccines slot found !! Book your slots in COWIN',
            sound: 'file://sound.mp3',
            data: { secret: 'key_data' }
          });
        }
      }
      this.hasResults = data && data.centers && data.centers.length > 0;
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
      this.hasResults = data && data.centers && data.centers.length > 0;
      this.searchCompleted = true;
    });
  }

  subscribeToNotification(e) {
    if (this.preferences.subscribe) {
      let snackBarRef = this.snackBar.open('An alert has been created based on your preferences.You will be notified when a slot opens up', 'Close');
      snackBarRef.onAction().subscribe(() => {
        this.preferences.subscribe = false;
      });
    }
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
    this.preferences.stateId = 0;
    this.preferences.districtId = 0;
    this.preferences.pinNumber = "";
    //this.savePreferences();
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
  filterFeeGroupValueSelectionChanged(e) {
    this.searchCompleted = false;
    this.parseSessionData();
    this.searchCompleted = true;
    console.log('sessions available', this.availableCenterSessions);
  }

  filterGroupVaccineSelectionChanged(e) {
    this.searchCompleted = false;
    this.parseSessionData();
    this.searchCompleted = true;
    console.log('sessions available', this.availableCenterSessions);
  }

  constructFilterParams(element, index, array) {
    var optionFilterVal = true;
    var optionVaccineFilterVal = true;
    if (this.filterGroupValue.length > 0) {
      var optionFilterVal = false;
      for (let filter of this.filterGroupValue) {
        optionFilterVal = optionFilterVal || element[filter.Key] == filter.Value;
      }
    }
    if (this.filterVaccineGroupValue.length > 0) {
      var optionVaccineFilterVal = false;
      for (let filter of this.filterVaccineGroupValue) {
        optionVaccineFilterVal = optionVaccineFilterVal || element[filter.Key] == filter.Value;
      }
    }
    //return element.available_capacity > 0 && optionFilterVal && optionVaccineFilterVal;
    return optionFilterVal && optionVaccineFilterVal;
  }
  constructFeeFilterParams(element, index, array) {
    if (this.filterFeeGroupValue.length == 1) {
      return element[this.filterFeeGroupValue[0].Key] == this.filterFeeGroupValue[0].Value;
    }
    else {
      var optionFilterVal = false;
      for (let filter of this.filterFeeGroupValue) {
        optionFilterVal = optionFilterVal || element[filter.Key] == filter.Value;
      }
      return optionFilterVal;
    }
  }
}
