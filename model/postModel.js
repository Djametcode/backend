const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema({
  text: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  timePosted: {
    type: Date,
    default: Date.now(),
  },
  like: {
    type: Array,
    default: [],
  },
  comment: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("Post", postSchema);
