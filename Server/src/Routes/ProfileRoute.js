import express from "express";
import { protectRoute } from "../Middlewares/AuthMiddleware.js";
import { createProfile, deleteProfile, getProfile, getProfileById, updateProfile } from "../Controllers/ProfileController.js";

const router = express.Router();

// Routes for current user's profile (no :id needed)
router.get('/', protectRoute, getProfile);         // GET /api/profile
router.post('/', protectRoute, createProfile);     // POST /api/profile
router.put('/', protectRoute, updateProfile);      // PUT /api/profile
router.delete('/', protectRoute, deleteProfile);   // DELETE /api/profile

// Optional route for getting profile by ID (e.g., for admin use)
router.get('/:id', protectRoute, getProfileById);  // GET /api/profile/:id

export default router;