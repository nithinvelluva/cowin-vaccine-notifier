import { Component, OnDestroy, OnInit } from '@angular/core';
import { VaccineAlert, VaccineAlertParams } from 'src/app/models/vaccinealert';
import { AlertService } from 'src/app/services/alert/alert.service';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../alert-dialogs/confirm-dialog/confirm-dialog.component';
import { ConfirmationDialogModel } from 'src/app/models/confirmationdialog';
import { NavigationEnd, Router } from '@angular/router';
import { CowinService } from 'src/app/services/cowin/cowin.service';
import { EditAlertComponent } from '../../alert-dialogs/edit-alert/edit-alert.component';
import { ManageAlertDialogModel } from 'src/app/models/managealertdialog';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.page.html',
  styleUrls: ['./alert.page.scss'],
})
export class AlertPage implements OnInit, OnDestroy {

  alerts: VaccineAlert[] = [];
  navigationSubscription;
  static states: [] = [];
  readonly pencilIcon: any;

  constructor(
    private router: Router
    , private alertService: AlertService
    , public dialog: MatDialog
    , private cowinService: CowinService
  ) {
    this.pencilIcon = faPencilAlt;
    const currentUrl = this.router.url;
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd && e.url == currentUrl) {
        this.refresh();
        this.dialog.closeAll();
        this.cowinService.GetStates().subscribe((data: any) => {
          AlertPage.states = data.states;
        });
      }
    });
  }

  ngOnInit() {
  }

  ngOnChanges() {
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we  
    // don't then we will continue to run our initialiseInvites()   
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  public refresh() {
    this.alertService.getAllAlerts().then(async (data: any) => {
      this.alerts = data;
    });
  }

  removeAlert(alert_id: string): void {
    if (alert_id) {
      this.openDialog().afterClosed().subscribe(result => {
        if (result) {
          this.alertService.removeAlert(alert_id).then(x => {
            this.refresh();
          });
        }
      });
    }
  }

  editAlert(alert: VaccineAlert): void {
    if (alert) {
      this.openManageAlertDialog(alert).afterClosed().subscribe(result => {
        if (result && result.alert_id) {
          this.dialog.closeAll();
          this.alertService.editAlert(result);
        }
      });
    }
  }
  openDialog(): MatDialogRef<ConfirmDialogComponent, any> {
    let actions = ['No', 'Yes'];
    const dialogData = new ConfirmationDialogModel('Confirm', 'Are you sure you want to delete the alert?', actions);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = dialogData;
    dialogConfig.width = '90%';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    return dialogRef;
  }

  openManageAlertDialog(alert?: VaccineAlert): MatDialogRef<EditAlertComponent, any> {
    let actions = ['Cancel', 'Save'];
    let modalTitle = alert ? 'Edit Alert' : 'Add Alert';
    const dialogData = new ManageAlertDialogModel(
      modalTitle,
      '',
      actions,
      AlertPage.states,
      alert);

    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = dialogData;
    dialogConfig.width = '90%';

    const dialogRef = this.dialog.open(EditAlertComponent, dialogConfig);
    return dialogRef;
  }

  createAlert(e) {
    this.openManageAlertDialog().afterClosed().subscribe(result => {
      if (result) {
        let params = <VaccineAlertParams>{
          district_id: result.params.search_type == 2 ? result.params.district_id : null,
          state_id: result.params.search_type == 2 ? result.params.state_id : null,
          district: result.params.district,
          state: result.params.state,
          pincode: result.params.search_type == 1 ? result.params.pincode : null,
          search_type: result.params.search_type,
          date: new Date().toString()
        };
        this.alertService.createAlert(params).then(x => {
          this.dialog.closeAll();
          this.refresh();
        });
      }
    });
  }
}
