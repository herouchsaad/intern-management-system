import express from "express";
const router = express.Router();
import UserController from "../controllers/User.controller.js";



//router.get("/:id", TeamController.getTeamById);
router.post("/", UserController.addUser);
router.get("/", UserController.getUsers);
router.delete("/:user_id", UserController.deleteUser);
router.put("/", UserController.updateUser);


export default router;