const validator = require("validator");

const validateSignUpData = ({ firstName, lastName, email, password }) => {
  if (!firstName) {
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

const validateEditProfileData = (profileData) => {
  const ALLOWED_EDIT_VALUES = [
    "age",
    "gender",
    "about",
    "skills",
    "profileUrl",
  ];
  const userFields = Object.keys(profileData);
  const isValid = userFields.every((key) => ALLOWED_EDIT_VALUES.includes(key));

  if (!isValid) {
    const nonEditableFields = userFields.filter(
      (key) => !ALLOWED_EDIT_VALUES.includes(key)
    );
    throw new Error(`${nonEditableFields}, cannot be edited`);
  }

  return isValid;
};

const validatePassword = (password) => {
  const isValid = validator.isStrongPassword(password);

  return isValid;
};

module.exports = {
  validateSignUpData,
  validateLoginData,
  validatePassword,
  validateEditProfileData,
};
