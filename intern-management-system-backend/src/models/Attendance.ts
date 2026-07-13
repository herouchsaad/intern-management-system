export interface Attendance {
    attendance_id?: number,
    intern_id: number,
    attendance_date: number,
    status: "presend" | "absent",
    note?: string,
}