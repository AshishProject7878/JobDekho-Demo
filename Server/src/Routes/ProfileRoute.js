import express from "express";
import { protectRoute } from "../middlewares/AuthMiddleware.js"; // Adjust path as needed
import { deleteProfile, getProfile, getProfileById, updateProfile } from "../Controllers/ProfileController.js";

const router = express.Router();

// Routes for profile management
router.put("/", protectRoute, updateProfile);    // Create or update profile
router.get("/", protectRoute, getProfile);       // Get current user's profile
router.delete("/", protectRoute, deleteProfile); // Delete current user's profile
router.get("/:id", protectRoute, getProfileById); // Get profile by ID (optional, e.g., for admin)

export default router; 