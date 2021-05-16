export class Session {
    session_id: string;
    date: string;
    available_capacity: number;
    min_age_limit: number;
    vaccine: string;
    slots: string[];
}

export class Center {
    center_id: number;
    name: string;
    state_name: string;
    district_name: string;
    block_name: string;
    pincode: number;
    lat: number;
    long: number;
    from: string;
    to: string;
    fee_type: string;
    sessions: Session[];
}

export class Centers {
    centers: Center[];
}

export class AvailableCenterSessions {
    Center: Center;
    Sessions: Session[];
}

export class BaseOption {
    Value: string;
    Option: string;
}

export class FilterGroup extends BaseOption{
    Key: string;

    constructor(id : string, option : string, key : string){
        super();
        this.Value = id;
        this.Option = option;
        this.Key = key;
    } 
}