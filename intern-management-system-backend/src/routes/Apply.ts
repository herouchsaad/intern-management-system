import express from "express";
const router = express.Router();
import ApplicationController from "../controllers/Application.controller.js";

router.post("/", ApplicationController.addApplication);

export default router;