import Post from "../Models/PostModel.js";

// Create a new post
export const createdPost = async (req, res) => {
    try {
        const {title, description, company, location, salary, requirements, type} = req.body;
        const userId = req.user._id;
        const newPost = new Post({
            title,
            description,
            company,
            location,
            salary,
            requirements,
            type,
            userId
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: "Error creating Post", error: error.message });
    }
};


// Get all posts or filter by userId or search query
export const getPosts = async (req, res) => {
  try {
    const { userId, search } = req.query;

    const searchFilter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { company: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const userFilter = userId ? { userId } : {};

    const finalFilter = { ...searchFilter, ...userFilter };

    const posts = await Post.find(finalFilter).sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching posts",
      error: error.message,
    });
  }
};



// Update post
export const updatePost = async (req, res) => {
    try {
      const updatedPost = await Post.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id }, // Only let user update their own post
        req.body,
        { new: true }
      );
  
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found or unauthorized" });
      }
  
      res.status(200).json({ message: "Post updated successfully", post: updatedPost });
    } catch (error) {
      console.error("Update Post Error:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };


// Delete post
export const deletePost = async (req, res) => {
    try {
      const deletedPost = await Post.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id
      });
  
      if (!deletedPost) {
        return res.status(404).json({ message: "Post not found or unauthorized" });
      }
  
      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Delete Post Error:", error);
      res.status(500).json({ message: "Error deleting post", error: error.message });
    }
  };
  

// Get post by ID
export const getPostById = async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.status(200).json(post);
    } catch (error) {
      console.error("Get Post By ID Error:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };