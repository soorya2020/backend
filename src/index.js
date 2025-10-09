const express = require("express");
const { userAuth } = require("./middleware/auth");
const dbConnect = require("./config/database");
const User = require("./model/user");

const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
  console.log(req.body);

  try {
    const user = new User(req.body);
    await user.save();
  } catch (error) {
    res.status(400).send("error saving user: " + error.message);
  }

  res.send("user added successfully");
});

dbConnect()
  .then(() => {
    console.log("db connected successfully");
    app.listen(3000, () => {
      console.log("server running at 3000");
    });
  })
  .catch((err) => console.log("something went wrong with db : ", err));
