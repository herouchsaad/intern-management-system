import express from "express";
const router = express.Router();
import UploadController from "../controllers/Upload.controller.js";
import { verify } from "crypto";
import verifyJWT from "../middleware/verifyJWT.js";

router.post("/photos", UploadController.uploadPhoto);
router.post("/cv", UploadController.uploadCV);
router.delete("/garbage/:fileName", UploadController.deleteFromGarbage);


router.post("/documents", verifyJWT, UploadController.uploadDocument);
router.delete("/documents/:fileName", verifyJWT,UploadController.deleteDocument);
router.get("/documents/:id", verifyJWT, UploadController.getDocument);

router.get("/photos/:id", verifyJWT, UploadController.getPhoto);
router.get("/cv/:id", verifyJWT, UploadController.getCv);
router.delete("/cv/:fileName", verifyJWT, UploadController.deleteCv);
router.delete("/photos/:fileName", verifyJWT, UploadController.deletePhoto);


export default router;