const express = require("express");
const route = express.Router();
const {
  createPost,
  getMyPost,
  deletePost,
  updatePost,
  likePost,
  unLikePost,
  commentPost,
  deleteComment,
  likeComment,
  replyComment,
} = require("../controller/postController");
const upload = require("../middleware/multer");

route.post("/create-post", upload, createPost);
route.get("/get-my-post", getMyPost);
route.delete("/delete-post/:id", deletePost);
route.patch("/update-post/:id", updatePost);
route.post("/like-post/:id", likePost);
route.delete("/unlike-post/:id", unLikePost);
route.post("/comment-post/:id", commentPost);
route.delete("/delete-comment/:id", deleteComment);
route.post("/like-comment/:id", likeComment);
route.post("/reply-comment/:id", replyComment);

module.exports = route;
