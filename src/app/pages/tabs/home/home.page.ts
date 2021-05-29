import { Component, OnDestroy, OnInit } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';

import { AvailableCenterSessions, FilterGroup, Session } from 'src/app/models/vaccinesessions';
import { CowinService } from 'src/app/services/cowin/cowin.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { VaccineAlert, VaccineAlertParams } from 'src/app/models/vaccinealert';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmationDialogModel } from 'src/app/models/confirmationdialog';
import { ConfirmDialogComponent } from '../../alert-dialogs/confirm-dialog/confirm-dialog.component';
import { AppConstants } from 'src/app/constants/AppConstants';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
  states: any[];
  districts: any[];
  preferences = new VaccineAlertParams();
  not_id = 0;
  preferencesKey: string = 'preferences';
  availableCenterSessions: AvailableCenterSessions[] = [];
  searchInProgress: boolean = false;
  searchCompleted: boolean = false;
  allCenterSessions: any[];

  filterAgeGroupValue: Array<FilterGroup> = [];
  filterFeeGroupValue: Array<FilterGroup> = [];
  filterVaccineGroupValue: Array<FilterGroup> = [];
  filterDoseGroupValue: Array<FilterGroup> = [];
  ageOptions: Array<FilterGroup> = [];
  feeOptions: Array<FilterGroup> = [];
  vaccineOptions: Array<FilterGroup> = [];
  doseOptions: Array<FilterGroup> = [];

  filterAgeGroup: FilterGroup;
  filterFeeGroup: FilterGroup;
  filterDoseGroup: FilterGroup;
  hasResults: boolean;

  myControl = new FormControl();
  alerts: VaccineAlert[] = [];
  navigationSubscription;

  readonly settingIcon: any;

  // Readable Address
  address: string;

  // Location coordinates
  latitude: number;
  longitude: number;
  accuracy: number;

  //Geocoder configuration
  geoencoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };

  constructor(
    private cowinService: CowinService
    , private alertService: AlertService
    , private snackBar: MatSnackBar
    , private router: Router
    , private dialog: MatDialog
    , private notificationService: NotificationService
    , private geolocation: Geolocation
    , private nativeGeocoder: NativeGeocoder
  ) {
    this.settingIcon = faSlidersH;
    const currentUrl = this.router.url;
    this.getGeolocation();
    this.notificationService.getVaccineSchedule();
  }

  getGeolocation() {
    this.geolocation.getCurrentPosition().then((resp) => {

      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
      this.accuracy = resp.coords.accuracy;

      this.getGeoencoder(resp.coords.latitude, resp.coords.longitude);

    }).catch((error) => {
      alert('Error getting location' + JSON.stringify(error));
    });
  }

  //geocoder method to fetch address from coordinates passed as arguments
  getGeoencoder(latitude, longitude) {
    this.nativeGeocoder.reverseGeocode(latitude, longitude, this.geoencoderOptions)
      .then((result: NativeGeocoderResult[]) => {
        this.address = this.generateAddress(result[0]);
      })
      .catch((error: any) => {
        alert('Error getting location' + JSON.stringify(error));
      });
  }

  //Return Comma saperated address
  generateAddress(addressObj) {
    let obj = [];
    let address = "";
    for (let key in addressObj) {
      if (key == 'postalCode') {
        this.preferences.pincode = addressObj[key];
      }
      obj.push(addressObj[key]);
    }
    obj.reverse();
    for (let val in obj) {
      if (obj[val].length)
        address += obj[val] + ', ';
    }
    return address.slice(0, -2);
  }
  resetFilters() {
    this.filterAgeGroupValue = [];
    this.filterFeeGroupValue = [];
    this.filterVaccineGroupValue = [];
    this.filterDoseGroupValue = [];

    this.filterAgeGroup = new FilterGroup();
    this.filterFeeGroup = new FilterGroup();
    this.filterDoseGroup = new FilterGroup();
  }

  clearFilters() {
    this.getSchedule();
  }

  filtersActive() {
    return this.filterAgeGroupValue.length > 0 ||
      this.filterFeeGroupValue.length > 0 ||
      this.filterVaccineGroupValue.length > 0 ||
      this.filterDoseGroupValue.length > 0;
  }

  buildFilterOptions() {
    let ageGroups: Array<FilterGroup> = [<FilterGroup>{ Option: "18+", Key: 'min_age_limit', Value: '18' },
    <FilterGroup>{ Option: "45+", Key: 'min_age_limit', Value: '45' }];

    let vaccineGroups: Array<FilterGroup> = [<FilterGroup>{ Option: "Covishield", Key: 'vaccine', Value: 'COVISHIELD' },
    <FilterGroup>{ Option: "Covaxin", Key: 'vaccine', Value: 'COVAXIN' },
    <FilterGroup>{ Option: "Sputnik V", Key: 'vaccine', Value: 'SputnikV' }];

    let feeTypeGroups: Array<FilterGroup> = [<FilterGroup>{ Option: "Free", Key: 'fee_type', Value: 'Free' },
    <FilterGroup>{ Option: "Paid", Key: 'fee_type', Value: 'Paid' }];

    let doseTypeGroups: Array<FilterGroup> = [<FilterGroup>{ Option: "Dose 1", Key: 'available_capacity_dose1', Value: 'Dose 1' },
    <FilterGroup>{ Option: "Dose 2", Key: 'available_capacity_dose2', Value: 'Dose 2' }];

    this.ageOptions = [];
    this.feeOptions = [];
    this.vaccineOptions = [];
    this.doseOptions = [];
    this.ageOptions = [...this.ageOptions, ...ageGroups];
    this.feeOptions = [...this.feeOptions, ...feeTypeGroups];
    this.vaccineOptions = [...this.vaccineOptions, ...vaccineGroups];
    this.doseOptions = [...this.filterDoseGroupValue, ...doseTypeGroups];
  }

  setDefaults() {
    this.preferences.state_id = 0;
    this.preferences.district_id = 0;
    this.preferences.search_type = 1;
    this.preferences.pincode = "";

    this.filterAgeGroup = new FilterGroup();
    this.filterFeeGroup = new FilterGroup();
    this.filterDoseGroup = new FilterGroup();

    this.hasResults = false;
    this.searchCompleted = false;

    this.dialog.closeAll();
    this.buildFilterOptions();

    this.cowinService.GetStates().subscribe((data: any) => {
      this.states = data.states;
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
    this.preferences.district_id = 0;
    this.getDistricts(this.preferences.state_id);
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
      var centers = feeFilter ? this.allCenterSessions.filter(x => this.cowinService.constructFeeFilterParams(x, this.filterFeeGroupValue))
        : this.allCenterSessions;

      centers.forEach((element, i, arr) => {
        var openSessions: Session[] = [];
        var allSessions: Session[] = element.sessions;
        openSessions = [...openSessions, ...allSessions.filter(x => this.cowinService.constructFilterParams(
          x,
          this.filterAgeGroupValue,
          this.filterVaccineGroupValue,
          this.filterDoseGroupValue)
        )];
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
    if (this.preferences.district_id) {
      this.searchInProgress = true;
      this.searchCompleted = false;
      this.cowinService.GetCalendarByDistrict(this.preferences.district_id).subscribe((data: any) => {
        if (data && data.centers) {
          this.allCenterSessions = data.centers;
          this.parseSessionData();
        }
        this.hasResults = data && data.centers && data.centers.length > 0;
        this.searchCompleted = true;
        this.searchInProgress = false;
      });
    }
  }

  getcalendarByPincode() {
    if (this.preferences.pincode) {
      this.searchInProgress = true;
      this.searchCompleted = false;
      this.cowinService.getcalendarByPincode(this.preferences.pincode).subscribe((data: any) => {
        if (data && data.centers) {
          this.allCenterSessions = data.centers;
          this.parseSessionData();
        }
        this.hasResults = data && data.centers && data.centers.length > 0;
        this.searchCompleted = true;
        this.searchInProgress = false;
      });
    }
  }

  subscribeToNotification() {
    let params = <VaccineAlertParams>{
      district_id: this.preferences.search_type == 2 ? this.preferences.district_id : null,
      state_id: this.preferences.search_type == 2 ? this.preferences.state_id : null,

      district: this.preferences.search_type == 2 ? this.districts.find(d => d.district_id == this.preferences.district_id)?.district_name : null,
      state: this.preferences.search_type == 2 ? this.states.find(s => s.state_id == this.preferences.state_id)?.state_name : null,

      pincode: this.preferences.search_type == 1 ? this.preferences.pincode : null,
      search_type: this.preferences.search_type,

      ageFilterGroupValue: this.filterAgeGroupValue,
      feeFilterGroupValue: this.filterFeeGroupValue,
      vaccineFilterGroupValue: this.filterVaccineGroupValue,

      date: new Date().toString()
    };
    this.alertService.createAlert(params).then(x => {
      let snackBarRef = this.snackBar.open('An alert has been created based on your preferences.You will be notified when a slot opens up', 'View Alerts',
        {
          duration: 5000
        }
      );
      snackBarRef.onAction().subscribe(() => {
        this.router.navigate(['/cowinslot/alert']);
      });
      snackBarRef.afterDismissed().subscribe(() => {
      });
    });
  }

  getSchedule() {
    this.resetFilters();
    if (this.preferences.search_type == 2) {
      this.getcalendarByDistrict();
    } else if (this.preferences.search_type == 1) {
      this.getcalendarByPincode();
    }
  }

  actionDisabled() {
    return this.preferences.search_type == 1 ? !this.preferences.pincode : !(this.preferences.state_id && this.preferences.district_id);
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
        if (!this.alertService.checkAlertDuplicates(data, this.preferences)) {
          this.subscribeToNotification();
        }
        else {
          const dialogData = new ConfirmationDialogModel('Warning', 'An alert with similar preferences found', actions);
          this.openDialog(dialogData);
        }
      }
    });
  }



  openDialog(dialogData: ConfirmationDialogModel): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = dialogData;
    dialogConfig.width = '90%';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/cowinslot/alert']);
      }
    });
  }
  criteriaTypeChange(e) {
    this.searchCompleted = false;
    this.getSchedule();
  }

  /* filterAgeGroupSelectionChanged(e) {
    this.searchCompleted = false;
    this.parseSessionData();
    this.searchCompleted = true;
  } */
  filterAgeGroupSelectionChanged(e) {
    this.searchInProgress = true;
    this.filterAgeGroupValue = [];
    this.filterAgeGroupValue.push(this.filterAgeGroup);
    this.searchCompleted = false;
    this.parseSessionData();
    this.searchCompleted = true;
    this.searchInProgress = false;
  }
  /* filterFeeGroupValueSelectionChanged(e) {
    this.searchCompleted = false;
    this.parseSessionData();
    this.searchCompleted = true;
  } */
  filterFeeGroupValueSelectionChanged(e) {
    this.searchInProgress = true;
    this.filterFeeGroupValue = [];
    this.filterFeeGroupValue.push(this.filterFeeGroup);
    this.searchCompleted = false;
    this.parseSessionData();
    this.searchCompleted = true;
    this.searchInProgress = false;
  }

  /* filterGroupVaccineSelectionChanged(e) {
    this.searchCompleted = false;
    this.parseSessionData();
    this.searchCompleted = true;
  } */

  filterGroupVaccineSelectionChanged(e) {
    this.searchInProgress = true;
    this.searchCompleted = false;
    this.parseSessionData();
    this.searchCompleted = true;
    this.searchInProgress = false;
  }

  /* filterGroupVaccineSelectionChanged(e) {
    this.searchCompleted = false;
    this.parseSessionData();
    this.searchCompleted = true;
  } */

  filterDoseGroupValueSelectionChanged(e) {
    this.searchInProgress = true;
    this.filterDoseGroupValue = [];
    this.filterDoseGroupValue.push(this.filterDoseGroup);
    this.searchCompleted = false;
    this.parseSessionData();
    this.searchCompleted = true;
    this.searchInProgress = false;
  }
}