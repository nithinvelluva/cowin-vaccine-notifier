import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstants } from 'src/app/constants/AppConstants';
import { ApiEndponits } from '../../constants/ApiEndPonits';

@Injectable({
  providedIn: 'root'
})
export class CowinService {

  constructor(public httpClient: HttpClient) {

  }
  GetStates() {
    return this.httpClient.get(ApiEndponits.API_states);
  }

  GetDistricts(stateId) {
    return this.httpClient.get(ApiEndponits.API_districts + stateId);
  }

  GetCalendarByDistrict(district) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var date = dd + '-' + mm + '-' + yyyy;
    return this.httpClient.get(ApiEndponits.API_calendarByDistrict + '?district_id=' + district + '&date=' + date);
  }

  getcalendarByPincode(pincode) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var date = dd + '-' + mm + '-' + yyyy;
    return this.httpClient.get(ApiEndponits.API_CalendarByPin + '?pincode=' + pincode + '&date=' + date);
  }

  constructFilterParams(element, ageFilters?, vaccineFilters?, doseFilters?) {
    var optionFilterVal = true;
    var optionVaccineFilterVal = true;
    var optionDoseFilterVal = true;

    if (ageFilters && ageFilters.length > 0) {
      optionFilterVal = false;
      for (let filter of ageFilters) {
        optionFilterVal = optionFilterVal || element[filter.Key] == filter.Value;
      }
    }
    if (vaccineFilters && vaccineFilters.length > 0) {
      optionVaccineFilterVal = false;
      for (let filter of vaccineFilters) {
        optionVaccineFilterVal = optionVaccineFilterVal || element[filter.Key] == filter.Value;
      }
    }
    if (doseFilters && doseFilters.length > 0) {
      optionDoseFilterVal = false;
      for (let filter of doseFilters) {
        optionDoseFilterVal = optionDoseFilterVal || element[filter.Key] > 0;
      }
    }
    return element[AppConstants.totalavailable_capacity] > 0 && optionDoseFilterVal && optionFilterVal && optionVaccineFilterVal;
  }
  constructFeeFilterParams(element, filters?) {
    var optionFilterVal = true;
    if (filters && filters.length > 0) {
      optionFilterVal = false;
      for (let filter of filters) {
        optionFilterVal = optionFilterVal || element[filter.Key] == filter.Value;
      }
    }
    return optionFilterVal;
  }
  getFormatDate(date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();
    return dd + '-' + mm + '-' + yyyy;
  }
  getWeekDates() {
    var current = new Date();
    var date = current;
    var week = new Array();
    for (var i = 0; i < 7; i++) {
      date.setDate(current.getDate() + 1);
      week.push(
        this.getFormatDate(new Date(date))
      );
    }
    return week;
  }
}
