import { Component, Input, OnInit } from '@angular/core';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';

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
    }
  }

  openWithInAppBrowser(e) {
    let target = "_blank";
    const url = 'https://selfregistration.cowin.gov.in/';
    this.inAppBrowser.create(url, target, this.options);
  }
}
