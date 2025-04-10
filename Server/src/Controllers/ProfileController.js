import Profile from '../models/ProfileModel.js'; // Adjust path as needed

// @desc    Create or update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming req.user is set by auth middleware
    const {
      personal,
      isFresher,
      jobHistory,
      educationHistory,
      professional,
      jobPrefs
    } = req.body;

    console.log("Request Body:", req.body);

    // Check if profile exists
    let profile = await Profile.findOne({ user: userId });

    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { user: userId },
        {
          personal,
          isFresher,
          jobHistory,
          educationHistory,
          professional,
          jobPrefs
        },
        { new: true, runValidators: true }
      );
      res.status(200).json({
        message: "Profile updated successfully",
        profile
      });
    } else {
      // Create new profile
      const newProfile = new Profile({
        personal,
        isFresher,
        jobHistory: isFresher ? [] : jobHistory, // Ensure jobHistory is empty if isFresher
        educationHistory,
        professional,
        jobPrefs,
        user: userId
      });
      await newProfile.save();
      res.status(201).json(newProfile);
    }
  } catch (error) {
    console.error("🔥 Error in updateProfile:", error);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ user: userId }).populate('user', 'email');

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("🔥 Error in getProfile:", error);
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message
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

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("🔥 Error in deleteProfile:", error);
    res.status(500).json({ message: "Error deleting profile", error: error.message });
  }
};

// @desc    Get profile by ID (optional, for admin or specific use cases)
// @route   GET /api/profile/:id
// @access  Private (or Public depending on your needs)
export const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate('user', 'email');

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("🔥 Error in getProfileById:", error);
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};