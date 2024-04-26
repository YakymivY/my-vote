const User = require("../models/user");
const Session = require("../models/session");
const { v4: uuidv4 } = require("uuid");

exports.register = async (req, res, next) => {
  const name = req.body.name;
  const login = req.body.login;
  const password = req.body.password;
  try {
    const existingUser = await User.fetchByLogin(login);
    if (existingUser[0].length) {
      return res.status(409).send("User with that login already exists");
    }
    await User.create(name, login, password);
    res.redirect(`/auth/login`);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating user");
  }
};

exports.login = async (req, res, next) => {
  const login = req.body.login;
  const password = req.body.password;
  try {
    const user = await User.fetchByLogin(login);
    if (
      !user[0][0] ||
      !(await User.comparePassword(password, user[0][0].password))
    ) {
      return res.status(401).send("Authentication failed");
    }

    const token = uuidv4();
    const expires_at = new Date(Date.now() + 1000 * 360 * 10 * 24)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    await Session.create(user[0][0].id, token, expires_at);

    res.cookie("userId", user[0][0].id, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.redirect(`/`);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error logging in");
  }
};

exports.logout = async (req, res, next) => {
  if (!req.cookies.userId) {
    res.status(500).send("Log out failed");
    return;
  }
  await Session.deleteByUser(req.cookies.userId);
  res.cookie("userId", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.redirect(`/`);
};

exports.getLogin = async (req, res, next) => {
  const userId = req.cookies.userId ? req.cookies.userId : null;
  res.render("auth/login", { req, userId });
};

exports.getRegister = async (req, res, next) => {
  const userId = req.cookies.userId ? req.cookies.userId : null;
  res.render("auth/register", { req, userId });
};
