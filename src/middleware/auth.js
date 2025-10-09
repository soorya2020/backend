const userAuth = (req, res, next) => {
  if (true) {
    console.log("soorya");
    next();
  } else {
    res.send("unautharised");
  }
};

module.exports = {
  userAuth,
};
