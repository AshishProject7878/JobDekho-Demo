import express from "express";
import { v2 as cloudinary } from "cloudinary";
import { protectRoute } from "../Middlewares/AuthMiddleware.js";
import PDFParser from "pdf2json"; // Add pdf2json for PDF validation

const router = express.Router();

// Configure Cloudinary with environment variables
try {
  if (!process.env.CLOUD_NAME || !process.env.CLOUD_KEY || !process.env.CLOUD_SECRET) {
    throw new Error("Missing Cloudinary environment variables (CLOUD_NAME, CLOUD_KEY, CLOUD_SECRET)");
  }

  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
  });

  console.log("Cloudinary Config for Resume:", {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET ? "[REDACTED]" : undefined,
  });
} catch (error) {
  console.error("Cloudinary Configuration Error:", {
    message: error.message,
    stack: error.stack,
  });
}

// Validate PDF file integrity
const validatePDF = (filePath) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", (err) => reject(new Error(`Invalid PDF: ${err.parserError}`)));
    pdfParser.on("pdfParser_dataReady", () => resolve(true));
    pdfParser.loadPDF(filePath);
  });
};

// Route for uploading resume
router.post("/", protectRoute, async (req, res) => {
  try {
    if (!cloudinary.config().cloud_name) {
      console.error("Cloudinary not configured properly");
      return res.status(500).json({ message: "Cloudinary configuration error" });
    }

    if (!req.files || !req.files.resume) {
      console.error("No resume file uploaded in request");
      return res.status(400).json({ message: "No resume file uploaded" });
    }

    const file = req.files.resume;
    console.log("Received Resume File:", {
      name: file.name,
      size: file.size,
      mimetype: file.mimetype,
    });

    // Validate file type and size
    if (file.mimetype !== "application/pdf") {
      console.error("Invalid file type:", file.mimetype);
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }

    if (file.size > 10 * 1024 * 1024) {
      console.error("File size too large:", file.size);
      return res.status(400).json({ message: "File size must be less than 10MB" });
    }

    // Validate PDF integrity
    try {
      await validatePDF(file.tempFilePath);
      console.log("PDF validation successful");
    } catch (error) {
      console.error("PDF validation failed:", error.message);
      return res.status(400).json({ message: "Uploaded file is not a valid PDF" });
    }

    // Sanitize filename and generate unique public_id
    const sanitizedFileName = file.name
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    const publicId = `resumes/${Date.now()}_${sanitizedFileName.replace(/\.[^/.]+$/, "")}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "resumes",
      resource_type: "raw",
      public_id: publicId,
      format: "pdf",
      access_mode: "public",
      type: "upload",
      overwrite: false, // Prevent overwriting existing files
      invalidate: true, // Invalidate cache for new uploads
    });

    // Verify access mode
    if (result.access_mode !== "public") {
      console.warn("Incorrect access mode detected:", result.access_mode);
      await cloudinary.api.update(publicId, {
        resource_type: "raw",
        access_mode: "public",
      });
      console.log("Corrected access mode to public for:", publicId);
    }

    // Verify URL and format
    if (!result.secure_url || !result.secure_url.endsWith(".pdf")) {
      console.error("Invalid Cloudinary URL:", result.secure_url);
      return res.status(500).json({ message: "Failed to generate valid PDF URL" });
    }

    // Test URL accessibility (optional, for debugging)
    try {
      const response = await fetch(result.secure_url);
      if (!response.ok) {
        console.error("Uploaded file is not accessible:", {
          url: result.secure_url,
          status: response.status,
          statusText: response.statusText,
        });
        return res.status(500).json({ message: "Uploaded file is not publicly accessible" });
      }
      console.log("Uploaded file is accessible:", result.secure_url);
    } catch (error) {
      console.error("Error testing URL accessibility:", error.message);
    }

    console.log("Cloudinary Resume Upload Result:", {
      secure_url: result.secure_url,
      public_id: result.public_id,
      bytes: result.bytes,
      format: result.format,
      access_mode: result.access_mode,
      resource_type: result.resource_type,
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Resume Upload Error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cloudinaryError: error.http_code
        ? { http_code: error.http_code, details: error.message }
        : undefined,
    });

    if (error.message.includes("Cloudinary environment variables")) {
      return res.status(500).json({ message: "Cloudinary configuration is missing" });
    } else if (error.http_code === 400) {
      return res.status(400).json({ message: "Invalid file or upload parameters" });
    } else if (error.http_code === 401 || error.http_code === 403) {
      return res.status(401).json({ message: "Cloudinary authentication failed. Check account settings." });
    } else if (error.http_code === 429) {
      return res.status(429).json({ message: "Cloudinary rate limit exceeded" });
    }

    res.status(500).json({
      message: "Failed to upload resume",
      error: error.message,
    });
  }
});

export default router;