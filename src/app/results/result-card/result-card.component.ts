import { Component, Input, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit() {
    
  }

  ngOnChanges(){
    this.fee_type = this.card.Center.fee_type;
    var currentDateSession = this.card.Sessions.filter(x => x.date == this.getCurrentDate());
    if (currentDateSession && currentDateSession.length > 0) {
      this.vaccine_type = currentDateSession[0].vaccine;
      this.ageGroup = currentDateSession[0].min_age_limit;      
      this.slots_count = currentDateSession[0].available_capacity;
    }
  }

  getCurrentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    return dd + '-' + mm + '-' + yyyy;
  }

}
