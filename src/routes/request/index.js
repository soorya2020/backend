const express = require("express");
const router = express.Router();
const { userAuth } = require("../../middleware/auth");

const User = require("../../model/user");
const ConnectionRequest = require("../../model/connectionRequest");

// TODO: MOVE THIS TO  PROFILE
router.patch("/user/:userId", async (req, res) => {
  try {
    const userId = req.params?.userId;

    const data = req.body;

    const ALLOWED_UPDATES = [
      "gender",
      "age",
      "profileUrl",
      "about",
      "skills",
      "email",
    ];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("update not possible");
    }
    const user = await User.findByIdAndUpdate(userId, data, {
      runValidators: true,
    });
    console.log("update: " + user);

    res.status(201).send("user updated successfully");
  } catch (error) {
    console.error(error);
    res.status(400).send("unable to updata: " + error.message);
  }
});

router.post("/request/send/:status/:userId", userAuth, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;
    const requestStatus = req.params.status;
    const ALLOWED_REQUEST_STATUS = ["ignored", "interested"];

    // ✅ Validate request status
    const isStatusAllowed = ALLOWED_REQUEST_STATUS.includes(requestStatus);
    if (!isStatusAllowed) {
      throw new Error(`${requestStatus} is invalid status value`);
    }
    // ✅ Check if receiver exists
    const targetUserExist = await User.findOne({ _id: targetUserId });
    if (!targetUserExist) {
      throw new Error("cannot find user");
    }
    // ✅ Check if connection already exists
    const existingConnection = await ConnectionRequest.find({
      $or: [
        {
          fromUserId: currentUserId,
          toUserId: targetUserId,
          status: requestStatus,
        },
        {
          fromUserId: targetUserId,
          toUserId: currentUserId,
          status: requestStatus,
        },
      ],
    });
    if (existingConnection.length !== 0) {
      throw new Error("connection request already exist");
    }
    // ✅ Prevent sending request to self
    if (currentUserId.equals(targetUserId)) {
      throw new Error("cannot send request to yourself");
    }
    // ✅ Create and save new connection request
    const connectionRequest = new ConnectionRequest({
      fromUserId: currentUserId,
      toUserId: targetUserId,
      status: requestStatus,
    });
    const newConnectionData = await connectionRequest.save();
    res.status(200).json({
      message: `${requestStatus} successfully`,
      data: newConnectionData,
    });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

router.post(
  "/request/review/:status/:connectionRequestId",
  userAuth,
  async (req, res) => {
    try {
      const currentUserId = req.user._id;
      const connectionRequestId = req.params.connectionRequestId;
      const reviewStatus = req.params.status;

      //check status validity
      const ALLOWED_REQUEST_STATUS = ["rejected", "accepted"];
      if (!ALLOWED_REQUEST_STATUS.includes(reviewStatus)) {
        throw new Error("invalid request status");
      }
      //check connetionid does exist in db
      const connectionRequest = await ConnectionRequest.findOne({
        _id: connectionRequestId,
        toUserId: currentUserId,
        status: "interested",
      });

      if (!connectionRequest) {
        throw new Error("connection request not found");
      }

      connectionRequest.status = reviewStatus;
      const data = await connectionRequest.save();
      res
        .status(201)
        .json({ message: `${reviewStatus} successfully`, data: data });
    } catch (error) {
      console.log(error);
      
      res.status(400).send("ERROR: " + error.message);
    }
  }
);

module.exports = router;
