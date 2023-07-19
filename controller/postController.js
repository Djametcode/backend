const User = require("../model/userModel");
const Post = require("../model/postModel");
const Like = require("../model/likeModel");
const Comment = require("../model/commentSchema");
const cloudinary = require("../utils/cloudinary");

const createPost = async (req, res) => {
  const { text } = req.body;
  const createdBy = req.user.userId;
  try {
    const user = await User.findOne({ _id: req.user.userId });

    let file = req.file;

    if (!text && !file) {
      return res.status(201).json({ msg: "Please fill at least one of them" });
    }

    if (!file) {
      const noImagesPost = new Post({
        text: text,
        createdBy: createdBy,
      });

      const newPostWithNoImage = await Post.create(noImagesPost);
      user.post.push(newPostWithNoImage);
      await user.save();

      return res
        .status(200)
        .json({ msg: "Success post with no images", newPostWithNoImage });
    }

    if (!text) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "Testing",
        resource_type: "auto",
      });

      const noTextPost = new Post({
        image: result.secure_url,
        createdBy: createdBy,
      });

      const newPostWithNoText = await Post.create(noTextPost);
      user.post.push(newPostWithNoText);
      await user.save();

      return res
        .status(200)
        .json({ msg: "Success post with no text", newPostWithNoText });
    }

    const result = await cloudinary.uploader.upload(file, {
      folder: "Testing",
      resource_type: "auto",
    });

    const newPost = new Post({
      text: text,
      image: result.secure_url,
      createdBy: createdBy,
    });

    user.post.push(newPost);
    await user.save();

    return res.status(200).json({ msg: "Success Post", newPost });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "Internal server error" });
  }
};

const getMyPost = async (req, res) => {
  try {
    const post = await Post.find({ createdBy: req.user.userId });

    return res.status(200).json({ msg: "Success", post });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "internal server error" });
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findOneAndDelete({ _id: id });
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    return res.status(200).json({ msg: "Post deleted" });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "internal server error" });
  }
};

const updatePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findOneAndUpdate(
      { _id: id },
      {
        ...req.body,
      },
      {
        new: true,
      }
    );

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    return res.status(200).json({ msg: "Post updated", post });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "internal server error" });
  }
};

const likePost = async (req, res) => {
  const { id } = req.params;
  const createdBy = req.user.userId;
  try {
    const post = await Post.findOne({ _id: id });

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const check = await Like.exists({ postId: id, createdBy: createdBy });
    console.log(check);

    if (check) {
      return res.status(201).json({ msg: "You already like this" });
    }
    const newLike = new Like({
      createdBy: createdBy,
      postId: id,
    });

    const newLikes = await Like.create(newLike);
    await post.like.push(newLikes);
    await post.save();

    return res.status(200).json({ msg: "Success Like" });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "internal server error" });
  }
};

const unLikePost = async (req, res) => {
  const { id } = req.params;
  const createdBy = req.user.userId;

  try {
    const likeToBeDeleted = await Like.findOne({
      postId: id,
      createdBy: createdBy,
    });

    const data = await Like.findOneAndDelete({
      postId: id,
      createdBy: createdBy,
    });

    if (!data) {
      return res.status(404).json({ msg: "Already unliked" });
    }

    const post = await Post.findOne({ _id: id });

    const likeIndex = post.like.indexOf(likeToBeDeleted._id);

    if (likeIndex !== -1) {
      post.like.splice(likeIndex, 1);
    }

    await post.save();

    return res.status(200).json({ msg: "Like deleted", data, post });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "internal server error" });
  }
};

const commentPost = async (req, res) => {
  const { id } = req.params;
  const createdBy = req.user.userId;
  const { text } = req.body;
  try {
    const post = await Post.findOne({ _id: id });

    if (!post) {
      return res.status(404).json({ msg: "Post not found or deleted" });
    }

    const comment = new Comment({
      createdBy: createdBy,
      text: text,
      postId: id,
    });

    const newComment = await Comment.create(comment);
    post.comment.push(newComment);
    await post.save();

    return res.status(200).json({ msg: "Comment success", post });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "internal server error" });
  }
};

const likeComment = async (req, res) => {
  const { id: commentId } = req.params;
  const createdBy = req.user.userId;
  try {
    const comment = await Comment.findOne({ _id: commentId });

    if (!comment) {
      return res
        .status(404)
        .json({ msg: "Comment not found or already deleted" });
    }

    const like = new Like({
      createdBy: createdBy,
      commentId: commentId,
    });
    const newLike = await Like.create(like);

    comment.likes.push(newLike);
    await comment.save();

    return res.status(200).json({ msg: "Comment liked", comment });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "internal server error" });
  }
};

const replyComment = async (req, res) => {
  const { id } = req.params;
  const createdBy = req.user.userId;
  const { text } = req.body;

  try {
    const comment = await Comment.findOne({ _id: id });

    if (!comment) {
      return res
        .status(404)
        .json({ msg: "Comment not found or already deleted" });
    }

    const replyCommets = new Comment({
      createdBy: createdBy,
      text: text,
      commentId: id,
    });

    const newReplyComment = await Comment.create(replyCommets);
    comment.reply.push(newReplyComment);
    await comment.save();

    return res.status(200).json({ msg: "Success reply comment", comment });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "internal server error" });
  }
};

const deleteComment = async (req, res) => {
  const { id } = req.params;
  const createdBy = req.user.userId;
  try {
    const commentToBeDeleted = await Comment.findOne({
      postId: id,
      createdBy: createdBy,
    });

    const data = await Comment.findOneAndDelete({
      postId: id,
      createdBy: createdBy,
    });

    if (!data) {
      return res
        .status(404)
        .json({ msg: "Comment not found or already deleted" });
    }

    const post = await Post.findOne({ _id: id });
    const commentIndex = post.comment.indexOf(commentToBeDeleted._id);
    console.log(commentIndex);

    if (commentIndex !== -1) {
      post.comment.splice(commentIndex, 1);
    }
    await post.save();

    return res.status(200).json({ msg: "Comment deleted", data });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "internal server error" });
  }
};
module.exports = {
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
};
