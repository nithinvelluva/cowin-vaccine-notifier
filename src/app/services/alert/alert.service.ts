import { Injectable } from '@angular/core';
import { VaccineAlert, VaccineAlertParams } from '../../models/vaccinealert';
import { StorageService } from '../storage/storage.service';
import { v4 as UUID } from 'uuid';

@Injectable({
    providedIn: 'root'
})
export class AlertService {
    constructor(private storageService: StorageService) { }
    readonly alertListKey = 'cowin_alerts';
    readonly alertPreferenceKey = 'preference';

    async getAllAlerts(): Promise<any> {
        return await this.storageService.getItem(this.alertListKey);
    }

    async getAlert(id: string): Promise<VaccineAlert> {
        return this.getAllAlerts().then(function (data) {
            if (data) {
                return data;
            }
        });
    }

    async createAlert(alertParams: VaccineAlertParams): Promise<void> {
        let alert = <VaccineAlert>{
            alert_id: UUID(),
            params: alertParams
        };
        let alerts: VaccineAlert[] = [alert];
        const alertsDB = await this.getAllAlerts();
        if (alertsDB) {
            alerts = [...alertsDB, ...alerts];
        }
        this.storageService.setItem(this.alertListKey, JSON.stringify(alerts));
    }

    async editAlert(alert: VaccineAlert): Promise<any> {
        const alertsDB = await this.getAllAlerts();
        if (alertsDB) {
            var index = alertsDB.findIndex(a => a.alert_id == alert.alert_id);
            if (index != -1) {
                alertsDB[index] = alert;
            }
        }
        this.storageService.setItem(this.alertListKey, JSON.stringify(alertsDB));
    }

    async removeAlert(key: string): Promise<void> {
        let serviceRef = this.storageService;
        let storageKey = this.alertListKey;
        return await this.getAllAlerts().then(function (data) {
            if (data) {
                console.log(data);
                var index = data.findIndex(x => x.alert_id == key);
                if (index != -1) {
                    data.splice(index, 1);
                    serviceRef.setItem(storageKey, JSON.stringify(data));
                }
            }
        });
    }

    checkAlertDuplicates(data: VaccineAlert[], preferences: VaccineAlertParams, alert_id?: any): boolean {
        let duplicate = false;
        if (data && data.length > 0) {
            if (preferences.search_type == 1) {
                var alert = alert_id ? data.find(a => a.params.pincode == preferences.pincode && a.alert_id != alert_id)
                    : data.find(a => a.params.pincode == preferences.pincode);
                duplicate = alert != null || alert != undefined;
            }
            else {
                var alert = alert_id ? data.find(a => (a.params.state_id == preferences.state_id && a.params.district_id == preferences.district_id
                    && a.alert_id != alert_id))
                    : data.find(a => (a.params.state_id == preferences.state_id && a.params.district_id == preferences.district_id));
                duplicate = alert != null || alert != undefined;
            }
        }
        return duplicate;
    }
}