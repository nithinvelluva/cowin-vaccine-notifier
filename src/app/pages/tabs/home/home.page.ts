import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';

import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AvailableCenterSessions, FilterGroup, Session } from 'src/app/models/vaccinesessions';
import { CowinService } from 'src/app/services/cowin.service';
import { AlertService } from 'src/app/services/alert.service';
import { VaccineAlert, VaccineAlertParams } from 'src/app/models/vaccinealert';
import { NavigationEnd, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmationDialogModel } from 'src/app/models/confirmationdialog';
import { ConfirmDialogComponent } from '../../alert-dialogs/confirm-dialog/confirm-dialog.component';
import { AppConstants } from 'src/app/constants/AppConstants';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
  states: any[];
  districts: any[];
  preferences = {
    stateId: 0,
    districtId: 0,
    searchCriteria: 1,
    pinNumber: "",
    ageGroup: 1,
    subscribe: false
  };
  not_id = 0;
  subscription: Subscription;
  preferencesKey: string = 'preferences';
  availableCenterSessions: AvailableCenterSessions[] = [];
  searchCompleted: boolean = false;
  allCenterSessions: any[];

  filterFeeGroupValue: Array<FilterGroup> = [];
  filterAgeGroupValue: Array<FilterGroup> = [];
  filterVaccineGroupValue: Array<FilterGroup> = [];
  ageOptions: Array<FilterGroup> = [];
  feeOptions: Array<FilterGroup> = [];
  vaccineOptions: Array<FilterGroup> = [];

  hasResults: boolean;

  myControl = new FormControl();
  alerts: VaccineAlert[] = [];
  navigationSubscription;

  constructor(
    private cowinService: CowinService
    , private localNotifications: LocalNotifications
    , private alertService: AlertService
    , private snackBar: MatSnackBar
    , private router: Router
    , private dialog: MatDialog
    , private backgroundMode: BackgroundMode
  ) {
    const currentUrl = this.router.url;
    //this.getVaccineSchedule();
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd && e.url == currentUrl) {
        //this.setDefaults();
      }
    });
  }

  resetFilters() {
    this.filterAgeGroupValue = [];
    this.filterFeeGroupValue = [];
    this.filterVaccineGroupValue = [];
  }

  buildFilterOptions() {
    let ageGroups: Array<FilterGroup> = [<FilterGroup>{ Option: "18+", Key: 'min_age_limit', Value: '18' },
    <FilterGroup>{ Option: "45+", Key: 'min_age_limit', Value: '45' }];

    let vaccineGroups: Array<FilterGroup> = [<FilterGroup>{ Option: "Covishield", Key: 'vaccine', Value: 'COVISHIELD' },
    <FilterGroup>{ Option: "Covaxin", Key: 'vaccine', Value: 'COVAXIN' },
    <FilterGroup>{ Option: "Sputnik V", Key: 'vaccine', Value: 'SputnikV' }];

    let feeTypeGroups: Array<FilterGroup> = [<FilterGroup>{ Option: "Free", Key: 'fee_type', Value: 'Free' },
    <FilterGroup>{ Option: "Paid", Key: 'fee_type', Value: 'Paid' }];

    this.ageOptions = [];
    this.feeOptions = [];
    this.vaccineOptions = [];
    this.ageOptions = [...this.ageOptions, ...ageGroups];
    this.feeOptions = [...this.feeOptions, ...feeTypeGroups];
    this.vaccineOptions = [...this.vaccineOptions, ...vaccineGroups];
  }

  setDefaults() {
    this.preferences.stateId = 0;
    this.preferences.districtId = 0;
    this.preferences.searchCriteria = 1;
    this.preferences.pinNumber = "";
    this.preferences.ageGroup = 1;
    this.preferences.subscribe = false;

    this.hasResults = false;
    this.searchCompleted = false;

    this.dialog.closeAll();
    this.buildFilterOptions();

    this.cowinService.GetStates().subscribe((data: any) => {
      this.states = data.states;
    });
  }

  getVaccineSchedule() {
    this.unsubscribe();
    this.alertService.getAllAlerts().then(async (data: any) => {
      if (data && data.length > 0) {
        this.backgroundMode.on("activate").subscribe(() => {

          this.subscription = interval(10000).subscribe(x => {
            for (let alert of data) {
              if (alert.params.search_type == 1) {
                this.cowinService.GetCalendarByDistrict(this.preferences.districtId).subscribe((data: any) => {
                  if (data && data.centers) {
                    var allCenterSessions = data.centers;
                    this.parseSessionData();
                    if (this.availableCenterSessions && this.availableCenterSessions.length > 0 && this.preferences.subscribe) {
                      this.pushAvailableSessionNotification();
                    }
                  }
                });
              }
            }
          });

        });

        /* this.subscription = interval(10000).subscribe(x => {
          this.pushAvailableSessionNotification();
        }); */
      }
    });
  }

  ngOnInit(): void {
    this.setDefaults();
  }

  ngOnChanges() {
    this.setDefaults();
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we  
    // don't then we will continue to run our initialiseInvites()   
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  onStateChange(e) {
    this.searchCompleted = false;
    this.preferences.districtId = 0;
    this.getDistricts(this.preferences.stateId);
  }
  onDistrictChange(e) {
    this.searchCompleted = false;
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
      var centers = feeFilter ? this.allCenterSessions.filter(x => this.constructFeeFilterParams(x))
        : this.allCenterSessions;

      centers.forEach((element, i, arr) => {
        var openSessions: Session[] = [];
        var allSessions: Session[] = element.sessions;
        openSessions = [...openSessions, ...allSessions.filter(x => this.constructFilterParams(x))];
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

  pushAvailableSessionNotification() {
    this.localNotifications.schedule({
      id: ++this.not_id,
      text: 'Vaccines slot found !! Book your slots in COWIN',
      sound: 'file://sound.mp3',
      data: { secret: 'key_data' }
    });
  }

  getcalendarByDistrict() {
    this.searchCompleted = false;
    this.cowinService.GetCalendarByDistrict(this.preferences.districtId).subscribe((data: any) => {
      if (data && data.centers) {
        this.allCenterSessions = data.centers;
        this.parseSessionData();
        if (this.availableCenterSessions && this.availableCenterSessions.length > 0 && this.preferences.subscribe) {
          this.pushAvailableSessionNotification();
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
          this.pushAvailableSessionNotification();
        }
      }
      this.hasResults = data && data.centers && data.centers.length > 0;
      this.searchCompleted = true;
    });
  }

  subscribeToNotification() {
    let params = <VaccineAlertParams>{
      district_id: this.preferences.searchCriteria == 2 ? this.preferences.districtId : null,
      state_id: this.preferences.searchCriteria == 2 ? this.preferences.stateId : null,

      district: this.preferences.searchCriteria == 2 ? this.districts.find(d => d.district_id == this.preferences.districtId)?.district_name : null,
      state: this.preferences.searchCriteria == 2 ? this.states.find(s => s.state_id == this.preferences.stateId)?.state_name : null,

      pincode: this.preferences.searchCriteria == 1 ? this.preferences.pinNumber : null,
      search_type: this.preferences.searchCriteria,

      ageFilterGroupValue: this.filterAgeGroupValue,
      feeFilterGroupValue: this.filterFeeGroupValue,
      vaccineFilterGroupValue: this.filterVaccineGroupValue,

      date: new Date().toString()
    };
    this.alertService.createAlert(params).then(x => {
      this.preferences.subscribe = false;
      let snackBarRef = this.snackBar.open('An alert has been created based on your preferences.You will be notified when a slot opens up', 'View Alerts',
        {
          duration: 5000
        }
      );
      snackBarRef.onAction().subscribe(() => {
        this.preferences.subscribe = false;
        this.router.navigate(['/cowinslot/alert']);
      });
      snackBarRef.afterDismissed().subscribe(() => {
        this.preferences.subscribe = false;
      });
    });
  }

  getSchedule() {
    this.resetFilters();
    if (this.preferences.searchCriteria == 2) {
      this.getcalendarByDistrict();
    } else if (this.preferences.searchCriteria == 1) {
      this.getcalendarByPincode();
    }
  }

  actionDisabled() {
    return this.preferences.searchCriteria == 1 ? !this.preferences.pinNumber : !(this.preferences.stateId && this.preferences.districtId);
  }

  createAlert() {
    this.alertService.getAllAlerts().then(async (data: any) => {
      let actions = ['Dismiss', 'View Alerts'];
      var alertCount = data ? data && data.length : 0;
      if (alertCount == AppConstants.AlertAllowedLimit) {
        const dialogData = new ConfirmationDialogModel('Warning', 'You have reached the maximum limit of alerts', actions);
        this.openDialog(dialogData);
      }
      else {
        if (!this.checkAlertDuplicates(data)) {
          this.subscribeToNotification();
        }
        else {
          const dialogData = new ConfirmationDialogModel('Warning', 'An alert with similar preferences found', actions);
          this.openDialog(dialogData);
        }
      }
    });
  }

  checkAlertDuplicates(data: VaccineAlert[]): boolean {
    let duplicate = false;
    if (data && data.length > 0) {
      if (this.preferences.searchCriteria == 1) {
        duplicate = data.find(a => a.params.pincode == this.preferences.pinNumber) != null;
      }
      else {
        duplicate = data.find(a => (a.params.state_id == this.preferences.stateId && a.params.district_id == this.preferences.districtId)) != null;
      }
    }
    return duplicate;
  }

  openDialog(dialogData: ConfirmationDialogModel): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = dialogData;
    dialogConfig.width = '90%';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {

      }
      else {
        this.router.navigate(['/cowinslot/alert']);
      }
    });
  }

  unsubscribe() {
    if (this.subscription != null && this.subscription != undefined) {
      this.subscription.unsubscribe();
    }
  }
  criteriaTypeChange(e) {
    this.searchCompleted = false;
  }

  filterGroupSelectionChanged(e) {
    this.searchCompleted = false;
    this.parseSessionData();
    this.searchCompleted = true;
  }
  filterFeeGroupValueSelectionChanged(e) {
    this.searchCompleted = false;
    this.parseSessionData();
    this.searchCompleted = true;
  }

  filterGroupVaccineSelectionChanged(e) {
    this.searchCompleted = false;
    this.parseSessionData();
    this.searchCompleted = true;
  }

  constructFilterParams(element) {
    var optionFilterVal = true;
    var optionVaccineFilterVal = true;
    if (this.filterAgeGroupValue.length > 0) {
      optionFilterVal = false;
      for (let filter of this.filterAgeGroupValue) {
        optionFilterVal = optionFilterVal || element[filter.Key] == filter.Value;
      }
    }
    if (this.filterVaccineGroupValue.length > 0) {
      optionVaccineFilterVal = false;
      for (let filter of this.filterVaccineGroupValue) {
        optionVaccineFilterVal = optionVaccineFilterVal || element[filter.Key] == filter.Value;
      }
    }
    return optionFilterVal && optionVaccineFilterVal;
  }
  constructFeeFilterParams(element) {
    var optionFilterVal = true;
    if (this.filterFeeGroupValue.length > 0) {
      optionFilterVal = false;
      for (let filter of this.filterFeeGroupValue) {
        optionFilterVal = optionFilterVal || element[filter.Key] == filter.Value;
      }
    }
    return optionFilterVal;
  }
}