// Tracks which users are in which room: { roomId: [{ socketId, username }] }
const rooms = new Map();

export const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("joinRoom", ({ roomId, username }) => {
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.username = username;

      if (!rooms.has(roomId)) rooms.set(roomId, []);
      const roomUsers = rooms.get(roomId);

      // Avoid duplicate entries on reconnect
      const alreadyIn = roomUsers.find((u) => u.socketId === socket.id);
      if (!alreadyIn) {
        roomUsers.push({ socketId: socket.id, username });
      }

      console.log(`${username} (${socket.id}) joined room ${roomId}`);

      // Notify everyone in the room of the updated participant list
      io.to(roomId).emit("room-users", roomUsers);

      // Let others know someone joined
      socket.to(roomId).emit("user-joined", { socketId: socket.id, username });
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

function leaveRoom(socket, roomId, io) {
  socket.leave(roomId);

  if (rooms.has(roomId)) {
    const roomUsers = rooms.get(roomId).filter((u) => u.socketId !== socket.id);
    rooms.set(roomId, roomUsers);

    io.to(roomId).emit("room-users", roomUsers);
    socket.to(roomId).emit("user-left", { socketId: socket.id });

    if (roomUsers.length === 0) {
      rooms.delete(roomId);
    }
  }
}