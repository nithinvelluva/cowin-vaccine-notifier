/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
export class ApiEndponits {
    private static API_ENDPOINT='https://cdn-api.co-vin.in/api/';

    public static API_states = ApiEndponits.API_ENDPOINT + 'v2/admin/location/states';

    public static API_districts= ApiEndponits.API_ENDPOINT + 'v2/admin/location/districts/';

    // API to get planned vaccination sessions on a specific date in a given district.
    public static API_VaccinationSessionByDistrict = ApiEndponits.API_ENDPOINT
                                                        + 'v2/appointment/sessions/public/findByDistrict/';

    //API to get planned vaccination sessions on a specific date in a given pin.
    public static API_VaccinationSessionByPincode = ApiEndponits.API_ENDPOINT
                                                        + 'v2/appointment/sessions/public/findByPin/';

    //API to get planned vaccination sessions for 7 days from a specific date in a given pin.
    public static API_CalendarByPin = ApiEndponits.API_ENDPOINT + 'v2/appointment/sessions/public/calendarByPin';

    //API to get planned vaccination sessions for 7 days from a specific date in a given district.
    public static API_calendarByDistrict = ApiEndponits.API_ENDPOINT + 'v2/appointment/sessions/public/calendarByDistrict';
 }
