import mongoose from 'mongoose';

const PersonalSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other'],
        trim: true
    }
});

const JobHistorySchema = new mongoose.Schema({
    company: {
        type: String,
        required: function() {
            return !this.parent().isFresher;
        },
        trim: true
    },
    position: {
        type: String,
        required: function() {
            return !this.parent().isFresher;
        },
        trim: true
    },
    startDate: {
        type: Date,
        required: function() {
            return !this.parent().isFresher;
        }
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
        required: function() {
            return !this.parent().isFresher;
        },
        trim: true
    }
});

const EducationHistorySchema = new mongoose.Schema({
    degree: {
        type: String,
        required: true,
        trim: true
    },
    institution: {
        type: String,
        required: true,
        trim: true
    },
    field: {
        type: String,
        required: true,
        trim: true
    },
    graduationYear: {
        type: Number,
        required: true,
        min: 1900,
        max: new Date().getFullYear()
    }
});

const ProfessionalSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    experience: {
        type: Number,
        required: true,
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
        required: true,
        trim: true
    }],
    locations: [{
        type: String,
        required: true,
        trim: true
    }],
    salary: {
        type: String,
        required: true,
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
        required: true
    },
    isFresher: {
        type: Boolean,
        default: false
    },
    jobHistory: [JobHistorySchema],
    educationHistory: [EducationHistorySchema],
    professional: {
        type: ProfessionalSchema,
        required: true
    },
    jobPrefs: {
        type: JobPrefsSchema,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add the pre-save middleware
ProfileSchema.pre('save', function(next) {
    if (this.isFresher && this.jobHistory.length > 0) {
        this.jobHistory = [];
    }
    next();
});

const Profile = mongoose.model('Profile', ProfileSchema);

export default Profile;