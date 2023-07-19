const express = require("express");
const route = express.Router();
const {
  updateProfile,
  deleteAccount,
  getUserById,
  getAllUser,
  getCurrentUser,
  followUser,
  unFollowUser,
} = require("../controller/userController");
const upload = require("../middleware/multer");

route.patch("/update-profile", upload, updateProfile);
route.delete("/delete-account", deleteAccount);
route.get("/get-user/:id", getUserById);
route.get("get-all-user", getAllUser);
route.get("/get-current-user", getCurrentUser);
route.post("/follow-user/:id", followUser);
route.delete("/unfollow-user/:id", unFollowUser);

module.exports = route;
