import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndponits } from '../constants/ApiEndPonits';

@Injectable({
  providedIn: 'root'
})
export class CowinService {
  states: Observable<any>;
  constructor(public httpClient: HttpClient) { 

  }
  GetStates(){
    return this.httpClient.get(ApiEndponits.API_states);
    /* .subscribe(data => {
      console.log('states: ', data);
    }); */
  }

  GetDistricts(stateId){
    return this.httpClient.get(ApiEndponits.API_districts + stateId);
    /* .subscribe(data => {
      console.log('states: ', data);
    }); */
  }

  GetCalendarByDistrict(district){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var date = dd + '-' + mm + '-' + yyyy;
    return this.httpClient.get(ApiEndponits.API_calendarByDistrict + '?district_id=' + district + '&date=' + date);
    /* .subscribe(data => {
      console.log('states: ', data);
    }); */
  }

  getcalendarByPincode(pincode){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var date = dd + '-' + mm + '-' + yyyy;
    return this.httpClient.get(ApiEndponits.API_CalendarByPin + '?pincode=' + pincode + '&date=' + date);
    /* .subscribe(data => {
      console.log('states: ', data);
    }); */
  }
}
