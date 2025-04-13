import Post from "../Models/PostModel.js";
import mongoose from "mongoose";

// Create a new post
export const createdPost = async (req, res) => {
  try {
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
      category,
      type,
      applicationDeadline,
      remote,
      contactEmail,
    } = req.body;
    const userId = req.user._id;

    // Validate company as ObjectId
    if (!mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    console.log("Request Body:", req.body);

    const { min: salaryMin, max: salaryMax, currency } = salary || {};

    const newPost = new Post({
      title,
      description,
      company,
      location,
      salary: {
        min: salaryMin,
        max: salaryMax,
        currency: currency || "LPA",
      },
      experience,
      category,
      educationLevel,
      languages: languages ? languages.split(",").map((lang) => lang.trim()) : [],
      responsibilities,
      roleExperience,
      skills: skills || [],
      type,
      userId,
      status: "Draft",
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
      remote: remote || false,
      contactEmail,
      views: 0,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("🔥 Error in createdPost:", error);
    res.status(500).json({ message: "Error creating Post", error: error.message });
  }
};

// Get all posts or filter by userId, companyId, search, or category
export const getPosts = async (req, res) => {
  try {
    const { userId, companyId, search, category } = req.query;
    const query = {};

    if (userId) {
      query.userId = userId;
    }

    if (companyId) {
      if (!mongoose.Types.ObjectId.isValid(companyId)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }
      query.company = companyId;
      console.log("Filtering by companyId:", companyId); // Debug log
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const posts = await Post.find(query)
      .populate("company", "name gstId address contactEmail phoneNumber website")
      .sort({ createdAt: -1 });

    console.log("Fetched posts:", posts); // Debug log
    res.status(200).json(posts || []);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      message: "Error fetching posts",
      error: error.message,
    });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const { company } = req.body;
    if (company && !mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
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
      userId: req.user._id,
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
    const post = await Post.findById(req.params.id).populate(
      "company",
      "name gstId address contactEmail phoneNumber website"
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error("Get Post By ID Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};