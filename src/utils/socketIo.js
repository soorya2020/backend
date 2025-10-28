const socket = require("socket.io");

const Chat = require("../model/chat");

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
    socket.on("sendMessage", async ({ firstName, userId, toUserId, text }) => {
      try {
        const roomId = [userId, toUserId].sort().join("_");
        let chat = await Chat.findOne({
          participants: { $all: [userId, toUserId] },
        });
        console.log(chat);

        if (!chat) {
          console.log(chat);
          chat = new Chat({
            participants: [userId, toUserId],
            messages: [],
          });
        }
        chat.messages.push({ senderId: userId, text });
        await chat.save();
        io.to(roomId).emit("messageRecieved", { senderId:userId,firstName, text });
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("disconnect", () => {});
  });
};

module.exports = { initializeSocket };
