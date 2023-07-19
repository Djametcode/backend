const User = require("../model/userModel");
const Follower = require("../model/followModel");
const cloudinary = require("../utils/cloudinary");

const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const { email, username, avatar } = req.body;
  let file = req.file;

  try {
    if (!file) {
      const user = await User.findOneAndUpdate(
        { _id: userId },
        {
          username: username,
          email: email,
        },
        {
          new: true,
        }
      );

      return res
        .status(200)
        .json({ msg: "Profile Updated with no avatar new", user });
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "Testing",
      resource_type: "auto",
    });

    const userUpdate = await User.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        email: email,
        username: username,
        avatar: result.secure_url,
      },
      {
        new: true,
      }
    );

    return res.status(200).json({ msg: "Profile updated", userUpdate });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "Internal server error" });
  }
};

const deleteAccount = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await User.findOneAndDelete({ _id: userId });

    return res
      .status(200)
      .json({ msg: "Account deleted thanks for using us", user });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "internal server error" });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json({ msg: "User found", user });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "Internal server error" });
  }
};

const getAllUser = async (req, res) => {
  try {
    const data = await User.find({});

    return res.status(200).json({ msg: "succes", data });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "Internal server error" });
  }
};

const getCurrentUser = async (req, res) => {
  const currentUser = req.user.userId;
  try {
    const data = await User.findOne({ _id: currentUser });

    return res.status(200).json({ msg: "Success", data });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "Internal server error" });
  }
};

const followUser = async (req, res) => {
  const curr = req.user.userId;
  const { id: targetUser } = req.params;
  try {
    const user = await User.findOne({ _id: targetUser });
    const currentUser = await User.findOne({ _id: curr });

    if (!user) {
      return res.status(404).json({ msg: "User not found or deleted?" });
    }

    const check = await Follower.exists({
      user: currentUser,
      target: targetUser,
    });

    if (check) {
      return res.status(400).json({ msg: "You already follow this account" });
    }

    const followers = new Follower({
      user: currentUser,
      target: targetUser,
    });

    const following = new Follower({
      target: targetUser,
    });

    const newFollower = await Follower.create(followers);
    const newFollowing = await Follower.create(following);

    user.follower.push(newFollower);
    currentUser.following.push(newFollowing);

    await user.save();
    await currentUser.save();

    return res.status(200).json({ msg: "Success following", currentUser });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "Internal server error" });
  }
};

const unFollowUser = async (req, res) => {
  const { id } = req.params;
  const follower = req.user.userId;
  try {
    const followingToBeDeleted = await Follower.find({
      target: id,
      user: follower,
    });

    const currFollowingToBeDeleted = await Follower.find({
      target: id,
    });

    const data = await Follower.findOneAndDelete({
      target: id,
      user: follower,
    });

    const following = await Follower.findOneAndDelete({ target: id });

    if (!data || !following) {
      return res.status(404).json({ msg: "Already unfollow" });
    }

    const user = await User.findOne({ _id, id });
    const indexFollower = user.follower.indexOf(followingToBeDeleted._id);

    if (indexFollower !== -1) {
      user.follower.splice(indexFollower, 1);
    }

    const currUserFollowing = await User.findOne({ _id: follower });
    const indexFollowing = currUserFollowing.following.indexOf(
      currUserFollowing._id
    );

    if (indexFollowing !== -1) {
      currUserFollowing.following.splice(indexFollowing, 1);
    }

    await user.save();
    await currUserFollowing.save();

    return res.status(200).json({ msg: "Success unfollow", currUserFollowing });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "Internal server error" });
  }
};

module.exports = {
  updateProfile,
  deleteAccount,
  getUserById,
  getAllUser,
  getCurrentUser,
  followUser,
  unFollowUser,
};
