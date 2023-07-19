const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema({
  text: {
    type: String,
    required: [true],
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  reply: {
    type: Array,
    default: [],
  },
  likes: {
    type: Array,
    default: [],
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

module.exports = mongoose.model("Comment", commentSchema);
