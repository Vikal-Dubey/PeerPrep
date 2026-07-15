import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/requireAuth.js";
import { analyzeResume } from "../controllers/resumeControllers.js";

const upload = multer({
  storage: multer.memoryStorage(), // no need to write to disk, we parse in-memory
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cap
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

const router = express.Router();

router.post("/resume/analyze", requireAuth, upload.single("resume"), analyzeResume);

export default router;