export class VaccineAlert {
    alert_id: string;
    params: VaccineAlertParams;
}
export class VaccineAlertParams {
    date: string;
    search_type: number;
    pincode: string;
    state: number;
    district: number;

    ageFilterGroupValue: [];
    vaccineFilterGroupValue: [];
    feeFilterGroupValue: [];
}