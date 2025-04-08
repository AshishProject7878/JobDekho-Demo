import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    salary: {
        min: {
            type: Number,
            required: false,
        },
        max: {
            type: Number,
            required: false,
        },
        currency: {
            type: String,
            default: "LPA", // Assuming LPA as default; could be configurable
            enum: ["LPA", "USD", "EUR", "INR"], // Add more as needed
        },
    },
    experience: {
        type: String, // e.g., "2-4 years"
        required: false,
    },
    educationLevel: {
        type: String,
        enum: ["High School", "Graduate", "Post Graduate", ""],
        required: false,
    },
    languages: {
        type: [String], // Array of languages like ["English", "Hindi"]
        required: false,
    },
    responsibilities: {
        type: String, // Store formatted text for key responsibilities
        required: false,
    },
    roleExperience: {
        type: String, // Store formatted text for role & experience
        required: false,
    },
    skills: {
        type: [String], // Array of skills
        required: false,
    },
    type: {
        type: String,
        enum: ["Full-time", "Part-time", "Internship", "Contract"],
        required: false,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, // Assuming a job posting must be tied to a user
    },
    status: {
        type: String,
        enum: ["Draft", "Published", "Closed"],
        default: "Draft",
    },
    applicationDeadline: {
        type: Date,
        required: false,
    },
    remote: {
        type: Boolean,
        default: false,
    },
    contactEmail: {
        type: String,
        required: true,
        match: [/.+\@.+\..+/, "Please enter a valid email address"]
    },
    views: {
        type: Number,
        default: 0, // To track how many times the job post has been viewed
    },
}, {
    timestamps: true,
});

export default mongoose.model("Post", postSchema);