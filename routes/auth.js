const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const authController = require("../controllers/auth");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.get("/login", authController.getLogin);

router.get("/register", authController.getRegister);

router.post("/logout", auth, authController.logout);

module.exports = router;
