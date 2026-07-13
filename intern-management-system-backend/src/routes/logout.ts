import express from "express";
const router = express.Router();
import UserController from "../controllers/User.controller.js";

router.get("/", UserController.handleLogout);

export default router;