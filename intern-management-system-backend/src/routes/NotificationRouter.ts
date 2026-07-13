import express from "express";
import NotificationController from "../controllers/Notification.controller.js";
const router = express.Router();



router.get("/:user_id", NotificationController.getNotifications);
router.post("/seen/:user_id", NotificationController.handleSeen);


export default router;