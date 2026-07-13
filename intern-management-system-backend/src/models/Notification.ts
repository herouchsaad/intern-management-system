export interface Notification  {
    notification_id?: number,
    user_id: number,
    intern_id?: number,
    notification_date: number,
    type_code: number,
    content: string,
    timestamp?: number,
    is_seen: boolean,
}


/* Type Codes
birthday: 1
internship ending: 2
waiting applications: 3
waiting assignments: 4
*/