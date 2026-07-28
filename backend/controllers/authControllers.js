import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prismaClient.js";

// Helper to resolve CORS cookies in production cross-origin deployments
const getCookieOptions = (req) => {
  const host = req.headers.host || "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  return {
    httpOnly: true,
    secure: !isLocal,
    sameSite: !isLocal ? "none" : "lax",
  };
};

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, getCookieOptions(req));
    res.status(201).json({
      token,
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, getCookieOptions(req));
    res.status(200).json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {id: req.userId },
      select: {id: true, username: true, email: true}
    });

    if(!user) {
      return res.status(404).json({message: "User not found"});
    }
    
    res.set("Cache-Control", "no-store"); // prevent browser caching this response
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message});
  }
}

export const logoutUser = (req, res) => {
  const options = getCookieOptions(req);
  res.cookie("token", "", {
    ...options,
    expires: new Date(0), // clear cookie immediately
  });
  res.status(200).json({ message: "Logged out successfully" });
};