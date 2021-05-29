import { Component, Input, OnInit } from '@angular/core';
import { AppConstants } from 'src/app/constants/AppConstants';
import { AvailableCenterSessions } from 'src/app/models/vaccinesessions';
import { CowinService } from 'src/app/services/cowin/cowin.service';

@Component({
  selector: 'app-result-section',
  templateUrl: './result-section.page.html',
  styleUrls: ['./result-section.page.scss']
})
export class ResultSectionPage implements OnInit {
  @Input() results: AvailableCenterSessions[] = [];

  showResults: boolean;
  filteredResults: AvailableCenterSessions[] = [];
  weekDates: any[] = [];
  weeklyResults: any[] = [];
  currentDate = this.cowinService.getFormatDate(new Date());

  readonly column: string = 'TotalSlots';
  isDesc: boolean = true;
  searchTerm: string;

  constructor(private cowinService: CowinService) { }

  ngOnInit() {

  }
  ngOnChanges() {
    this.showResults = this.results.length > 0;
    this.filteredResults = [];
    this.weekDates = this.cowinService.getWeekDates();
    if (this.showResults) {
      //console.log('card results', this.results);
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
                TotalSlots: this.findCenterSlotCount(sessions, AppConstants.totalavailable_capacity)
              }
            );
            var dayItem = this.weeklyResults.find(x => this.checkDateSlotsAvailable(x, date));
            if (!dayItem) {
              var totalSlotsDose1 = this.findTotalSlotCount(results, AppConstants.totalavailable_capacity_dose1);
              var totalSlotsDose2 = this.findTotalSlotCount(results, AppConstants.totalavailable_capacity_dose2);
              this.weeklyResults.push(
                {
                  sessionDate: date,
                  filteredResults: results,
                  totalSlots: this.findTotalSlotCount(results, AppConstants.totalavailable_capacity),
                  totalSlotsDose1: totalSlotsDose1,
                  totalSlotsDose2: totalSlotsDose2
                }
              );
            }
            else {
              dayItem.filteredResults = [...dayItem.filteredResults, ...results];
              dayItem.totalSlotsDose1 = this.findTotalSlotCount(dayItem.filteredResults, AppConstants.totalavailable_capacity_dose1);
              dayItem.totalSlotsDose2 = this.findTotalSlotCount(dayItem.filteredResults, AppConstants.totalavailable_capacity_dose2);
              dayItem.totalSlots = this.findTotalSlotCount(dayItem.filteredResults, AppConstants.totalavailable_capacity);
            }
          }
          else if (sessions && sessions.length > 1) {
            for (let s of sessions) {
              var results = [];
              results.push(
                <AvailableCenterSessions>{
                  Center: item.Center,
                  Sessions: [s],
                  TotalSlots: this.findCenterSlotCount([s], AppConstants.totalavailable_capacity)
                }
              );
              var dayItem = this.weeklyResults.find(x => this.checkDateSlotsAvailable(x, date));
              if (!dayItem) {
                var totalSlotsDose1 = this.findTotalSlotCount(results, AppConstants.totalavailable_capacity_dose1);
                var totalSlotsDose2 = this.findTotalSlotCount(results, AppConstants.totalavailable_capacity_dose2);
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
                dayItem.totalSlotsDose1 = this.findTotalSlotCount(dayItem.filteredResults, AppConstants.totalavailable_capacity_dose1);
                dayItem.totalSlotsDose2 = this.findTotalSlotCount(dayItem.filteredResults, AppConstants.totalavailable_capacity_dose2);
                dayItem.totalSlots = dayItem.totalSlotsDose1 + dayItem.totalSlotsDose2;
              }
            }
          }
        }
      }
      //console.log('weeklyResults', this.weeklyResults);
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
  setFilteredItems() {

  }
}
