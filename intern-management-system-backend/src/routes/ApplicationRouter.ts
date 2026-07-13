import express from "express";
const router = express.Router();
import ApplicationController from "../controllers/Application.controller.js";


router.get("/", ApplicationController.getApplications);
router.delete("/:application_id", ApplicationController.deleteApplication);
router.delete("/", ApplicationController.emptyArchieve);
router.post("/accept/:applications_id", ApplicationController.acceptApplication);
router.post("/reject/:applications_id", ApplicationController.rejectApplication);

export default router;