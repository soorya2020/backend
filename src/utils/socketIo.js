const socket = require("socket.io");

const Chat = require("../model/chat");

const initializeSocket = (httpServer) => {
  const io = socket(httpServer, {
    cors: {
      origin: [
        "http://localhost:4000",
        "https://gittogether.co.in",
        "http://localhost:5173",
      ], // allowed origins
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ userId, toUserId }) => {
      const roomId = [userId, toUserId].sort().join("_");
      socket.join(roomId);
    });
    socket.on("sendMessage", async ({ firstName, userId, toUserId, text }) => {
      try {
        const roomId = [userId, toUserId].sort().join("_");
        let chat = await Chat.findOne({
          participants: { $all: [userId, toUserId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [userId, toUserId],
            messages: [],
          });
        }
        chat.messages.push({ senderId: userId, text });
        await chat.save();
        io.to(roomId).emit("messageRecieved", {
          senderId: userId,
          firstName,
          text,
        });
      } catch (error) {
        console.error(error);
      }
    });
    socket.on("disconnect", () => {});
  });
};

module.exports = { initializeSocket };
