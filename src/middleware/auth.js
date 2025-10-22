const jwt = require("jsonwebtoken");
const User = require("../model/user");

const SECRET_KEY = "soorya@dev123";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      res.status(401).json({ message: "please login" });
    }
    const { _id: userId } = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("user not found");
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(error.message);
    res.status(400).send("Error:" + error.message);
  }
};

module.exports = {
  userAuth,
};
