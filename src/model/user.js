const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const SECRET_KEY = "soorya@dev123";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, " first name is required"],
      minLength: [3, "min 3 character is needed"],
      trim: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "emial is not valid",
      },
    },
    password: {
      type: String,
      required: "true",
    },
    age: {
      type: String,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "Gender must be either male, female, or other",
      },
    },
    about: {
      type: String,
    },
    skills: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "cannot add more than 5 skills",
      },
    },
    profileUrl: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880",
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    memberShipType: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = function () {
  const userId = this._id;
  const token = jwt.sign({ _id: userId }, SECRET_KEY, {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const passwordHash = this.password;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );
  return isPasswordValid;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
