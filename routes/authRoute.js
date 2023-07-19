const express = require("express");
const route = express.Router();
const { registUser, loginUser } = require("../controller/authController");

route.post("/regist-user", registUser);
route.post("/login-user", loginUser);

module.exports = route;
