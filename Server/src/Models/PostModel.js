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
        type: String,
        required: false,
    },
    requirements: {
        type: [String], // Array of strings for multiple requirements
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
    },
},
    {
        timestamps: true,
    }
);

export default mongoose.model("Post", postSchema);