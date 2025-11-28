require("dotenv").config();
const express = require("express");
const dbConnect = require("./config/database");
const User = require("./model/user");
require("dotenv").config();
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/chat");

const http = require("http");

require("./utils/cornJob");
const { initializeSocket } = require("./utils/socketIo");

const cookieParser = require("cookie-parser");
const cors = require("cors");

const isProduction = process.env.NODE_ENV === "production";

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:4000",
  "https://gittogether.co.in",
  "http://v2.gittogether.co.in",
  "https://v2.gittogether.co.in",
  "http://v2.gittogether.co.in:4000",
  "http://www.v2.gittogether.co.in",
  "http://localhost:5173",
  "http://localhost:5000",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  })
);

// app.use(
//   cors({
//     origin: allowedOrigins,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
//     credentials: true,
//   })
// );

app.use(authRouter);
app.use(profileRouter);
app.use(requestRouter);
app.use(userRouter);
app.use(paymentRouter);
app.use(chatRouter);

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

    res.status(201).send("user updated successfully");
  } catch (error) {
    console.error(error);
    res.status(400).send("unable to updata: " + error.message);
  }
});

const httpServer = http.createServer(app);

initializeSocket(httpServer);

dbConnect()
  .then(() => {
    console.log("db connected successfully");
    httpServer.listen(process.env.PORT, () => {
      console.log(
        `✅ Server running on port ${process.env.PORT} in ${process.env.NODE_ENV} `
      );
    });
  })
  .catch((err) => console.log("something went wrong with db : ", err));
