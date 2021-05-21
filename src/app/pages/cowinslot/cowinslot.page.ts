import { Component, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

@Component({
  selector: 'app-cowinslot',
  templateUrl: './cowinslot.page.html',
  styleUrls: ['./cowinslot.page.scss'],
})
export class CowinslotPage implements OnInit {
  subscription: Subscription;
  constructor(private alertService: AlertService,
    private backgroundMode: BackgroundMode,
    private localNotifications: LocalNotifications) { }

  ngOnInit() {
    this.getVaccineSchedule();
  }

  getVaccineSchedule() {
    this.alertService.getAllAlerts().then(async (data: any) => {
      if (data && data.length > 0) {
        this.backgroundMode.enable();
        this.backgroundMode.on("activate").subscribe(() => {
          this.pushAvailableSessionNotification();
          for (let alert of data) {
            /* this.subscription = interval(10000).subscribe(x => {
              this.getSchedule();
            }); */
          }
        });
        this.pushAvailableSessionNotification();
      }
    });
  }

  pushAvailableSessionNotification() {
    let not_id = 0;
    this.localNotifications.schedule({
      id: ++not_id,
      text: 'Vaccines slot found !! Book your slots in COWIN',
      sound: 'file://sound.mp3',
      data: { secret: 'key_data' }
    });
  }
}