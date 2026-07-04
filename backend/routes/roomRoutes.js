import express from "express";
import { createRoom, joinRoom, getRoomByCode } from "../controllers/roomControllers.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/rooms", requireAuth, createRoom);       // Create Meeting
router.post("/rooms/join", requireAuth, joinRoom);    // Join Meeting (validate code)
router.get("/rooms/:code", requireAuth, getRoomByCode); // Used by Room page on load

export default router;