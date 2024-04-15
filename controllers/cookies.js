exports.setUserCookies = (req, res, next) => {
    res.cookie("userId", "1");
  res.cookie("userName", "John Doe");
    next();
  }