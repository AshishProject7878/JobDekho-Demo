import Profile from '../models/ProfileModel.js'; // Adjust path as needed

// @desc    Create a new user profile
// @route   POST /api/profile (not used here, kept for reference)
// @access  Private
export const createProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { personal, isFresher, jobHistory, educationHistory, professional, jobPrefs } = req.body;

    const existingProfile = await Profile.findOne({ user: userId });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    const newProfile = new Profile({
      personal,
      isFresher,
      jobHistory: isFresher ? [] : jobHistory,
      educationHistory,
      professional,
      jobPrefs,
      user: userId,
    });
    await newProfile.save();
    res.status(201).json({ message: 'Profile created successfully', profile: newProfile });
  } catch (error) {
    console.error('🔥 Error in createProfile:', error);
    res.status(500).json({ message: 'Error creating profile', error: error.message });
  }
};

// @desc    Create or update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = req.user._id;
    const { personal, isFresher, jobHistory, educationHistory, professional, jobPrefs } = req.body;

    console.log('Updating profile for user:', userId);
    console.log('Request body:', req.body);

    // Validate and format jobHistory for non-freshers
    let updatedJobHistory = jobHistory || [];
    if (!isFresher) {
      if (!Array.isArray(jobHistory) || jobHistory.length === 0 || 
          jobHistory.every(job => !job.company || !job.position || !job.startDate)) {
        return res.status(400).json({ 
          message: 'Job history must include at least one entry with company, position, and start date for non-freshers' 
        });
      }
      updatedJobHistory = jobHistory.map(job => ({
        company: job.company || '',
        position: job.position || '',
        startDate: job.startDate ? new Date(job.startDate) : null,
        endDate: job.endDate ? new Date(job.endDate) : null,
        description: job.description || ''
      }));
    } else {
      updatedJobHistory = []; // Clear jobHistory for freshers
    }

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      { 
        personal: personal || {},
        isFresher: isFresher || false,
        jobHistory: updatedJobHistory,
        educationHistory: educationHistory || [],
        professional: professional || {},
        jobPrefs: jobPrefs || {},
        user: userId,
        updatedAt: new Date()
      },
      { new: true, runValidators: true, upsert: true }
    );

    console.log('Profile after update:', profile);

    res.status(200).json({ message: 'Profile saved successfully', profile });
  } catch (error) {
    console.error('🔥 Error in updateProfile:', error);
    res.status(500).json({ message: 'Error saving profile', error: error.message });
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