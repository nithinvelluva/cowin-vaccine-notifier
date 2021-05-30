import { Injectable } from '@angular/core';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { interval, Subscription } from 'rxjs';
import { AppConstants } from 'src/app/constants/AppConstants';
import { AvailableCenterSessions, Session } from 'src/app/models/vaccinesessions';
import { AlertService } from '../alert/alert.service';
import { CowinService } from '../cowin/cowin.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  subscription: Subscription;
  not_id: number = 0;

  constructor(
    private alertService: AlertService,
    private backgroundMode: BackgroundMode,
    private cowinService: CowinService,
    private localNotifications: LocalNotifications
  ) {
    this.not_id = 0;
  }

  unsubscribe() {
    if (this.subscription != null && this.subscription != undefined) {
      this.subscription.unsubscribe();
    }
  }

  parseSessionData(allCenterSessions: any[], params: any): any[] {
    let availableCenterSessions = [];
    if (allCenterSessions) {
      var feeFilter = params.feeFilterGroupValue && params.feeFilterGroupValue.length > 0;
      var centers = feeFilter ? allCenterSessions.filter(x => this.cowinService.constructFeeFilterParams(x, params.feeFilterGroupValue))
        : allCenterSessions;

      centers.forEach((element, i, arr) => {
        var openSessions: Session[] = [];
        var allSessions: Session[] = element.sessions;
        openSessions = [...openSessions, ...allSessions.filter(x => this.cowinService.constructFilterParams(x, params.ageFilterGroupValue, params.vaccineFilterGroupValue))];
        if (openSessions && openSessions.length > 0) {
          availableCenterSessions.push(
            <AvailableCenterSessions>{
              Center: element,
              Sessions: openSessions
            }
          );
        }
      });
    }
    return availableCenterSessions;
  }

  pushAvailableSessionNotification(preferences: any) {
    var search_params = preferences.search_type == 1 ? 'Pincode : ' + preferences.pincode : 'State : ' + preferences.state + ',District : ' + preferences.district;
    this.localNotifications.schedule({
      id: ++this.not_id,
      text: 'Vaccine slots found based on your preferences.' +
        search_params
        + '.Book your slots in COWIN',
      sound: 'file://sound.mp3',
      data: { secret: 'key_data' }
    });
  }

  getcalendarByDistrict(params: any) {
    this.cowinService.GetCalendarByDistrict(params.district_id).subscribe((data: any) => {
      if (data && data.centers) {
        var response = this.parseSessionData(data.centers, params);
        if (response && response.length > 0) {
          this.pushAvailableSessionNotification(params);
        }
      }
    });
  }

  getcalendarByPincode(params: any) {
    this.cowinService.getcalendarByPincode(params.pincode).subscribe((data: any) => {
      if (data && data.centers) {
        var response = this.parseSessionData(data.centers, params);
        if (response && response.length > 0) {
          this.pushAvailableSessionNotification(params);
        }
      }
    });
  }

  getVaccineSchedule() {
    this.unsubscribe();
    this.alertService.getAllAlerts().then(async (data: any) => {
      if (data && data.length > 0) {
        this.backgroundMode.on("activate").subscribe(() => {

          this.subscription = interval(AppConstants.SlotCheckRefreshTime).subscribe(x => {
            for (let alert of data) {
              console.log(alert);
              if (alert.params.search_type == 1) {
                this.getcalendarByPincode(alert.params);
              }
              else {
                this.getcalendarByDistrict(alert.params);
              }
            }
          });
        });
        this.subscription = interval(AppConstants.SlotCheckRefreshTime).subscribe(x => {
          for (let alert of data) {
            console.log(alert);
            if (alert.params.search_type == 1) {
              this.getcalendarByPincode(alert.params);
            }
            else {
              this.getcalendarByDistrict(alert.params);
            }
          }
        });
      }
    });
  }
}