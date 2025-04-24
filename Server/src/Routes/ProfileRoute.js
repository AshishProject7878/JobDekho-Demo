import express from "express";
import { protectRoute } from "../Middlewares/AuthMiddleware.js";
import { 
  createProfile, 
  deleteProfile, 
  getProfile, 
  getProfileById, 
  updateProfile,
  toggleAutoJob,
  getAutoAppliedJobs,
  autoApplyJobs,
  saveManualApplication,
  getManualAppliedJobs,
} from "../Controllers/ProfileController.js";

const router = express.Router();

// Routes for current user's profile
router.get('/', protectRoute, getProfile);
router.post('/', protectRoute, createProfile);
router.put('/', protectRoute, updateProfile);
router.delete('/', protectRoute, deleteProfile);

// Auto job application routes
router.patch('/auto-job/toggle', protectRoute, toggleAutoJob);
router.get('/auto-job/applications', protectRoute, getAutoAppliedJobs);
router.post('/auto-job/apply', protectRoute, autoApplyJobs);

// Manual job application routes
router.post('/manual-apply', protectRoute, saveManualApplication);
router.get('/manual-applications', protectRoute, getManualAppliedJobs);

// Route for getting profile by ID (must be after specific routes)
router.get('/:id', protectRoute, getProfileById);

export default router;