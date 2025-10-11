const express = require("express");
const { userAuth } = require("./middleware/auth");
const dbConnect = require("./config/database");
const User = require("./model/user");
const {
  validateSignUpData,
  validateLoginData,
} = require("./utils/validations");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req.body);

    const { firstName, lastName, email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);

    await User.create({
      password: hashPassword,
      firstName,
      lastName,
      email,
    });

    res.send("user added successfully");
  } catch (error) {
    console.error(error);
    res.status(400).send("ERROR : " + error.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    validateLoginData(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    res.send("login successful");
  } catch (error) {
    console.error(error);
    res.status(400).send("Error:" + error.message);
  }
});

app.get("/user", async (req, res) => {
  try {
    const userEmail = req.body.email;
    const user = await User.find({ email: userEmail }).exec();
    if (!user.length) res.status(404).send("user not found");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(400).send("cannot find user: " + error.message);
  }
});

app.patch("/user/:userId", async (req, res) => {
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

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send({ users });
  } catch (error) {
    res.status(400).send("cannot find people: " + error.message);
  }
});

dbConnect()
  .then(() => {
    console.log("db connected successfully");
    app.listen(3000, () => {
      console.log("server running at 3000");
    });
  })
  .catch((err) => console.log("something went wrong with db : ", err));
