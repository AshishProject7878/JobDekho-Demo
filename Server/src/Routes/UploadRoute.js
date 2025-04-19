import express from "express";
import { v2 as cloudinary } from "cloudinary";
import { protectRoute } from "../Middlewares/AuthMiddleware.js";
import Profile from "../Models/ProfileModel.js";
import dotenv from "dotenv";
import { getVideoDurationInSeconds } from "get-video-duration";
import fs from "fs";

dotenv.config();

const router = express.Router();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// Route for uploading profile picture or company logo
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

    // Safely check if isCompanyLogo is provided
    const isCompanyLogo = req.body.isCompanyLogo === "true" || req.body.isCompanyLogo === true;

    const result = await cloudinary.uploader.upload(file.tempFilePath || file.data, {
      folder: isCompanyLogo ? "company_logos" : "profiles",
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

    // Update profile only if not a company logo
    if (!isCompanyLogo) {
      const userId = req.user._id;
      const updatedProfile = await Profile.findOneAndUpdate(
        { user: userId },
        { $set: { "personal.profilePicture": result.secure_url } },
        { new: true, upsert: true }
      );

      if (!updatedProfile) {
        return res.status(500).json({ message: "Failed to update profile with profile picture URL" });
      }
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

    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }

    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ message: "File size must be less than 10MB" });
    }

    const publicId = `resumes/${req.user._id}_${Date.now()}.pdf`;

    const result = await cloudinary.uploader.upload(file.tempFilePath || file.data, {
      folder: "resumes",
      resource_type: "raw",
      public_id: publicId,
      format: "pdf",
    });

    console.log("Cloudinary Upload Result:", {
      secure_url: result.secure_url,
      public_id: result.public_id,
      bytes: result.bytes,
    });

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

// Route for uploading video resume
router.post("/video-resume", protectRoute, async (req, res) => {
  let file;
  try {
    console.log("Received video upload request:", {
      userId: req.user?._id,
      files: req.files,
    });

    if (!req.files || !req.files.videoResume) {
      console.error("No video file uploaded");
      return res.status(400).json({ message: "No video uploaded" });
    }

    file = req.files.videoResume;
    console.log("Received File:", {
      name: file.name,
      size: file.size,
      mimetype: file.mimetype,
      tempFilePath: file.tempFilePath,
    });

    const filetypes = /mp4|webm/;
    if (!filetypes.test(file.mimetype)) {
      console.error("Invalid file type:", file.mimetype);
      return res.status(400).json({ message: "Only MP4 and WebM videos are allowed" });
    }

    if (file.size > 50 * 1024 * 1024) {
      console.error("File size too large:", file.size);
      return res.status(400).json({ message: "File size must be less than 50MB" });
    }

    if (!file.tempFilePath || !fs.existsSync(file.tempFilePath)) {
      console.error("Temporary file not found:", file.tempFilePath);
      return res.status(400).json({ message: "Temporary file not found" });
    }

    const duration = await getVideoDurationInSeconds(file.tempFilePath);
    console.log("Video Duration:", duration, "seconds");
    if (duration > 30) {
      console.error("Video duration exceeds 30 seconds:", duration);
      return res.status(400).json({ message: "Video must be 30 seconds or shorter" });
    }

    const publicId = `video-resumes/${req.user._id}_${Date.now()}`;

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "video-resumes",
      resource_type: "video",
      public_id: publicId,
      format: file.mimetype === "video/mp4" ? "mp4" : "webm",
    });

    console.log("Cloudinary Video Upload Result:", {
      secure_url: result.secure_url,
      public_id: result.public_id,
      bytes: result.bytes,
    });

    const userId = req.user._id;
    const profile = await Profile.findOne({ user: userId });
    console.log("Profile Found:", profile ? profile._id : "No profile");
    if (profile && profile.personal.videoResumePublicId) {
      console.log("Deleting old video:", profile.personal.videoResumePublicId);
      await cloudinary.uploader.destroy(profile.personal.videoResumePublicId, {
        resource_type: "video",
      });
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          "personal.videoResumeUrl": result.secure_url,
          "personal.videoResumePublicId": result.public_id,
        },
      },
      { new: true, upsert: true }
    );

    console.log("Updated Profile:", updatedProfile ? updatedProfile._id : "Update failed");

    if (!updatedProfile) {
      console.error("Failed to update profile with video resume URL");
      return res.status(500).json({ message: "Failed to update profile with video resume URL" });
    }

    if (file.tempFilePath && fs.existsSync(file.tempFilePath)) {
      console.log("Cleaning up temporary file:", file.tempFilePath);
      fs.unlinkSync(file.tempFilePath);
    }

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Video Resume Upload Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cloudinaryError: error.http_code
        ? { http_code: error.http_code, details: error.message }
        : undefined,
    });

    if (file?.tempFilePath && fs.existsSync(file.tempFilePath)) {
      console.log("Cleaning up temporary file on error:", file.tempFilePath);
      fs.unlinkSync(file.tempFilePath);
    }

    if (error.message.includes("30 seconds")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.http_code) {
      if (error.http_code === 400) {
        return res.status(400).json({ message: "Invalid file or upload parameters" });
      } else if (error.http_code === 401 || error.http_code === 403) {
        return res.status(401).json({ message: "Cloudinary authentication failed" });
      } else if (error.http_code === 429) {
        return res.status(429).json({ message: "Cloudinary rate limit exceeded" });
      }
    }

    res.status(500).json({
      message: "Failed to upload video resume",
      error: error.message,
    });
  }
});

export default router;