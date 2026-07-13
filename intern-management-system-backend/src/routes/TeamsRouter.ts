import express from "express";
const router = express.Router();
import TeamController from "../controllers/Team.controller.js";
import verifyJWT from "../middleware/verifyJWT.js";

router.get("/", TeamController.getTeam);
router.get("/:id", verifyJWT, TeamController.getTeamById);
router.delete("/:team_id", verifyJWT, TeamController.deleteTeam);
router.post("/", verifyJWT, TeamController.addTeam);
router.put("/:id", verifyJWT, TeamController.updateTeam)

export default router;