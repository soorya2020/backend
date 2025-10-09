const mongoose = require("mongoose");
const uri =
  "mongodb+srv://sooryakrishnanunni_db_user:fUZvBAMEavQqyl2V@cluster0.28vv3on.mongodb.net/dev_connect?retryWrites=true&w=majority&appName=Cluster0";
const dbConnect = async () => {
  await mongoose.connect(uri);
};

module.exports = dbConnect;
