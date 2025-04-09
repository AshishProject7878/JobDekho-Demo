import Post from "../Models/PostModel.js";

// Create a new post
export const createdPost = async (req, res) => {
  try {
    // console.log("👉 Req.user:", req.user);
    // console.log("👉 Req.body:", req.body);
      const {
          title,
          description,
          company,
          location,
          salary,
          experience,
          educationLevel,
          languages,
          responsibilities,
          roleExperience,
          skills,
          type,
          applicationDeadline,
          remote,
          contactEmail
      } = req.body;
      const userId = req.user._id;

      // console.log("Request Body:", req.body);

      const { min: salaryMin, max: salaryMax, currency } = salary || {};

      const newPost = new Post({
          title,
          description,
          company,
          location,
          salary: {
              min: salaryMin,
              max: salaryMax,
              currency: currency || "LPA"
          },
          experience,
          educationLevel,
          languages: languages ? languages.split(',').map(lang => lang.trim()) : [],
          responsibilities,
          roleExperience,
          skills: skills || [],
          type,
          userId,
          status: "Draft",
          applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
          remote: remote || false,
          contactEmail,
          views: 0
      });

      // console.log("New Post Object:", newPost); 
      await newPost.save();
      res.status(201).json(newPost);
  } catch (error) {
    console.error("🔥 Error in createdPost:", error);  // FULL error
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