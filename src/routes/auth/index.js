const express = require("express");
const router = express.Router();
const User = require("../../model/user");
const { userAuth } = require("../../middleware/auth");

const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const {
  validateSignUpData,
  validateLoginData,
  validatePassword,
} = require("../../utils/validations");
const bcrypt = require("bcrypt");

router.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req.body);

    const { firstName, lastName, email, password, age, gender, skills } =
      req.body;
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      password: hashPassword,
      firstName,
      lastName,
      email,
      age,
      gender,
      skills,
    });

    const token = user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "DEV",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    res.status(200).json({ message: "user added successfully", data: user });
  } catch (error) {
    console.error(error.message);
    if (error.code === 11000) {
      // Duplicate key error from MongoDB
      return res.status(400).send("ERROR: user with this email already exists");
    }
    res.status(400).send("ERROR : " + error.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password: passwordInputByUser } = req.body;
    validateLoginData(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await user.validatePassword(passwordInputByUser);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "DEV",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });
    const { password, ...safeUserValues } = user.toObject();
    res.status(200).json({
      message: "login successful",
      user: safeUserValues,
      // user: {
      //   _id: user._id,
      //   firstName: user.firstName,
      //   lastName: user.lastName,
      //   age: user?.age,
      //   skills: user?.skills,
      //   about: user?.about,
      //   profileUrl: user?.profileUrl,
      // },
    });
  } catch (error) {
    console.error(error);
    res.status(400).send("Error:" + error.message);
  }
});

router.put("/password", userAuth, async (req, res) => {
  try {
    const { newPassword, oldPassword } = req.body;
    const loggedInUser = req.user;
    const isPasswordValid = await loggedInUser.validatePassword(oldPassword);

    if (!isPasswordValid) {
      res.send("old password do not match");
    }

    if (!validatePassword(newPassword)) {
      throw new Error("Password is invalid!");
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);

    loggedInUser.password = hashPassword;
    await loggedInUser.save();
    res.send("password updated successfully!");
  } catch (error) {
    res.status(400).send("Error:" + error.message);
  }
});

router.post("/logout", (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now()), // or Date.now()
    });

    res.status(200).json({ message: "logout successfull" });
  } catch (error) {
    res.status(400).send("Error:" + error.message);
  }
});

router.post("/auth/google-login", async (req, res) => {
  try {
    const { credential } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        firstName: name,
        googleId: sub,
        profileUrl: picture,
      });
    }

    // Create JWT
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set as cookie
    res.cookie("token", token, {
      secure: true,
      httpOnly: true,
      sameSite: "lax",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    res.status(200).json({ message: "Google login successful", user });
  } catch (error) {
    console.error(error);

    res.status(400).json({ message: "Google login failed" });
  }
});

module.exports = router;
