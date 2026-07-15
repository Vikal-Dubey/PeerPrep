import { prisma } from "../db/prismaClient.js";

// In-memory room state — fine for a single-server setup.
// rooms: roomId -> [{ socketId, username, peerId }]
// roomState: roomId -> { code, language, notes } (latest editor/notepad content)
const rooms = new Map();
const roomState = new Map();

export const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // A user joins a room. Also handles the case where their peerId was
    // already registered via "update-peer-id" before this event arrived
    // (the two events can race — this upserts either way).
    socket.on("joinRoom", async ({ roomId, username, peerId }) => {
      const room = await prisma.room.findUnique({ where: { code: roomId } });

      if (!room || room.status !== "ACTIVE") {
        socket.emit("room-error", { message: "Room not found" });
        return;
      }

      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.username = username;

      if (!rooms.has(roomId)) rooms.set(roomId, []);
      const roomUsers = rooms.get(roomId);

      let userEntry = roomUsers.find((u) => u.socketId === socket.id);
      if (!userEntry) {
        userEntry = { socketId: socket.id, username, peerId };
        roomUsers.push(userEntry);
      } else {
        userEntry.username = username;
        if (peerId) userEntry.peerId = peerId;
      }

      console.log(`${username} (${socket.id}) joined room ${roomId}`);

      io.to(roomId).emit("room-users", roomUsers);
      socket.to(roomId).emit("user-joined", { socketId: socket.id, username, peerId });

      // Send the newly joined socket a snapshot of the room's current
      // code/notes, so they don't see a blank editor if they joined late.
      const currentState = roomState.get(roomId);
      if (currentState) {
        socket.emit("room-state", currentState);
      }
    });

    // Collaborative code editor sync
    socket.on("code-change", ({ roomId, code, language }) => {
      roomState.set(roomId, {
        ...(roomState.get(roomId) || {}),
        code,
        language,
      });
      socket.to(roomId).emit("code-update", { code, language });
    });

    // Cursor/selection sync
    socket.on("cursor-change", ({ roomId, position, username }) => {
      socket.to(roomId).emit("cursor-update", { socketId: socket.id, position, username });
    });

    // Notepad sync
    socket.on("text-change", ({ roomId, content }) => {
      roomState.set(roomId, {
        ...(roomState.get(roomId) || {}),
        notes: content,
      });
      socket.to(roomId).emit("text-update", { content });
    });

    // Registers/updates this socket's PeerJS id for video calls. May arrive
    // before or after "joinRoom" — upserts either way to avoid a race.
    socket.on("update-peer-id", ({ roomId, peerId }) => {
      socket.data.peerId = peerId;

      if (!rooms.has(roomId)) rooms.set(roomId, []);
      const roomUsers = rooms.get(roomId);

      let userEntry = roomUsers.find((u) => u.socketId === socket.id);
      if (!userEntry) {
        userEntry = { socketId: socket.id, username: socket.data.username || "Guest", peerId };
        roomUsers.push(userEntry);
      } else {
        userEntry.peerId = peerId;
      }

      io.to(roomId).emit("room-users", roomUsers);
    });

    // Code compiler (Judge0) — broadcast run status/output to everyone
    socket.on("run-code-start", ({ roomId }) => {
      socket.to(roomId).emit("code-running");
    });

    socket.on("code-output", ({ roomId, output }) => {
      io.to(roomId).emit("output-update", output);
    });

    socket.on("ai-questions", ({ roomId, questions }) => {
      socket.to(roomId).emit("ai-questions-update", questions);
    });

    socket.on("ai-evaluation", ({ roomId, evaluation, question }) => {
      socket.to(roomId).emit("ai-evaluation-update", { evaluation, question });
    });

    socket.on("leaveRoom", ({ roomId }) => {
      leaveRoom(socket, roomId, io);
    });

    socket.on("disconnect", () => {
      const roomId = socket.data.roomId;
      if (roomId) {
        leaveRoom(socket, roomId, io);
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

// Removes a socket from a room's participant list and cleans up room
// state entirely once the room is empty.
function leaveRoom(socket, roomId, io) {
  socket.leave(roomId);

  if (rooms.has(roomId)) {
    const roomUsers = rooms.get(roomId).filter((u) => u.socketId !== socket.id);
    rooms.set(roomId, roomUsers);

    io.to(roomId).emit("room-users", roomUsers);
    socket.to(roomId).emit("user-left", { socketId: socket.id });

    if (roomUsers.length === 0) {
      rooms.delete(roomId);
      roomState.delete(roomId);
    }
  }
}