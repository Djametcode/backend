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
    const userPost = await User.findOne({ _id: req.user.userId });
    const post = await Post.findOne({ _id: id });

    const postDeleting = await Post.findOneAndDelete({ _id: id });

    if (!postDeleting) {
      return res.status(404).json({ msg: "Post not found or already deleted" });
    }

    if (userPost) {
      const indexPost = post.indexOf(post._id);
      userPost.post.splice(indexPost, 1);
      await userPost.save();
      return res.status(200).json({ msg: "Post deleted", post });
    }
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "internal server error" });
  }
};

const updatePost = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  try {
    let file = req.file;

    if (!file) {
      const post = await Post.findOneAndUpdate(
        { _id: id },
        {
          text: text,
        },
        {
          new: true,
        }
      );

      if (!post) {
        return res.status(404).json({ msg: "Post not found" });
      }
      return res.status(200).json({ msg: "Post updated", post });
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "Testing",
      resource_type: "auto",
    });

    const post = await Post.findOneAndUpdate(
      { _id: id },
      {
        text: text,
        image: result.secure_url,
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
    const check = await Like.exists({ postId: id, createdBy: createdBy });
    console.log(check);

    if (check) {
      return res.status(201).json({ msg: "You already like this" });
    }

    const post = await Post.findOne({ _id: id });

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const newLike = new Like({
      createdBy: createdBy,
      postId: id,
    });

    const newLikes = await Like.create(newLike);
    post.like.push(newLikes);
    await post.save();

    return res.status(200).json({ msg: "Success Like", post });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "internal server error" });
  }
};
const unLikePost = async (req, res) => {
  const { id } = req.params;
  try {
    const likeIndexs = await Like.findOne({
      postId: id,
      createdBy: req.user.userId,
    });
    console.log(likeIndexs);
    const data = await Like.findOneAndDelete({
      postId: id,
      createdBy: req.user.userId,
    });

    if (!data) {
      return res.status(404).json({ msg: "like not found" });
    }

    if (likeIndexs) {
      const post = await Post.findOne({ _id: id });

      const likeindex = post.like.indexOf(likeIndexs._id);
      post.like.splice(likeindex, 1);
      await post.save();

      return res.status(200).json({ msg: "Like deleted", post });
    }
  } catch (error) {
    console.log(error);
  }
};

const commentPost = async (req, res) => {
  const { id } = req.params;
  const createdBy = req.user.userId;
  const { text } = req.body;
  let file = req.file;

  try {
    const post = await Post.findOne({ _id: id });

    if (!post) {
      return res.status(404).json({ msg: "Post not found or deleted" });
    }

    if (!file) {
      const comment = new Comment({
        createdBy: createdBy,
        text: text,
        postId: id,
      });

      const newComment = await Comment.create(comment);
      post.comment.push(newComment);
      await post.save();

      return res
        .status(200)
        .json({ msg: "Comment success with no image", post });
    }
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "Testing",
      resource_type: "auto",
    });
    const comment = new Comment({
      createdBy: createdBy,
      text: text,
      postId: id,
      image: result.secure_url,
    });

    const newComment = await Comment.create(comment);
    post.comment.push(newComment);
    await post.save();

    return res.status(200).json({ msg: "Comment success with image", post });
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

const unLikeComment = async (req, res) => {
  const { id } = req.params;
  const creator = req.user.userId;
  try {
    const like = await Like.findOne({ createdBy: creator, commentId: id });
    const comment = await Comment.findOne({ _id: id });

    const deletedLike = await Like.findOneAndDelete({
      createdBy: creator,
      commentId: id,
    });

    if (!deletedLike) {
      return res
        .status(404)
        .json({ msg: "Comment not found or already unliked" });
    }

    if (like) {
      const indexLike = comment.likes.indexOf(like._id);
      comment.likes.splice(indexLike, 1);
      await comment.save();

      return res.status(200).json({ msg: "Success unlike comment", comment });
    }
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "internal server error" });
  }
};

const replyComment = async (req, res) => {
  const { id } = req.params;
  const createdBy = req.user.userId;
  const { text } = req.body;
  let file = req.file;

  try {
    const comment = await Comment.findOne({ _id: id });

    if (!comment) {
      return res
        .status(404)
        .json({ msg: "Comment not found or already deleted" });
    }

    if (!file) {
      const replyCommets = new Comment({
        createdBy: createdBy,
        text: text,
        commentId: id,
      });

      const newReplyComment = await Comment.create(replyCommets);
      comment.reply.push(newReplyComment);
      await comment.save();

      return res
        .status(200)
        .json({ msg: "Success reply comment with no image", comment });
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "Testing",
      resource_type: "auto",
    });

    const replyCommets = new Comment({
      createdBy: createdBy,
      text: text,
      commentId: id,
      image: result.secure_url,
    });

    const newReplyComment = await Comment.create(replyCommets);
    comment.reply.push(newReplyComment);
    await comment.save();

    return res
      .status(200)
      .json({ msg: "Success reply comment with image", comment });
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
      _id: id,
    });

    // const check = commentToBeDeleted.createdBy !== createdBy;

    // if (check) {
    //   return res
    //     .status(400)
    //     .json({ msg: "You are not allowed to delete this" });
    // }

    const data = await Comment.findOneAndDelete({
      _id: id,
    });

    if (!data) {
      return res
        .status(404)
        .json({ msg: "Comment not found or already deleted" });
    }

    if (commentToBeDeleted) {
      const post = await Post.findOne({ createdBy: createdBy });

      const commentIndex = post.comment.indexOf(commentToBeDeleted._id);
      console.log(commentIndex);
      post.comment.splice(commentIndex, 1);
      await post.save();

      return res.status(200).json({ msg: "Comment deleted", post });
    }
  } catch (error) {
    console.log(error);
    return res.status(501).json({ msg: "internal server error" });
  }
};

const getCommentById = async (req, res) => {
  const { id } = req.params;
  try {
    const comment = await Comment.findOne({ _id: id });

    if (!comment) {
      return res.status(404).json({ msg: "Comment not found or deleted" });
    }

    return res.status(200).json({ msg: "Success", comment });
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
  getCommentById,
  unLikeComment,
};
