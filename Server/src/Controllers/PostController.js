import Post from "../Models/PostModel.js";
import Company from "../Models/CompanyModel.js";
import mongoose from "mongoose";

// Create a new post
export const createdPost = async (req, res) => {
  try {
    const {
      title,
      description,
      company, // Now expects companyId (ObjectId)
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
      contactEmail
    } = req.body;
    const userId = req.user._id;

    // Validate company ID
    if (!mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    // Check if company exists
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(404).json({ message: "Company not found" });
    }

    const { min: salaryMin, max: salaryMax, currency } = salary || {};

    const newPost = new Post({
      title,
      description,
      company, // Store companyId
      location,
      salary: {
        min: salaryMin,
        max: salaryMax,
        currency: currency || "LPA"
      },
      experience,
      category,
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

    await newPost.save();
    // Populate company details in the response
    const populatedPost = await Post.findById(newPost._id).populate("company", "name gstId website contactEmail");
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("🔥 Error in createdPost:", error);
    res.status(500).json({ message: "Error creating post", error: error.message });
  }
};

// Get all posts or filter by userId, search query, category, or company
export const getPosts = async (req, res) => {
  try {
    const { userId, search, category, company } = req.query;
    let query = {};

    // Search by title, description, company name, or location
    if (search) {
      // Find companies matching the search query
      const companies = await Company.find({
        name: { $regex: search, $options: "i" }
      }).select("_id");
      const companyIds = companies.map((c) => c._id);

      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { company: { $in: companyIds } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category && category !== "All") {
      query.category = category;
    }

    // Filter by company (expects company name)
    if (company && company !== "All") {
      const companyDoc = await Company.findOne({
        name: company
      }).select("_id");
      if (companyDoc) {
        query.company = companyDoc._id;
      } else {
        return res.status(200).json([]); // No posts if company not found
      }
    }

    // Filter by userId
    if (userId) {
      query.userId = userId;
    }

    const posts = await Post.find(query)
      .populate("company", "name gstId website contactEmail")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("🔥 Error in getPosts:", error);
    res.status(500).json({
      message: "Error fetching posts",
      error: error.message,
    });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const { company, salary, ...otherFields } = req.body;

    // Validate company ID if provided
    if (company && !mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    // Check if company exists if provided
    if (company) {
      const companyExists = await Company.findById(company);
      if (!companyExists) {
        return res.status(404).json({ message: "Company not found" });
      }
    }

    // Prepare update data
    const updateData = { ...otherFields };
    if (company) updateData.company = company;
    if (salary) {
      updateData.salary = {
        min: salary.min,
        max: salary.max,
        currency: salary.currency || "LPA"
      };
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    ).populate("company", "name gstId website contactEmail");

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found or unauthorized" });
    }

    res.status(200).json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    console.error("🔥 Update Post Error:", error);
    res.status(500).json({ message: "Error updating post", error: error.message });
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
    console.error("🔥 Delete Post Error:", error);
    res.status(500).json({ message: "Error deleting post", error: error.message });
  }
};

// Get post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("company", "name gstId website contactEmail");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error("🔥 Get Post By ID Error:", error);
    res.status(500).json({ message: "Error fetching post", error: error.message });
  }
};