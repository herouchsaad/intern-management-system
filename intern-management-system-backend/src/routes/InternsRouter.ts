import express from "express";
const router = express.Router();
import InternController from "../controllers/Intern.controller.js";
import ROLES_LIST from "../../roles_list.js";
import verifyRole from "../middleware/verifyRole.js";





  router.get("/", verifyRole(ROLES_LIST.Admin, ROLES_LIST.Supervisor), InternController.getInterns);

  router.get("/:username", verifyRole(ROLES_LIST.Admin, ROLES_LIST.Supervisor, ROLES_LIST.Intern), InternController.getInternByUsername);

  router.get("/:intern_id/documents", verifyRole(ROLES_LIST.Admin, ROLES_LIST.Intern), InternController.getDocuments);
  
  router.delete("/:id", verifyRole(ROLES_LIST.Admin), InternController.deleteIntern);
  
  router.post("/", verifyRole(ROLES_LIST.Admin), InternController.addIntern);

  router.put("/:id", verifyRole(ROLES_LIST.Admin, ROLES_LIST.Intern), InternController.updateIntern);


export default router;