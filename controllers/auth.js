const User = require("../models/user");
const Session = require("../models/session");
const { v4: uuidv4 } = require("uuid");

exports.register = async (req, res, next) => {
  const name = req.body.name;
  const login = req.body.login;
  const password = req.body.password;
  try {
    const existingUser = await User.fetchByLogin(login);
    if (existingUser) {
      return res.status(409).send("User with that login already exists");
    }
    await User.createUser(name, login, password);
    res.redirect(`/auth/login`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.login = async (req, res, next) => {
  const login = req.body.login;
  const password = req.body.password;
  try {
    const user = await User.fetchByLogin(login);
    if (!user || ! await User.comparePassword(password, user.password)) {
      return res.status(401).send("Invalid login or password");
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    await Session.createSession(user.id, token, expiresAt);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 3600 * 1000,
    });
    res.redirect(`/`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.logout = async (req, res, next) => {
  const token = req.cookies.token
  if (!token) {
    res.status(500).send("Log out failed");
    return;
  }
  try {
    let session = await Session.fetchByToken(token);
    if (!session) {
      res.cookie("token", "", {
        expires: new Date(0),
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res.status(500).send("Log out failed. Token is damaged.");
      return;
    }
    
    const userId = session.userId
    await Session.deleteByUser(userId);
    res.cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.redirect(`/`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getLogin = async (req, res, next) => {
  const userId = req.cookies.token ? req.cookies.token : null;
  res.render("auth/login", { req, userId });
};

exports.getRegister = async (req, res, next) => {
  const userId = req.cookies.token ? req.cookies.token : null;
  res.render("auth/register", { req, userId });
};
