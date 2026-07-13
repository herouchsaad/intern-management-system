import express from "express";
const router = express.Router();
import InternController from "../controllers/Assignment.controller.js";
import AssignmentController from "../controllers/Assignment.controller.js";
import ROLES_LIST from "../../roles_list.js";
import verifyRole from "../middleware/verifyRole.js";

router.post("/", verifyRole(ROLES_LIST.Supervisor), AssignmentController.addAssignment);
router.post("/:assignment_id/done", verifyRole(ROLES_LIST.Intern), AssignmentController.markDone);
router.put("/", verifyRole(ROLES_LIST.Supervisor), AssignmentController.updateAssignment);
router.get("/:intern_id", verifyRole(ROLES_LIST.Supervisor, ROLES_LIST.Admin, ROLES_LIST.Intern), AssignmentController.getAssignmentsForIntern);
router.delete("/:assignment_id",verifyRole(ROLES_LIST.Supervisor), AssignmentController.deleteAssignment);

export default router;
