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

const rawFrontendUrl = process.env.FRONTEND_URL || "";
const frontendUrlNormalized = rawFrontendUrl.replace(/\/$/, "");

const allowedOrigins = [
  "http://localhost:5173",
  frontendUrlNormalized,
  `${frontendUrlNormalized}/`
].filter(Boolean);

const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});



app.use(cors({ origin: allowedOrigins, credentials: true }));

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

// --- PeerJS on its own separate server, not sharing `server` above ---
const peerApp = express();
const peerHttpServer = createServer(peerApp);
const peerServer = ExpressPeerServer(peerHttpServer, { path: "/peerjs" });
peerApp.use("/peer", peerServer);

const PEER_PORT = process.env.PEER_PORT || 3001;
peerHttpServer.listen(PEER_PORT, () =>
  console.log(`PeerJS signaling server running on port ${PEER_PORT}`)
);