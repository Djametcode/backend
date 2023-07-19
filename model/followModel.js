const mongoose = require("mongoose");
const { Schema } = mongoose;

const followerSchema = new Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  target: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  timeFollowing: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Follower", followerSchema);
