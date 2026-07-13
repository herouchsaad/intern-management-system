import express from "express";
import AttendanceController from "../controllers/Attendance.controller.js";
import ROLES_LIST from "../../roles_list.js";
import verifyRole from "../middleware/verifyRole.js";
const router = express.Router();


router.post("/", verifyRole(ROLES_LIST.Supervisor), AttendanceController.takeAttendance);
router.get("/:intern_id", verifyRole(ROLES_LIST.Admin, ROLES_LIST.Supervisor, ROLES_LIST.Intern), AttendanceController.getAttendancesForIntern);


export default router;
