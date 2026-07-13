import { Attendance } from "../models/Attendance.js";
import pool from "../utils/database.js";
import Queries from "../utils/queries.js";

const takeAttendance = async (req, res) => {
    const { intern_id, attendance_date, status, note } = req.body;
    
    const result = await pool.query(Queries.checkAttendanceExistsQuery, [intern_id, attendance_date]);
    try {
        if(result.rows.length === 0) { 
            await pool.query(Queries.takeAttendaceQuery, [intern_id, attendance_date, status, note]);
        } else{ //That means it is an update
            const attendance: Attendance = result.rows[0];
            await pool.query(Queries.updateAttendanceQuery, [attendance.intern_id, attendance.attendance_date, status, note]);
        }
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
    
}

const getAttendancesForIntern = async (req, res) => {
    try {
        const intern_id = req.params.intern_id

        const results = await pool.query(Queries.getAttendancesForInternQuery, [intern_id]);
        
       
        return res.status(200).json(results.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({'message': error.message});
    }
}





const AttendanceController = {
    takeAttendance: takeAttendance,
    getAttendancesForIntern: getAttendancesForIntern,
}

export default AttendanceController;