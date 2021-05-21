export class ConfirmationDialogModel {
    title: string;
    message: string;
    actions: string[];

    constructor(title: string, message: string, actions: string[]) {
        this.title = title;
        this.message = message;
        this.actions = actions;
    }
}