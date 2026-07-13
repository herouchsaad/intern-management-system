import express from "express";
import AttendanceController from "../controllers/Attendance.controller.js";
import ROLES_LIST from "../../roles_list.js";
import verifyRole from "../middleware/verifyRole.js";
import DocumentRequestController from "../controllers/DocumentRequest.controller.js";
const router = express.Router();


router.post("/", verifyRole(ROLES_LIST.Admin), DocumentRequestController.addRequest);
router.get("/", verifyRole(ROLES_LIST.Admin, ROLES_LIST.Intern), DocumentRequestController.getRequests);
router.delete("/:id", verifyRole(ROLES_LIST.Admin), DocumentRequestController.deleteRequest);


export default router;