const express = require("express");
const router = express.Router();
const Chat = require("../../model/chat");
const { userAuth } = require("../../middleware/auth");
const User = require("../../model/user");
const SAFE_USER_FIELDS =
  "firstName lastName age about skills profileUrl isPremium";

router.get("/chat/:toUserId", userAuth, async (req, res) => {
  try {

    const { toUserId } = req.params;
    const { _id: userId } = req.user;
    const chat = await Chat.findOne({
      participants: { $all: [userId, toUserId] },
      // messages: { $slice: -limit },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, toUserId],
        messages: [],
      });
    }

    res.status(200).json({ message: "chat fetched successfully", data: chat });
  } catch (error) {
    res.status(400).json("Error: " + error.message);
  }
});

router.get("/chat/targetUser/:recieverId", userAuth, async (req, res) => {
  try {
    const { recieverId } = req.params;
    const data = await User.findOne({ _id: recieverId }).select(
      SAFE_USER_FIELDS
    );

    res.status(200).json({ message: "data fetched successfullu", data });
  } catch (error) {
    res.status(400).json("Error: " + error.message);
  }
});

module.exports = router;
