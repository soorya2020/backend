const express = require("express");
const router = express.Router();
const User = require("../../model/user");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "soorya@dev123";
const { userAuth } = require("../../middleware/auth");
const { validateEditProfileData } = require("../../utils/validations");

router.get("/profile/view", userAuth, async (req, res) => {
  try {
    const { token } = req.cookies;
    const { _id: userId } = jwt.verify(token, SECRET_KEY);

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("unautharised access");
    }
    res.send(req.user);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error:" + error.message);
  }
});

router.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req.body)) {
      throw new Error("invalid edit request");
    }

    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
    res
      .status(200)
      .json({ message: "successfully updated", data: loggedInUser });
  } catch (error) {
    console.error(error.message);
    res.status(400).send("Error: " + error.message);
  }
});

router.patch("/profile/password", (req, res) => {
  try {
    res.send("password edited successfully");
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

module.exports = router;
