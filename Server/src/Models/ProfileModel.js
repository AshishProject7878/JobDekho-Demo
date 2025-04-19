import mongoose from 'mongoose';

const PersonalSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true,
    default: '',
  },
  email: {
    type: String,
    trim: true,
    default: '',
  },
  dob: {
    type: String,
    trim: true,
    default: '',
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''],
    trim: true,
    default: '',
  },
  profilePicture: {
    type: String,
    default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    trim: true,
  },
  resumeUrl: {
    type: String,
    trim: true,
    default: '',
  },
  resumePublicId: {
    type: String,
    trim: true,
    default: '',
  },
  videoResumeUrl: {
    type: String,
    trim: true,
    default: '',
  },
  videoResumePublicId: {
    type: String,
    trim: true,
    default: '',
  },
});

const JobHistorySchema = new mongoose.Schema({
  company: {
    type: String,
    trim: true,
    default: '',
  },
  position: {
    type: String,
    trim: true,
    default: '',
  },
  startDate: {
    type: String,
    trim: true,
    default: '',
  },
  endDate: {
    type: String,
    trim: true,
    default: '',
    validate: {
      validator: function (value) {
        return !this.startDate || !value || new Date(value) >= new Date(this.startDate);
      },
      message: 'End date must be after start date',
    },
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
});

const EducationHistorySchema = new mongoose.Schema({
  degree: {
    type: String,
    trim: true,
    default: '',
  },
  institution: {
    type: String,
    trim: true,
    default: '',
  },
  field: {
    type: String,
    trim: true,
    default: '',
  },
  graduationYear: {
    type: String,
    trim: true,
    default: '',
  },
});

const ProfessionalSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    trim: true,
    default: '',
  },
  company: {
    type: String,
    trim: true,
    default: '',
  },
  experience: {
    type: String,
    trim: true,
    default: '',
  },
  skills: [{
    type: String,
    trim: true,
  }],
});

const JobPrefsSchema = new mongoose.Schema({
  roles: [{
    type: String,
    trim: true,
  }],
  locations: [{
    type: String,
    trim: true,
  }],
  salary: {
    type: String,
    trim: true,
    default: '',
  },
  employmentType: [{
    type: String,
    enum: ['full-time', 'part-time', 'remote', 'freelance', ''],
    trim: true,
  }],
});

const AutoJobPrefsSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false,
  },
  minSalary: {
    type: Number,
    min: 0,
    default: 0,
  },
  experienceLevel: {
    type: String,
    enum: ['Entry', 'Mid', 'Senior', ''],
    default: '',
  },
  categories: [{
    type: String,
    trim: true,
  }],
  skills: [{
    type: String,
    trim: true,
  }],
  remoteOnly: {
    type: Boolean,
    default: false,
  },
  minCompanyRating: {
    type: Number,
    min: 0, // Changed to allow 0
    max: 5,
    default: 0,
  },
});

const AutoJobApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

const ProfileSchema = new mongoose.Schema({
  personal: {
    type: PersonalSchema,
    default: () => ({}),
  },
  isFresher: {
    type: Boolean,
    default: false,
  },
  jobHistory: [JobHistorySchema],
  educationHistory: [EducationHistorySchema],
  professional: {
    type: ProfessionalSchema,
    default: () => ({}),
  },
  jobPrefs: {
    type: JobPrefsSchema,
    default: () => ({}),
  },
  autoJobPrefs: {
    type: AutoJobPrefsSchema,
    default: () => ({}),
  },
  autoJobApplications: [AutoJobApplicationSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
}, {
  timestamps: true,
});

// Pre-save middleware to clear jobHistory for freshers
ProfileSchema.pre('save', function (next) {
  if (this.isFresher && this.jobHistory.length > 0) {
    this.jobHistory = [];
  }
  next();
});

const Profile = mongoose.model('Profile', ProfileSchema);

export default Profile;