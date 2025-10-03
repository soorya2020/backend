const express = require("express");

const app = express();

app.get("/test", (req, res) => {
  res.send("this is test apge");
});

app.post("/user", (req, res) => {
  //save user data to db
  res.send("user saved successfully");
});
app.get("/user", (req, res) => {
  res.send({ firstName: "soorya", lastName: "krishnanunni" });
});

app.listen(3000, () => {
  console.log("server running at 3000");
});
