import express from "express";
import { runCode } from "../controllers/compilerControllers.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/compiler/run", requireAuth, runCode);

export default router;