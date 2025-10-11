const validator = require("validator");

const validateSignUpData = ({ firstName, lastName, email, password }) => {
  if (!firstName || !lastName) {
    throw new Error("Name is not valid!");
  } else if (!validator.isEmail(email)) {
    throw new Error("emial is not valid!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("please enter a strong password");
  }
};

const validateLoginData = ({ email }) => {
  if (!validator.isEmail(email)) {
    throw new Error("Email is invalid");
  }
};

module.exports = { validateSignUpData, validateLoginData };
