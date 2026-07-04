import { prisma } from "../db/prismaClient.js";
import { generateRoomCode } from "../utils/generateRoomCode.js";

export const createRoom = async (req, res) => {
  try {
    const code = generateRoomCode();

    const room = await prisma.room.create({
      data: { code, hostId: req.userId },
    });

    res.status(201).json({
      code: room.code,
      link: `${process.env.FRONTEND_URL}/room/${room.code}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "Room code is required" });

    const room = await prisma.room.findUnique({ where: { code } });

    if (!room || room.status !== "ACTIVE") {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({ code: room.code });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRoomByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const room = await prisma.room.findUnique({ where: { code } });

    if (!room || room.status !== "ACTIVE") {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({ code: room.code, hostId: room.hostId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};