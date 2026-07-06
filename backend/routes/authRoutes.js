import express from "express";
import { registerUser, loginUser, getMe, logoutUser } from "../controllers/authControllers.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/logout", logoutUser);
router.post("/login", loginUser);
router.get("/me", requireAuth, getMe);

export default router;