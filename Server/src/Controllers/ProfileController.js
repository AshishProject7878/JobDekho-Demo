import Profile from '../Models/ProfileModel.js';
import Post from '../Models/PostModel.js';

// @desc    Create a new user profile
// @route   POST /api/profile
// @access  Private
export const createProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      personal = {},
      isFresher = false,
      jobHistory = [],
      educationHistory = [],
      professional = {},
      jobPrefs = {},
      autoJobPrefs = {},
    } = req.body;

    console.log('Creating profile for user:', userId, 'with body:', req.body);

    const existingProfile = await Profile.findOne({ user: userId });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    // Parse salary for autoJobPrefs.minSalary
    let minSalary = 0;
    if (jobPrefs.salary && typeof jobPrefs.salary === 'string') {
      const match = jobPrefs.salary.match(/₹?([\d,]+)\s*(?:-\s*₹?[\d,]+)?/);
      if (match) {
        minSalary = Number(match[1].replace(/,/g, '')) / 100000; // Convert to LPA
      }
    }

    const newProfile = new Profile({
      user: userId,
      personal: {
        fullName: personal.fullName || '',
        email: personal.email || '',
        dob: personal.dob || '',
        gender: personal.gender || '',
        profilePicture: personal.profilePicture || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
        resumeUrl: personal.resumeUrl || '',
        videoResumeUrl: personal.videoResumeUrl || '',
        resumePublicId: personal.resumePublicId || '',
        videoResumePublicId: personal.videoResumePublicId || '',
      },
      isFresher,
      jobHistory: isFresher ? [] : jobHistory.map(job => ({
        company: job.company || '',
        position: job.position || '',
        startDate: job.startDate || '',
        endDate: job.endDate || '',
        description: job.description || '',
      })),
      educationHistory: educationHistory.map(edu => ({
        degree: edu.degree || '',
        institution: edu.institution || '',
        field: edu.field || '',
        graduationYear: edu.graduationYear || '',
      })),
      professional: {
        jobTitle: professional.jobTitle || '',
        company: professional.company || '',
        experience: professional.experience || '',
        skills: Array.isArray(professional.skills) ? professional.skills : [],
      },
      jobPrefs: {
        roles: Array.isArray(jobPrefs.roles) ? jobPrefs.roles : [],
        locations: Array.isArray(jobPrefs.locations) ? jobPrefs.locations : [],
        salary: jobPrefs.salary || '',
        employmentType: Array.isArray(jobPrefs.employmentType) ? jobPrefs.employmentType : [],
      },
      autoJobPrefs: {
        enabled: autoJobPrefs.enabled ?? false,
        minSalary,
        experienceLevel: autoJobPrefs.experienceLevel || '',
        categories: Array.isArray(autoJobPrefs.categories) ? autoJobPrefs.categories : [],
        skills: Array.isArray(autoJobPrefs.skills) ? autoJobPrefs.skills : [],
        remoteOnly: autoJobPrefs.remoteOnly ?? false,
        minCompanyRating: autoJobPrefs.minCompanyRating ?? 0, // Respect provided value or default to 0
      },
    });

    await newProfile.save();
    res.status(201).json({ message: 'Profile created successfully', profile: newProfile });
  } catch (error) {
    console.error('🔥 Error in createProfile:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        path: err.path,
        message: err.message,
      }));
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key error, possibly duplicate email', error: error.message });
    }
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
    const { personal, isFresher, jobHistory, educationHistory, professional, jobPrefs, autoJobPrefs } = req.body;

    console.log('Updating profile for user:', userId);
    console.log('Request body:', req.body);

    const existingProfile = await Profile.findOne({ user: userId });
    if (!existingProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // If only updating autoJobPrefs, check for changes to avoid redundant updates
    if (autoJobPrefs && !personal && isFresher === undefined && !jobHistory && !educationHistory && !professional && !jobPrefs) {
      const currentPrefs = existingProfile.autoJobPrefs.toObject();
      const newPrefs = {
        enabled: autoJobPrefs.enabled ?? currentPrefs.enabled,
        minSalary: autoJobPrefs.minSalary ?? currentPrefs.minSalary,
        experienceLevel: autoJobPrefs.experienceLevel || currentPrefs.experienceLevel,
        categories: Array.isArray(autoJobPrefs.categories) ? autoJobPrefs.categories : currentPrefs.categories,
        skills: Array.isArray(autoJobPrefs.skills) ? autoJobPrefs.skills : currentPrefs.skills,
        remoteOnly: autoJobPrefs.remoteOnly ?? currentPrefs.remoteOnly,
        minCompanyRating: autoJobPrefs.minCompanyRating ?? currentPrefs.minCompanyRating,
      };
      // Skip update if no changes
      if (JSON.stringify(currentPrefs) === JSON.stringify(newPrefs)) {
        console.log('No changes in autoJobPrefs, skipping update');
        return res.status(200).json({ message: 'Profile unchanged', profile: existingProfile });
      }
      const profile = await Profile.findOneAndUpdate(
        { user: userId },
        { $set: { autoJobPrefs: newPrefs, updatedAt: new Date() } },
        { new: true, runValidators: true }
      );
      console.log('Profile after autoJobPrefs update:', profile);
      return res.status(200).json({ message: 'Profile saved successfully', profile });
    }

    // Parse salary for autoJobPrefs.minSalary
    let minSalary = existingProfile.autoJobPrefs.minSalary || 0;
    if (jobPrefs?.salary && typeof jobPrefs.salary === 'string') {
      const match = jobPrefs.salary.match(/₹?([\d,]+)\s*(?:-\s*₹?[\d,]+)?/);
      if (match) {
        minSalary = Number(match[1].replace(/,/g, '')) / 100000;
      }
    }

    // Validate and format jobHistory for non-freshers
    let updatedJobHistory = jobHistory || existingProfile.jobHistory;
    const effectiveIsFresher = isFresher !== undefined ? isFresher : existingProfile.isFresher;
    if (!effectiveIsFresher) {
      if (!Array.isArray(updatedJobHistory) || updatedJobHistory.length === 0 ||
          updatedJobHistory.every(job => !job.company || !job.position || !job.startDate)) {
        return res.status(400).json({
          message: 'Job history must include at least one entry with company, position, and start date for non-freshers',
        });
      }
      updatedJobHistory = updatedJobHistory.map(job => ({
        company: job.company || '',
        position: job.position || '',
        startDate: job.startDate || '',
        endDate: job.endDate || '',
        description: job.description || '',
      }));
    } else {
      updatedJobHistory = [];
    }

    // Update profile with all fields
    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          personal: {
            fullName: personal?.fullName || existingProfile.personal.fullName || '',
            email: personal?.email || existingProfile.personal.email || '',
            dob: personal?.dob || existingProfile.personal.dob || '',
            gender: personal?.gender || existingProfile.personal.gender || '',
            profilePicture: personal?.profilePicture || existingProfile.personal.profilePicture || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
            resumeUrl: personal?.resumeUrl || existingProfile.personal.resumeUrl || '',
            videoResumeUrl: personal?.videoResumeUrl || existingProfile.personal.videoResumeUrl || '',
            resumePublicId: personal?.resumePublicId || existingProfile.personal.resumePublicId || '',
            videoResumePublicId: personal?.videoResumePublicId || existingProfile.personal.videoResumePublicId || '',
          },
          isFresher: effectiveIsFresher,
          jobHistory: updatedJobHistory,
          educationHistory: educationHistory?.map(edu => ({
            degree: edu.degree || '',
            institution: edu.institution || '',
            field: edu.field || '',
            graduationYear: edu.graduationYear || '',
          })) || existingProfile.educationHistory || [],
          professional: {
            jobTitle: professional?.jobTitle || existingProfile.professional.jobTitle || '',
            company: professional?.company || existingProfile.professional.company || '',
            experience: professional?.experience || existingProfile.professional.experience || '',
            skills: Array.isArray(professional?.skills) ? professional.skills : existingProfile.professional.skills || [],
          },
          jobPrefs: {
            roles: Array.isArray(jobPrefs?.roles) ? jobPrefs.roles : existingProfile.jobPrefs.roles || [],
            locations: Array.isArray(jobPrefs?.locations) ? jobPrefs.locations : existingProfile.jobPrefs.locations || [],
            salary: jobPrefs?.salary || existingProfile.jobPrefs.salary || '',
            employmentType: Array.isArray(jobPrefs?.employmentType) ? jobPrefs.employmentType : existingProfile.jobPrefs.employmentType || [],
          },
          autoJobPrefs: {
            enabled: autoJobPrefs?.enabled ?? existingProfile.autoJobPrefs.enabled,
            minSalary,
            experienceLevel: autoJobPrefs?.experienceLevel || existingProfile.autoJobPrefs.experienceLevel || '',
            categories: Array.isArray(autoJobPrefs?.categories) ? autoJobPrefs.categories : existingProfile.autoJobPrefs.categories || [],
            skills: Array.isArray(autoJobPrefs?.skills) ? autoJobPrefs.skills : existingProfile.autoJobPrefs.skills || [],
            remoteOnly: autoJobPrefs?.remoteOnly ?? existingProfile.autoJobPrefs.remoteOnly,
            minCompanyRating: autoJobPrefs?.minCompanyRating ?? existingProfile.autoJobPrefs.minCompanyRating ?? 0,
          },
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    console.log('Profile after update:', profile);

    res.status(200).json({ message: 'Profile saved successfully', profile });
  } catch (error) {
    console.error('🔥 Error in updateProfile:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        path: err.path,
        message: err.message,
      }));
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key error, possibly duplicate email', error: error.message });
    }
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
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('🔥 Error in getProfile:', error);
    res.status(500).json({
      message: 'Error fetching profile',
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
    const deletedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    if (!deletedProfile) {
      return res.status(404).json({ message: 'Profile not found or unauthorized' });
    }

    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('🔥 Error in deleteProfile:', error);
    res.status(500).json({ message: 'Error deleting profile', error: error.message });
  }
};

// @desc    Get profile by ID
// @route   GET /api/profile/:id
// @access  Private
export const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate('user', 'email');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('🔥 Error in getProfileById:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// @desc    Toggle auto job application
// @route   PATCH /api/profile/auto-job/toggle
// @access  Private
export const toggleAutoJob = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    profile.autoJobPrefs.enabled = !profile.autoJobPrefs.enabled;
    await profile.save();

    res.status(200).json({
      message: `Auto job application ${profile.autoJobPrefs.enabled ? 'enabled' : 'disabled'}`,
      enabled: profile.autoJobPrefs.enabled,
    });
  } catch (error) {
    console.error('🔥 Error in toggleAutoJob:', error);
    res.status(500).json({ message: 'Error toggling auto job', error: error.message });
  }
};

// @desc    Get auto-applied jobs
// @route   GET /api/profile/auto-job/applications
// @access  Private
export const getAutoAppliedJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ user: userId }).populate({
      path: 'autoJobApplications.jobId',
      populate: {
        path: 'company',
        select: 'name rating',
      },
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile.autoJobApplications);
  } catch (error) {
    console.error('🔥 Error in getAutoAppliedJobs:', error);
    res.status(500).json({ message: 'Error fetching auto-applied jobs', error: error.message });
  }
};

// @desc    Auto-apply to jobs based on preferences
// @route   POST /api/profile/auto-job/apply
// @access  Private
export const autoApplyJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (!profile.autoJobPrefs.enabled) {
      return res.status(400).json({ message: 'Auto job application is disabled' });
    }

    // Check for either resumeUrl or resume
    if (!profile.personal.resumeUrl && !profile.personal.resume) {
      return res.status(400).json({ message: 'Resume is required for auto-applications' });
    }

    // Build query based on autoJobPrefs
    const query = {
      status: 'Published',
      applicationDeadline: { $gte: new Date() },
    };

    if (profile.autoJobPrefs.categories?.length) {
      query.category = { $in: profile.autoJobPrefs.categories };
    }

    if (profile.autoJobPrefs.skills?.length) {
      query.skills = { $in: profile.autoJobPrefs.skills };
    }

    if (profile.autoJobPrefs.minSalary) {
      query['salary.min'] = { $gte: profile.autoJobPrefs.minSalary };
    }

    if (profile.autoJobPrefs.experienceLevel) {
      query.experience = profile.autoJobPrefs.experienceLevel;
    }

    if (profile.autoJobPrefs.remoteOnly) {
      query.remote = true;
    }

    if (profile.autoJobPrefs.minCompanyRating) {
      query['company.rating'] = { $gte: profile.autoJobPrefs.minCompanyRating };
    }

    console.log('Auto-apply job query:', query);

    const jobs = await Post.find(query).populate('company', 'name rating');
    const appliedJobIds = profile.autoJobApplications.map(app => app.jobId.toString());
    const newApplications = [];

    for (const job of jobs) {
      if (!appliedJobIds.includes(job._id.toString())) {
        profile.autoJobApplications.push({
          jobId: job._id,
          appliedAt: new Date(),
          status: 'Applied',
        });
        newApplications.push(job._id);
      }
    }

    await profile.save();

    res.status(200).json({
      message: `Successfully applied to ${newApplications.length} new jobs`,
      appliedJobs: newApplications,
    });
  } catch (error) {
    console.error('🔥 Error in autoApplyJobs:', error);
    res.status(500).json({ message: 'Error auto-applying to jobs', error: error.message });
  }
};