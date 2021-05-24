export class VaccineAlert {
    constructor(alert_id?: string, params?: VaccineAlertParams) {
        this.alert_id = alert_id;
        this.params = params ?? new VaccineAlertParams();
    }
    alert_id: string;
    params: VaccineAlertParams;
}
export class VaccineAlertParams {
    constructor() {
        this.ageFilterGroupValue = [];
        this.vaccineFilterGroupValue = [];
        this.feeFilterGroupValue = [];

        this.date = null;
        this.search_type = 1;
        this.pincode = null;
        this.state_id = null;
        this.district_id = null;
        this.pincode = null;
        this.state = null;
        this.district = null;
    }
    date: string;
    search_type: number;
    pincode: string;
    state_id: number;
    district_id: number;
    state: string;
    district: string;

    ageFilterGroupValue: [];
    vaccineFilterGroupValue: [];
    feeFilterGroupValue: [];
}