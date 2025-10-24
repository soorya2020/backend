const mongoose = require("mongoose");

const dbConnect = async () => {
  await mongoose.connect(process.env.DB_SECRET_STRING);
};

module.exports = dbConnect;
