import express from "express";
import { v2 as cloudinary } from "cloudinary";
import { protectRoute } from "../Middlewares/AuthMiddleware.js";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// Log Cloudinary configuration for debugging (remove in production if sensitive)

// console.log("Cloudinary Config:", {
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_KEY,
//   api_secret: process.env.CLOUD_SECRET ? "[REDACTED]" : undefined,
// });

// Route for uploading profile picture
router.post("/", protectRoute, async (req, res) => {
  try {
    // Check if file exists
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

    // Validate file type
    const filetypes = /jpeg|jpg|png/;
    if (!filetypes.test(file.mimetype)) {
      console.error("Invalid file type:", file.mimetype);
      return res.status(400).json({ message: "Only JPG and PNG files are allowed" });
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.error("File size too large:", file.size);
      return res.status(400).json({ message: "File size must be less than 5MB" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath || file.data, {
      folder: "profiles", // Organize in a folder
      resource_type: "image", // Explicitly specify resource type
      transformation: [
        { width: 200, height: 200, crop: "fill" }, // Optional: Resize image
        { quality: "auto", fetch_format: "auto" }, // Optimize quality and format
      ],
    });

    console.log("Cloudinary Upload Result:", {
      secure_url: result.secure_url,
      public_id: result.public_id,
      bytes: result.bytes,
    });

    // Return the secure URL
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload Error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cloudinaryError: error.http_code ? { 
        http_code: error.http_code, 
        details: error.message 
      } : undefined,
    });

    // Provide specific error messages based on Cloudinary response
    if (error.http_code === 400) {
      return res.status(400).json({ message: "Invalid file or upload parameters" });
    } else if (error.http_code === 401 || error.http_code === 403) {
      return res.status(401).json({ message: "Cloudinary authentication failed" });
    } else if (error.http_code === 429) {
      return res.status(429).json({ message: "Cloudinary rate limit exceeded" });
    }

    res.status(500).json({ 
      message: "Failed to upload image", 
      error: error.message 
    });
  }
});

export default router;