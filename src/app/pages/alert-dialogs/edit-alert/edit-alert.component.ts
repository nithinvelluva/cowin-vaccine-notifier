import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationDialogModel } from 'src/app/models/confirmationdialog';
import { VaccineAlert } from 'src/app/models/vaccinealert';
import { AlertService } from 'src/app/services/alert/alert.service';
import { CowinService } from 'src/app/services/cowin/cowin.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

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
  districts: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<EditAlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cowinService: CowinService
    , private alertService: AlertService
    , public dialog: MatDialog) {
    this.title = data.title;
    this.message = data.message;
    this.actions = data.actions;
    this.states = data.states;
    this.vaccineAlert = data.vaccineAlert ?? new VaccineAlert();
    if (data.vaccineAlert?.params.state_id) this.getDistricts(this.vaccineAlert.params.state_id);
  }
  ngOnInit(): void {

  }

  onConfirm(): void {
    this.vaccineAlert.params.district = this.vaccineAlert.params.search_type == 2 ?
      this.districts.find(d => d.district_id == this.vaccineAlert.params.district_id)?.district_name : null;

    this.vaccineAlert.params.state = this.vaccineAlert.params.search_type == 2 ?
      this.states.find(d => d.state_id == this.vaccineAlert.params.state_id)?.state_name : null;

    this.alertService.getAllAlerts().then(async (data: any) => {
      if (!this.alertService.checkAlertDuplicates(data, this.vaccineAlert.params, this.vaccineAlert.alert_id)) {
        this.dialogRef.close(this.vaccineAlert);
      }
      else {
        let actions = ['Dismiss', 'Ok'];
        const dialogData = new ConfirmationDialogModel('Warning', 'An alert with similar preferences found', actions);
        this.openDialog(dialogData);
      }
    });
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

  openDialog(dialogData: ConfirmationDialogModel): MatDialogRef<ConfirmDialogComponent, any> {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = dialogData;
    dialogConfig.width = '90%';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    return dialogRef;
  }
}
