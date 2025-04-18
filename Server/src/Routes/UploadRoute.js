import express from "express";
import { v2 as cloudinary } from "cloudinary";
import { protectRoute } from "../Middlewares/AuthMiddleware.js";
import Profile from "../Models/ProfileModel.js"; // Import Profile model
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// Route for uploading profile picture
router.post("/", protectRoute, async (req, res) => {
  try {
    if (!req.files || !req.files.profilePicture) {
      console.error("No file uploaded in request");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.files.profilePicture;
    console.log("Received File:", {
      name: file.name,
      size: file.size,
      mimetype: file.mimetype,
    });

    const filetypes = /jpeg|jpg|png/;
    if (!filetypes.test(file.mimetype)) {
      console.error("Invalid file type:", file.mimetype);
      return res.status(400).json({ message: "Only JPG and PNG files are allowed" });
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error("File size too large:", file.size);
      return res.status(400).json({ message: "File size must be less than 5MB" });
    }

    const result = await cloudinary.uploader.upload(file.tempFilePath || file.data, {
      folder: "profiles",
      resource_type: "image",
      transformation: [
        { width: 200, height: 200, crop: "fill" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    console.log("Cloudinary Upload Result:", {
      secure_url: result.secure_url,
      public_id: result.public_id,
      bytes: result.bytes,
    });

    // Update the profile with the new profile picture URL
    const userId = req.user._id; // Assuming protectRoute attaches user to req
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: { "personal.profilePicture": result.secure_url } },
      { new: true, upsert: true }
    );

    if (!updatedProfile) {
      return res.status(500).json({ message: "Failed to update profile with profile picture URL" });
    }

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload Error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cloudinaryError: error.http_code
        ? {
            http_code: error.http_code,
            details: error.message,
          }
        : undefined,
    });

    if (error.http_code === 400) {
      return res.status(400).json({ message: "Invalid file or upload parameters" });
    } else if (error.http_code === 401 || error.http_code === 403) {
      return res.status(401).json({ message: "Cloudinary authentication failed" });
    } else if (error.http_code === 429) {
      return res.status(429).json({ message: "Cloudinary rate limit exceeded" });
    }

    res.status(500).json({
      message: "Failed to upload image",
      error: error.message,
    });
  }
});

// Route for uploading resume
router.post("/resume", protectRoute, async (req, res) => {
  try {
    if (!req.files || !req.files.resume) {
      return res.status(400).json({ message: "No resume uploaded" });
    }

    const file = req.files.resume;

    // Validate file type (PDF only)
    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }

    // Validate file size (10MB limit for resumes)
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ message: "File size must be less than 10MB" });
    }

    // Generate a unique public_id with .pdf extension
    const publicId = `resumes/${req.user._id}_${Date.now()}.pdf`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath || file.data, {
      folder: "resumes",
      resource_type: "raw",
      public_id: publicId,
      format: "pdf", // Explicitly set format to PDF
    });

    console.log("Cloudinary Upload Result:", {
      secure_url: result.secure_url,
      public_id: result.public_id,
      bytes: result.bytes,
    });

    // Update the profile with the new resume URL and public_id
    const userId = req.user._id;
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          "personal.resumeUrl": result.secure_url,
          "personal.resumePublicId": result.public_id,
        },
      },
      { new: true, upsert: true }
    );

    if (!updatedProfile) {
      return res.status(500).json({ message: "Failed to update profile with resume URL" });
    }

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Resume Upload Error:", error);
    res.status(500).json({ message: "Failed to upload resume", error: error.message });
  }
});

export default router;