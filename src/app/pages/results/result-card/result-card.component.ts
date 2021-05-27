import { Component, Input, OnInit } from '@angular/core';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { AppConstants } from 'src/app/constants/AppConstants';

@Component({
  selector: 'app-result-card',
  templateUrl: './result-card.component.html',
  styleUrls: ['./result-card.component.scss'],
})
export class ResultCardComponent implements OnInit {
  @Input() card: any;
  ageGroup: string;
  fee_type: string;
  vaccine_type: string;
  slots_count: number;
  capacity_dose1: number;
  capacity_dose2: number;

  options: InAppBrowserOptions = {
    location: 'yes',//Or 'no' 
    hidden: 'no', //Or  'yes'
    clearcache: 'yes',
    clearsessioncache: 'yes',
    //zoom : 'yes',//Android only ,shows browser zoom controls 
    hardwareback: 'yes',
    mediaPlaybackRequiresUserAction: 'no',
    shouldPauseOnSuspend: 'no' //Android only    
  };

  constructor(private inAppBrowser: InAppBrowser) { }

  ngOnInit() {

  }

  ngOnChanges() {
    this.fee_type = this.card.Center.fee_type;
    var currentDateSession = this.card.Sessions;//.filter(x => x.date == this.getCurrentDate());
    if (currentDateSession && currentDateSession.length > 0) {
      this.vaccine_type = currentDateSession[0].vaccine;
      this.ageGroup = currentDateSession[0].min_age_limit;
      this.slots_count = currentDateSession[0].available_capacity;
      this.capacity_dose1 = currentDateSession[0].available_capacity_dose1;
      this.capacity_dose2 = currentDateSession[0].available_capacity_dose2;
    }
  }

  openWithInAppBrowser(e) {
    let target = "_blank";
    this.inAppBrowser.create(AppConstants.cowin_register_url, target, this.options);
  }
}
