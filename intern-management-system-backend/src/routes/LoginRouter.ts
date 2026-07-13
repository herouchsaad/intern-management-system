import express from "express";
const router = express.Router();
import TeamController from "../controllers/Team.controller.js";
import UserController from "../controllers/User.controller.js";

router.post("/", UserController.login);
router.get("/", UserController.hadnleRefreshToken);


export default router;