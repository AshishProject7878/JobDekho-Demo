import Profile from '../Models/ProfileModel.js';
import Post from '../Models/PostModel.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

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
        minCompanyRating: autoJobPrefs.minCompanyRating ?? 0,
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
    const profile = await Profile.findOne({ user: userId }).populate('user', 'email').populate({
      path: 'autoJobApplications.jobId',
      populate: {
        path: 'company',
        select: 'name rating',
      },
    }).populate({
      path: 'manualApplications.jobId',
      populate: {
        path: 'company',
        select: 'name rating',
      },
    });

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

// @desc    Get all profiles
// @route   GET /api/profile/all
// @access  Private
export const getAllProfiles = async (req, res) => {
  try {
    const { search, skills, position, page = 1, limit = 6 } = req.query;

    // Build query
    let query = {};

    // Search across multiple fields
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex
      query.$or = [
        { 'personal.fullName': searchRegex },
        { 'professional.jobTitle': searchRegex },
        { 'professional.skills': searchRegex },
        { 'jobHistory.description': searchRegex },
        { 'jobHistory.position': searchRegex },
        { 'jobHistory.company': searchRegex },
      ];
    }

    // Filter by skills (array contains any of the selected skills)
    if (skills) {
      const skillsArray = skills.split(',').map((skill) => skill.trim());
      query['professional.skills'] = { $in: skillsArray };
    }

    // Filter by position (job title)
    if (position) {
      query['professional.jobTitle'] = new RegExp(position, 'i');
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Fetch profiles with pagination
    const profiles = await Profile.find(query)
      .populate('user', 'email')
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalProfiles = await Profile.countDocuments(query);

    res.status(200).json({
      profiles,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalProfiles / limitNum),
        totalProfiles,
      },
    });
  } catch (error) {
    console.error('🔥 Error in getAllProfiles:', error);
    res.status(500).json({ message: 'Error fetching profiles', error: error.message });
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
    const { skills, resumeUrl } = req.body;

    const profile = await Profile.findOne({ user: userId }).populate('user', 'email');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (!profile.autoJobPrefs.enabled) {
      return res.status(400).json({ message: 'Auto job application is disabled' });
    }

    // Use provided resumeUrl or profile resumeUrl
    const effectiveResumeUrl = resumeUrl || profile.personal.resumeUrl;
    if (!effectiveResumeUrl) {
      return res.status(400).json({ message: 'Resume is required for auto-applications' });
    }

    // Use provided skills or profile skills
    const effectiveSkills = Array.isArray(skills) && skills.length > 0 
      ? skills 
      : profile.autoJobPrefs.skills;
    if (!effectiveSkills || effectiveSkills.length === 0) {
      return res.status(400).json({ message: 'At least one skill is required' });
    }

    // Normalize skills (trim, lowercase, remove duplicates)
    const normalizedSkills = [...new Set(effectiveSkills.map(skill => skill.trim().toLowerCase()))];
    console.log('Normalized skills:', normalizedSkills);

    // Build query for skill-based matching
    const query = {
      applicationDeadline: { $gte: new Date() },
      skills: { $in: normalizedSkills.map(skill => new RegExp(skill, 'i')) },
    };
    console.log('Auto-apply job query:', query);

    // Find matching jobs
    const jobs = await Post.find(query).populate('company', 'name rating');
    console.log('Matching jobs:', jobs);

    if (!jobs || jobs.length === 0) {
      return res.status(200).json({
        message: 'No open jobs found matching your skills',
        appliedJobs: []
      });
    }

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ashishroy78782@gmail.com',
        pass: 'nrle bjbn oeex qfqw',
      },
    });

    // Apply to jobs
    const appliedJobs = [];
    const appliedJobIds = profile.autoJobApplications.map(app => app.jobId.toString());

    for (const job of jobs) {
      if (appliedJobIds.includes(job._id.toString())) {
        console.log(`Job ${job._id} already applied, skipping`);
        continue;
      }

      // Send email to job contact via Nodemailer
      let emailSent = false;
      if (job.contactEmail) {
        const mailOptions = {
          from: `"Job Applicant" <${process.env.EMAIL_USER}>`,
          to: job.contactEmail,
          replyTo: profile.user.email || 'no-reply@jobdekho.com',
          subject: `Application for ${job.title} at ${job.company?.name || 'Unknown Company'}`,
          html: `
            <h2>Job Application</h2>
            <p>Dear Hiring Manager,</p>
            <p>I am applying for the <strong>${job.title}</strong> position at <strong>${job.company?.name || 'Unknown Company'}</strong>.</p>
            <p>Please find my resume at: <a href="${effectiveResumeUrl}">${effectiveResumeUrl}</a></p>
            ${profile.personal.videoResumeUrl ? `<p>Video Resume: <a href="${profile.personal.videoResumeUrl}">${profile.personal.videoResumeUrl}</a></p>` : ''}
            <p>Thank you for considering my application. I look forward to the opportunity to discuss my qualifications further.</p>
            <p>Best regards,<br>${profile.user.email ? profile.user.email.split('@')[0] : 'Job Applicant'}</p>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Email sent for job ${job._id} to ${job.contactEmail}`);
          emailSent = true;
        } catch (emailError) {
          console.error(`Failed to send email for job ${job._id}:`, emailError);
          // Continue to record application even if email fails
        }
      }

      // Create application record
      profile.autoJobApplications.push({
        jobId: job._id,
        appliedAt: new Date(),
        status: 'Applied',
        resumeUrl: effectiveResumeUrl,
      });
      appliedJobs.push({
        _id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        skills: job.skills,
      });
    }

    await profile.save();

    res.status(200).json({
      message: appliedJobs.length > 0 
        ? `Successfully applied to ${appliedJobs.length} new job(s)`
        : 'No new applications created (possible duplicates)',
      appliedJobs
    });
  } catch (error) {
    console.error('🔥 Error in autoApplyJobs:', error);
    res.status(500).json({ message: 'Error auto-applying to jobs', error: error.message });
  }
};

// @desc    Save manual job application
// @route   POST /api/profile/manual-apply
// @access  Private
export const saveManualApplication = async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId, resumeUrl } = req.body;

    if (!jobId || !resumeUrl) {
      return res.status(400).json({ message: 'jobId and resumeUrl are required' });
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if job is already applied manually
    const existingApplication = profile.manualApplications.find(
      app => app.jobId.toString() === jobId
    );
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job manually' });
    }

    profile.manualApplications.push({
      jobId,
      resumeUrl,
      appliedAt: new Date(),
      status: 'Applied',
    });

    await profile.save();

    res.status(200).json({ message: 'Manual application saved successfully' });
  } catch (error) {
    console.error('🔥 Error in saveManualApplication:', error);
    res.status(500).json({ message: 'Error saving manual application', error: error.message });
  }
};

// @desc    Get manually applied jobs
// @route   GET /api/profile/manual-applications
// @access  Private
export const getManualAppliedJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ user: userId }).populate({
      path: 'manualApplications.jobId',
      populate: {
        path: 'company',
        select: 'name rating',
      },
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile.manualApplications);
  } catch (error) {
    console.error('🔥 Error in getManualAppliedJobs:', error);
    res.status(500).json({ message: 'Error fetching manually applied jobs', error: error.message });
  }
};