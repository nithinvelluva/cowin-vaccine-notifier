import { VaccineAlert } from "./vaccinealert";

export class ManageAlertDialogModel {
    title: string;
    message: string;
    actions: string[];
    states: any[];
    vaccineAlert: VaccineAlert

    constructor(title: string, message: string, actions: string[], states: any[], vaccineAlert?: VaccineAlert) {
        this.title = title;
        this.message = message;
        this.actions = actions;
        this.states = states;
        this.vaccineAlert = vaccineAlert ?? new VaccineAlert();
    }
}