const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "please fill username"],
  },
  email: {
    type: String,
    required: [true, "Please fill email"],
    match: [/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/gm],
  },
  password: {
    type: String,
    required: [true, "Please fill password"],
  },
  post: {
    type: Array,
    default: [],
  },
  avatar: {
    type: String,
    default:
      "https://cdn-icons-png.flaticon.com/512/17/17004.png?w=1480&t=st=1689769769~exp=1689770369~hmac=f8bd7aa8f30116ec2091edab68061d492a3c6e17e613c9ffd7354482b799cf71",
  },
  follower: {
    type: Array,
    default: [],
  },
  following: {
    type: Array,
    default: [],
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next;
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.log(error);
  }

  return this.password;
});

userSchema.methods.createJWT = function () {
  return jwt.sign(
    {
      userId: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES }
  );
};

userSchema.methods.comparePass = async function (userPass) {
  const isMatch = await bcrypt.compare(userPass, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", userSchema);
