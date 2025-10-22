const express = require("express");
const dbConnect = require("./config/database");
const User = require("./model/user");
require("dotenv").config();
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(authRouter);
app.use(profileRouter);
app.use(requestRouter);
app.use(userRouter);

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

dbConnect()
  .then(() => {
    console.log("db connected successfully");
    app.listen(3000, () => {
      console.log("server running at 3000");
    });
  })
  .catch((err) => console.log("something went wrong with db : ", err));
