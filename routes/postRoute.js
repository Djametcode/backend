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
  getCommentById,
  unLikeComment,
  getPostById,
} = require("../controller/postController");
const upload = require("../middleware/multer");

route.post("/create-post", upload, createPost);
route.get("/get-my-post", getMyPost);
route.get("/get-post/:id", getPostById);
route.delete("/delete-post/:id", deletePost);
route.patch("/update-post/:id", upload, updatePost);
route.post("/like-post/:id", likePost);
route.delete("/unlike-post/:id", unLikePost);
route.post("/comment-post/:id", upload, commentPost);
route.delete("/delete-comment/:id", deleteComment);
route.post("/like-comment/:id", likeComment);
route.post("/reply-comment/:id", upload, replyComment);
route.get("/get-comment/:id", getCommentById);
route.delete("/unlike-comment/:id", unLikeComment);

module.exports = route;
