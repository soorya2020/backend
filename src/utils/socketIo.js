const socket = require("socket.io");

const initializeSocket = (httpServer) => {
  const io = socket(httpServer, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ userId, toUserId }) => {
      const roomId = [userId, toUserId].sort().join("_");
      socket.join(roomId);
    });
    socket.on("sendMessage", ({ firstName, userId, toUserId, message }) => {
  
      const roomId = [userId, toUserId].sort().join("_");
      io.to(roomId).emit("messageRecieved", { firstName, text: message });
    });
    socket.on("disconnect", () => {});
  });
};

module.exports = { initializeSocket };
