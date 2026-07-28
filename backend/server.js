import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";
import resumeRoutes from "./routes/resumeRoutes.js";


import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import compilerRoutes from "./routes/compilerRoutes.js";
import { registerSocketHandlers } from "./sockets/socketHandlers.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();
const server = createServer(app);

const checkOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  const normalized = origin.trim().toLowerCase();
  
  const isAllowed = normalized.includes("localhost") || 
                    normalized.includes("127.0.0.1") || 
                    normalized.includes("vercel.app") || 
                    (process.env.FRONTEND_URL && normalized.includes(process.env.FRONTEND_URL.replace(/https?:\/\//i, "").replace(/\/$/, "").toLowerCase()));
                    
  if (isAllowed) {
    callback(null, true);
  } else {
    console.log("CORS blocked origin:", origin);
    callback(new Error("Not allowed by CORS"));
  }
};

const io = new Server(server, {
  cors: { origin: checkOrigin, credentials: true },
});

app.use(cors({ origin: checkOrigin, credentials: true }));

app.use(express.json());
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", roomRoutes);
app.use("/api", compilerRoutes);
app.use("/api", resumeRoutes);
app.use("/api", aiRoutes);


registerSocketHandlers(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// --- PeerJS signaling server integrated into the main Express server ---
const peerServer = ExpressPeerServer(server, { path: "/peerjs" });
app.use(peerServer);