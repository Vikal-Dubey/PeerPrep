import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { generateQuestions, evaluateAnswer } from "../controllers/aiControllers.js";

const router = express.Router();

router.post("/ai/generate-questions", requireAuth, generateQuestions);
router.post("/ai/evaluate-answer", requireAuth, evaluateAnswer);

export default router;