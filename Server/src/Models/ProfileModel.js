import mongoose from 'mongoose';

const PersonalSchema = new mongoose.Schema({
    dob: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        trim: true
    },
    profilePicture: {
        type: String,
        default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y", // Default avatar
        trim: true
    }
});

const JobHistorySchema = new mongoose.Schema({
    company: {
        type: String,
        trim: true
    },
    position: {
        type: String,
        trim: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date,
        validate: {
            validator: function(value) {
                return !this.startDate || !value || value >= this.startDate;
            },
            message: 'End date must be after start date'
        }
    },
    description: {
        type: String,
        trim: true
    }
});

const EducationHistorySchema = new mongoose.Schema({
    degree: {
        type: String,
        trim: true
    },
    institution: {
        type: String,
        trim: true
    },
    field: {
        type: String,
        trim: true
    },
    graduationYear: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear()
    }
});

const ProfessionalSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    experience: {
        type: Number,
        min: 0
    },
    skills: [{
        type: String,
        trim: true
    }]
});

const JobPrefsSchema = new mongoose.Schema({
    roles: [{
        type: String,
        trim: true
    }],
    locations: [{
        type: String,
        trim: true
    }],
    salary: {
        type: String,
        trim: true
    },
    employmentType: [{
        type: String,
        enum: ['full-time', 'part-time', 'remote', 'freelance'],
        trim: true
    }]
});

const ProfileSchema = new mongoose.Schema({
    personal: {
        type: PersonalSchema,
    },
    isFresher: {
        type: Boolean,
        default: false
    },
    jobHistory: [JobHistorySchema],
    educationHistory: [EducationHistorySchema],
    professional: {
        type: ProfessionalSchema,
    },
    jobPrefs: {
        type: JobPrefsSchema,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Ensure one profile per user
    }
}, {
    timestamps: true
});

// Pre-save middleware to clear jobHistory for freshers
ProfileSchema.pre('save', function(next) {
    if (this.isFresher && this.jobHistory.length > 0) {
        this.jobHistory = [];
    }
    next();
});

const Profile = mongoose.model('Profile', ProfileSchema);

export default Profile;