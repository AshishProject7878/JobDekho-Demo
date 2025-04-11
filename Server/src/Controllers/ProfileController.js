import Profile from '../models/ProfileModel.js'; // Adjust path as needed
import { v2 as cloudinary } from "cloudinary"; // Import Cloudinary for file deletion

// Configure Cloudinary (ensure this matches ResumeRoute.js)
try {
  if (!process.env.CLOUD_NAME || !process.env.CLOUD_KEY || !process.env.CLOUD_SECRET) {
    throw new Error("Missing Cloudinary environment variables");
  }
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
  });
} catch (error) {
  console.error("Cloudinary Configuration Error in ProfileController:", error.message);
}

// Validate Cloudinary URL accessibility
const validateCloudinaryUrl = async (url) => {
  if (!url || !url.match(/\.pdf$/i) || !url.includes("cloudinary.com")) {
    console.warn("URL failed basic validation:", { url });
    return false;
  }
  try {
    const response = await fetch(url, { method: "HEAD" });
    const isValid = response.ok && response.headers.get("content-type") === "application/pdf";
    console.log("URL validation result:", {
      url,
      status: response.status,
      contentType: response.headers.get("content-type"),
      isValid,
    });
    return isValid;
  } catch (error) {
    console.error("Error validating Cloudinary URL:", {
      url,
      message: error.message,
    });
    // Temporary fallback: Accept signed URLs without strict fetch validation
    if (url.includes("signature=") || url.includes("api_key=")) {
      console.log("Accepting signed URL without fetch validation:", url);
      return true;
    }
    return false;
  }
};

// @desc    Create a new user profile
// @route   POST /api/profile
// @access  Private
export const createProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { personal, isFresher, jobHistory, educationHistory, professional, jobPrefs } = req.body;

    const existingProfile = await Profile.findOne({ user: userId });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    // Validate resume URL if provided
    if (personal?.resume) {
      const isValidUrl = await validateCloudinaryUrl(personal.resume);
      if (!isValidUrl) {
        console.warn("Invalid or inaccessible resume URL provided:", personal.resume);
        return res.status(400).json({ message: "Provided resume URL is invalid or inaccessible" });
      }
      console.log("Validated resume URL for creation:", personal.resume);
    }

    const newProfile = new Profile({
      personal: {
        fullName: personal.fullName,
        email: personal.email,
        dob: personal.dob,
        gender: personal.gender,
        profilePicture: personal.profilePicture || undefined,
        resume: personal.resume || "", // Include validated resume or empty string
      },
      isFresher,
      jobHistory: isFresher ? [] : jobHistory,
      educationHistory,
      professional,
      jobPrefs,
      user: userId,
    });

    await newProfile.save();
    console.log("Created Profile:", {
      userId,
      resume: newProfile.personal.resume,
    });
    res.status(201).json({ message: "Profile created successfully", data: newProfile });
  } catch (error) {
    console.error("🔥 Error in createProfile:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Error creating profile", error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const userId = req.user._id;
    const { personal, isFresher, jobHistory, educationHistory, professional, jobPrefs } = req.body;

    console.log("Updating profile for user:", userId);
    console.log("Request body:", { personal, isFresher, jobHistory: jobHistory?.length, educationHistory: educationHistory?.length });

    // Fetch existing profile
    const existingProfile = await Profile.findOne({ user: userId });
    if (!existingProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Validate resume URL if provided
    let newResumeUrl = personal?.resume || existingProfile.personal.resume || "";
    if (personal?.resume && personal.resume !== existingProfile.personal.resume) {
      const isValidUrl = await validateCloudinaryUrl(personal.resume);
      if (!isValidUrl) {
        console.warn("Invalid or inaccessible resume URL provided:", personal.resume);
        return res.status(400).json({ message: "Provided resume URL is invalid or inaccessible" });
      }
      console.log("Validated resume URL for update:", personal.resume);

      // Delete old resume file from Cloudinary if it exists and is different
      if (existingProfile.personal.resume) {
        try {
          const oldPublicId = existingProfile.personal.resume.match(/resumes\/(.+)\.pdf$/)?.[1];
          if (oldPublicId) {
            await cloudinary.uploader.destroy(`resumes/${oldPublicId}`, {
              resource_type: "raw",
            });
            console.log("Deleted old resume from Cloudinary:", `resumes/${oldPublicId}`);
          }
        } catch (error) {
          console.warn("Failed to delete old resume from Cloudinary:", error.message);
          // Continue with update even if deletion fails
        }
      }
      newResumeUrl = personal.resume;
    }

    // Validate and format jobHistory for non-freshers
    let updatedJobHistory = jobHistory || existingProfile.jobHistory;
    if (isFresher !== undefined && !isFresher) {
      if (!Array.isArray(jobHistory) || jobHistory.length === 0 || 
          jobHistory.every(job => !job.company || !job.position || !job.startDate)) {
        return res.status(400).json({ 
          message: "Job history must include at least one entry with company, position, and start date for non-freshers",
        });
      }
      updatedJobHistory = jobHistory.map(job => ({
        company: job.company || "",
        position: job.position || "",
        startDate: job.startDate ? new Date(job.startDate) : null,
        endDate: job.endDate ? new Date(job.endDate) : null,
        description: job.description || "",
      }));
    } else if (isFresher) {
      updatedJobHistory = []; // Clear jobHistory for freshers
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          personal: {
            fullName: personal?.fullName || existingProfile.personal.fullName,
            email: personal?.email || existingProfile.personal.email,
            dob: personal?.dob || existingProfile.personal.dob,
            gender: personal?.gender || existingProfile.personal.gender,
            profilePicture: personal?.profilePicture || existingProfile.personal.profilePicture,
            resume: newResumeUrl,
          },
          isFresher: isFresher !== undefined ? isFresher : existingProfile.isFresher,
          jobHistory: updatedJobHistory,
          educationHistory: educationHistory || existingProfile.educationHistory,
          professional: professional || existingProfile.professional,
          jobPrefs: jobPrefs || existingProfile.jobPrefs,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    console.log("Profile after update:", {
      userId,
      resume: updatedProfile.personal.resume,
    });

    res.status(200).json({ message: "Profile saved successfully", data: updatedProfile });
  } catch (error) {
    console.error("🔥 Error in updateProfile:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Error saving profile", error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ user: userId }).populate("user", "email");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Optionally validate resume URL on fetch
    if (profile.personal.resume) {
      const isValidUrl = await validateCloudinaryUrl(profile.personal.resume);
      if (!isValidUrl) {
        console.warn("Profile has inaccessible resume URL:", profile.personal.resume);
      }
    }

    console.log("Fetched Profile:", {
      userId,
      resume: profile.personal.resume,
    });
    res.status(200).json(profile);
  } catch (error) {
    console.error("🔥 Error in getProfile:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/profile
// @access  Private
export const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const deletedProfile = await Profile.findOneAndDelete({ user: userId });

    if (!deletedProfile) {
      return res.status(404).json({ message: "Profile not found or unauthorized" });
    }

    // Delete resume from Cloudinary if it exists
    if (deletedProfile.personal.resume) {
      try {
        const publicId = deletedProfile.personal.resume.match(/resumes\/(.+)\.pdf$/)?.[1];
        if (publicId) {
          await cloudinary.uploader.destroy(`resumes/${publicId}`, {
            resource_type: "raw",
          });
          console.log("Deleted resume from Cloudinary:", `resumes/${publicId}`);
        }
      } catch (error) {
        console.warn("Failed to delete resume from Cloudinary:", error.message);
      }
    }

    console.log("Deleted Profile:", { userId });
    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("🔥 Error in deleteProfile:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Error deleting profile", error: error.message });
  }
};

// @desc    Get profile by ID (optional, for admin or specific use cases)
// @route   GET /api/profile/:id
// @access  Private
export const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate("user", "email");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    console.log("Fetched Profile by ID:", {
      profileId: req.params.id,
      resume: profile.personal.resume,
    });
    res.status(200).json(profile);
  } catch (error) {
    console.error("🔥 Error in getProfileById:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};