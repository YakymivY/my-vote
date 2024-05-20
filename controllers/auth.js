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
      return res
        .status(409)
        .json({ message: "User with that login already exists" });
    }
    await User.createUser(name, login, password);
    res.status(200).json({ redirect: `/auth/login` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.login = async (req, res, next) => {
  const login = req.body.login;
  const password = req.body.password;
  try {
    const user = await User.fetchByLogin(login);
    const checkPass = await User.comparePassword(password, user.password);
    if (!user || !checkPass) {
      return res.status(401).json({ message: "Invalid login or password" });
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    await Session.createSession(user.id, token, expiresAt);
    res.status(200).json({
      redirect: `/`,
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.logout = async (req, res, next) => {
  const tokenString = req.headers["authorization"];
  if (!token) {
    res.status(500).json({ message: "Log out failed" });
    return;
  }
  try {
    const token = tokenString && tokenString.split(" ")[1];
    let session = await Session.fetchByToken(token);
    if (!session) {
      res.status(500).json({ message: "Log out failed. Token is damaged." });
      return;
    }

    const userId = session.userId;
    await Session.deleteByUser(userId);
    res.status(200).json({ redirect: `/` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getLogin = async (req, res, next) => {
  const tokenString = req.headers["authorization"]
    ? req.headers["authorization"]
    : null;
  const token = tokenString && tokenString.split(" ")[1];
  res.status(200).json({ token });
};

exports.getRegister = async (req, res, next) => {
  const tokenString = req.headers["authorization"]
    ? req.headers["authorization"]
    : null;
  const token = tokenString && tokenString.split(" ")[1];
  res.status(200).json({ token });
};
