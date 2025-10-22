const express = require("express");
const router = express.Router();
const User = require("../../model/user");
const { userAuth } = require("../../middleware/auth");
const SAFE_USER_FIELDS = "firstName lastName age about skills profileUrl";

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
    res.status(200).json({
      message: "login successful",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        age: user?.age,
        skills: user?.skills,
        about: user?.about,
        profileUrl: user?.profileUrl,
      },
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
    console.log(isPasswordValid);

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
    // res.cookie("token", null, {
    //   expires: new Date(Date.now()),
    // });

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

module.exports = router;
