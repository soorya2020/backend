const socket = require("socket.io");
const Chat = require("../model/chat");

const initializeSocket = (httpServer) => {
  const io = socket(httpServer, {
    cors: {
      origin: [
        "http://localhost:4000",
        "https://gittogether.co.in",
        "http://localhost:5173",
        "http://localhost:5174",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // 1. Join Room
    socket.on("joinChat", ({ userId, toUserId }) => {
      const roomId = [userId, toUserId].sort().join("_");
      socket.join(roomId);
    });

    // 2. Handle Sending Message
    socket.on("sendMessage", async ({ firstName, userId, toUserId, text }) => {
      try {
        const roomId = [userId, toUserId].sort().join("_");

        let chat = await Chat.findOne({
          participants: { $all: [userId, toUserId] },
        });

        if (!chat) {
          chat = new Chat({ participants: [userId, toUserId], messages: [] });
        }

        const newMessage = {
          senderId: userId,
          text,
          status: "delivered", // Server got it, so it's "delivered" to the system
          createdAt: new Date(),
        };

        chat.messages.push(newMessage);
        const savedChat = await chat.save();

        // Get the last message to get the real MongoDB _id
        const savedMessage = savedChat.messages[savedChat.messages.length - 1];

        // 1. BROADCAST to the room (Receiver gets this)
        // We use .except(socket.id) to avoid sending it back to you (prevents duplicates)
        socket.to(roomId).emit("messageReceived", {
          _id: savedMessage._id,
          senderId: userId,
          firstName,
          text,
          status: "delivered",
          createdAt: savedMessage.createdAt,
        });

        // 2. ACKNOWLEDGMENT to the Sender (You get this)
        // This tells your UI: "The message is safely in the DB"
        socket.emit("messageSentAck", {
          _id: savedMessage._id,
          status: "delivered",
          text: text, // used to identify which local message to update
        });
      } catch (error) {
        console.error("Send Message Error:", error);
      }
    });

    // 3. Handle "Mark as Seen" (The Blue Tick Emitter)
    socket.on("markAsSeen", async ({ senderId, receiverId }) => {
      try {
        const roomId = [senderId, receiverId].sort().join("_");

        // Update DB so that if they refresh, it stays blue
        await Chat.updateOne(
          { participants: { $all: [senderId, receiverId] } },
          { $set: { "messages.$[elem].status": "seen" } },
          {
            arrayFilters: [
              { "elem.senderId": senderId, "elem.status": { $ne: "seen" } },
            ],
          },
        );

        // BROADCAST back to the room so the sender sees the blue ticks NOW
        io.to(roomId).emit("statusUpdate", { senderId, status: "seen" });
      } catch (error) {
        console.error(error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = { initializeSocket };
