import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VaccineAlert, VaccineAlertParams } from 'src/app/models/vaccinealert';
import { CowinService } from 'src/app/services/cowin.service';

@Component({
  selector: 'app-edit-alert',
  templateUrl: './edit-alert.component.html',
  styleUrls: ['./edit-alert.component.scss'],
})
export class EditAlertComponent implements OnInit {
  title: string;
  message: string;
  actions: string[];
  states: any[];
  vaccineAlert: VaccineAlert;
  myControl = new FormControl();
  districts: any[];

  constructor(
    public dialogRef: MatDialogRef<EditAlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cowinService: CowinService) {
    this.title = data.title;
    this.message = data.message;
    this.actions = data.actions;
    this.states = data.states;
    this.vaccineAlert = data.vaccineAlert ?? new VaccineAlert();
  }
  ngOnInit(): void {

  }

  onConfirm(): void {
    this.vaccineAlert.params.district = this.vaccineAlert.params.search_type == 2 ?
      this.districts.find(d => d.district_id == this.vaccineAlert.params.district_id)?.district_name : null;

    this.vaccineAlert.params.state = this.vaccineAlert.params.search_type == 2 ?
      this.states.find(d => d.state_id == this.vaccineAlert.params.state_id)?.state_name : null;

    this.dialogRef.close(this.vaccineAlert);
  }

  onDismiss(): void {
    this.dialogRef.close(null);
  }

  onStateChange(e) {
    this.getDistricts(this.vaccineAlert.params.state_id);
  }
  getDistricts(stateId) {
    this.cowinService.GetDistricts(stateId).subscribe((data: any) => {
      this.districts = data.districts;
    });
  }
  actionDisabled() {
    return this.vaccineAlert.params.search_type == 1 ?
      !this.vaccineAlert.params.pincode :
      !(this.vaccineAlert.params.state_id && this.vaccineAlert.params.district_id);
  }
}
