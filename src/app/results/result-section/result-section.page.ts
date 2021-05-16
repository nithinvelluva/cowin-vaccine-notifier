import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AvailableCenterSessions } from 'src/app/models/vaccinesessions';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-result-section',
  templateUrl: './result-section.page.html',
  styleUrls: ['./result-section.page.scss'],
})
export class ResultSectionPage implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator; 
  
  @Input() results: AvailableCenterSessions[] = [];
  showResults: boolean;
  filteredResults: AvailableCenterSessions[] = [];

  constructor() { }

  ngOnInit() {
    
  }
  ngOnChanges(){
    this.showResults = this.results.length > 0;
    this.filteredResults = [];
    if (this.showResults) {
      console.log('card results', this.results);
      var currentDate = this.getCurrentDate();
      for (let item of this.results) {
        var sessions = item.Sessions.filter(x => x.date == currentDate);
        if (sessions && sessions.length > 0) {
          this.filteredResults.push(
            <AvailableCenterSessions>{
              Center: item.Center,
              Sessions: sessions
            }
          );
        }
      }
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
