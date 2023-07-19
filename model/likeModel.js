const mongoose = require("mongoose");
const { Schema } = mongoose;

const likeSchema = new Schema({
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  timeLiked: {
    type: Date,
    default: Date.now(),
  },
  postId: {
    type: mongoose.Types.ObjectId,
    ref: "Post",
  },
  commentId: {
    type: mongoose.Types.ObjectId,
    ref: "Comment",
  },
});

module.exports = mongoose.model("Like", likeSchema);
