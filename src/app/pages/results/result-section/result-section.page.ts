import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AvailableCenterSessions } from 'src/app/models/vaccinesessions';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-result-section',
  templateUrl: './result-section.page.html',
  styleUrls: ['./result-section.page.scss']
})
export class ResultSectionPage implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() results: AvailableCenterSessions[] = [];

  showResults: boolean;
  filteredResults: AvailableCenterSessions[] = [];
  weekDates: any[] = [];
  weeklyResults: any[] = [];
  currentDate = this.getFormatDate(new Date());
  readonly totalavailable_capacity: string = 'available_capacity';
  readonly totalavailable_capacity_dose1: string = 'available_capacity_dose1';
  readonly totalavailable_capacity_dose2: string = 'available_capacity_dose2';

  readonly column: string = 'TotalSlots';
  isDesc: boolean = true;

  constructor() { }

  ngOnInit() {

  }
  ngOnChanges() {
    this.showResults = this.results.length > 0;
    this.filteredResults = [];
    this.weekDates = this.dates();
    if (this.showResults) {
      console.log('card results', this.results);
      this.weeklyResults = [];
      for (let date of this.weekDates) {
        for (let item of this.results) {          
          var sessions = item.Sessions.filter(x => x.date == date);
          if (sessions && sessions.length == 1) {
            var results = [];
            results.push(
              <AvailableCenterSessions>{
                Center: item.Center,
                Sessions: sessions,
                TotalSlots: this.findCenterSlotCount(sessions, this.totalavailable_capacity)
              }
            );
            var dayItem = this.weeklyResults.find(x => this.checkDateSlotsAvailable(x, date));
            if (!dayItem) {
              var totalSlotsDose1 = this.findTotalSlotCount(results, this.totalavailable_capacity_dose1);
              var totalSlotsDose2 = this.findTotalSlotCount(results, this.totalavailable_capacity_dose2);
              this.weeklyResults.push(
                {
                  sessionDate: date,
                  filteredResults: results,
                  totalSlots: this.findTotalSlotCount(results, this.totalavailable_capacity),
                  totalSlotsDose1: totalSlotsDose1,
                  totalSlotsDose2: totalSlotsDose2
                }
              );
            }
            else {
              dayItem.filteredResults = [...dayItem.filteredResults, ...results];
              dayItem.totalSlotsDose1 = this.findTotalSlotCount(dayItem.filteredResults, this.totalavailable_capacity_dose1);
              dayItem.totalSlotsDose2 = this.findTotalSlotCount(dayItem.filteredResults, this.totalavailable_capacity_dose2);
              dayItem.totalSlots = this.findTotalSlotCount(dayItem.filteredResults, this.totalavailable_capacity);
            }
          }
          else if (sessions && sessions.length > 1) {
            for (let s of sessions) {
              var results = [];
              results.push(
                <AvailableCenterSessions>{
                  Center: item.Center,
                  Sessions: [s],
                  TotalSlots: this.findCenterSlotCount([s], this.totalavailable_capacity)
                }
              );
              var dayItem = this.weeklyResults.find(x => this.checkDateSlotsAvailable(x, date));
              if (!dayItem) {
                var totalSlotsDose1 = this.findTotalSlotCount(results, this.totalavailable_capacity_dose1);
                var totalSlotsDose2 = this.findTotalSlotCount(results, this.totalavailable_capacity_dose2);
                this.weeklyResults.push(
                  {
                    sessionDate: date,
                    filteredResults: results,
                    totalSlots: totalSlotsDose1 + totalSlotsDose2,
                    totalSlotsDose1: totalSlotsDose1,
                    totalSlotsDose2: totalSlotsDose2
                  }
                );
              }
              else {
                dayItem.filteredResults = [...dayItem.filteredResults, ...results];
                dayItem.totalSlotsDose1 = this.findTotalSlotCount(dayItem.filteredResults, this.totalavailable_capacity_dose1);
                dayItem.totalSlotsDose2 = this.findTotalSlotCount(dayItem.filteredResults, this.totalavailable_capacity_dose2);
                dayItem.totalSlots = dayItem.totalSlotsDose1 + dayItem.totalSlotsDose2;
              }
            }
          }
        }
      }
      console.log('weeklyResults', this.weeklyResults);
    }
  }
  findTotalSlotCount(data: any[], capacity_type) {
    var sum = 0;
    data.map(element => {
      element.Sessions.map(x => {
        sum += x[capacity_type]
      });
    });
    return sum;
  }
  findCenterSlotCount(data: any[], capacity_type) {
    var sum = 0;
    data.map(x => {
      sum += x[capacity_type]
    });
    return sum;
  }
  checkDateSlotsAvailable(item, date) {
    return item.sessionDate == date;
  }
  getFormatDate(date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();
    return dd + '-' + mm + '-' + yyyy;
  }
  dates() {
    var current = new Date();
    var week = new Array();
    // Starting Monday not Sunday
    current.setDate((current.getDate() - current.getDay() + 1));
    for (var i = 0; i < 7; i++) {
      week.push(
        this.getFormatDate(new Date(current))
      );
      current.setDate(current.getDate() + 1);
    }
    return week;
  }
}