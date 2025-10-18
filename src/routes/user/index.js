const express = require("express");
const { userAuth } = require("../../middleware/auth");
const ConnectionRequest = require("../../model/connectionRequest");
const router = express.Router();
const { formatFetchData } = require("./helper");
const User = require("../../model/user");

const SAFE_USER_FIELDS = "firstName lastName age about skills profileUrl";

router.get("/user/request/recieved", userAuth, async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const requests = await ConnectionRequest.find({
      toUserId: currentUserId,
      status: "interested",
    }).populate({
      path: "fromUserId",
      select: SAFE_USER_FIELDS,
    });

    const data = formatFetchData(requests);

    res.status(200).json({ message: "data fetched successfully", data });
  } catch (error) {
    res.status(400).send("Error : " + error.message);
  }
});

router.get("/user/request/connections", userAuth, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    //you need the from user id and to user id data to populate and remove the from
    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: currentUserId, status: "accepted" },
        { toUserId: currentUserId, status: "accepted" },
      ],
    })
      .populate({
        path: "fromUserId",
        select: SAFE_USER_FIELDS,
      })
      .populate({
        path: "toUserId",
        select: SAFE_USER_FIELDS,
      });

    const connectionWithoutCurrentUser = connections.map((row) => {
      if (row.fromUserId.equals(currentUserId)) {
        return row.toUserId;
      } else {
        return row.fromUserId;
      }
    });

    res.json({
      message: "connection fetched successfully",
      data: connectionWithoutCurrentUser,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send("Error : " + error.message);
  }
});

router.get("/user/feeds", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const page = parseInt(req.query?.page) || 1;
    const limit = parseInt(req.query?.limit) || 10;
    const skip = (page - 1) * limit;

    const userConnections = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUserId }, { toUserId: loggedInUserId }],
    });

    const excludedUserIds = new Set();
    userConnections.forEach((user) => {
      excludedUserIds.add(user.fromUserId.toString());
      excludedUserIds.add(user.toUserId.toString());
    });
    const excludedUserIdList = Array.from(excludedUserIds);

    const suggestedUsers = await User.find({
      _id: { $nin: excludedUserIdList },
    })
      .select(SAFE_USER_FIELDS)
      .skip(skip)
      .limit(limit);

    res
      .status(200)
      .json({ message: "feeds fetched successfully", data: suggestedUsers });
  } catch (error) {
    console.error(error);
    res.status(400).send("Error : " + error.message);
  }
});

module.exports = router;
