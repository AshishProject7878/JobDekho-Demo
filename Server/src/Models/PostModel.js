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
    category: {
  type: String,
  required: true,
  enum: [
    // --- Tech & IT ---
    "Software Development",
    "Web Development",
    "Mobile App Development",
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "Data Science",
    "Machine Learning",
    "Artificial Intelligence",
    "Cybersecurity",
    "Cloud Computing",
    "DevOps",
    "Blockchain",
    "IT Support",
    "Database Administration",
    "Network Engineering",
    "Game Development",
    "Quality Assurance",
    "UI/UX Design",
    "Product Management",
    "Project Management",
    
    // --- Business, Sales & Marketing ---
    "Digital Marketing",
    "Social Media Management",
    "Content Marketing",
    "SEO/SEM",
    "Marketing Strategy",
    "Business Development",
    "Sales",
    "Retail",
    "Customer Support",
    "Technical Sales",
    "Telemarketing",
    "E-commerce",
    "Brand Management",
    "Market Research",
    
    // --- Creative & Media ---
    "Graphic Design",
    "Visual Design",
    "Animation",
    "Illustration",
    "Video Editing",
    "Photography",
    "Content Writing",
    "Copywriting",
    "Blogging",
    "Scriptwriting",
    "Journalism",
    "Media & Broadcasting",
    "Public Relations",
    "Film Production",
    
    // --- Education & Research ---
    "Teaching",
    "Online Tutoring",
    "Curriculum Design",
    "Research",
    "Academic Writing",
    "Educational Counseling",
    "Library Science",
    
    // --- Finance & Legal ---
    "Accounting",
    "Auditing",
    "Bookkeeping",
    "Taxation",
    "Finance",
    "Banking",
    "Insurance",
    "Investment Management",
    "Legal Advisory",
    "Law Practice",
    "Paralegal",
    "Compliance",
    
    // --- HR & Admin ---
    "Human Resources",
    "Recruitment",
    "Training & Development",
    "Payroll Management",
    "Office Administration",
    "Executive Assistant",
    "Data Entry",
    
    // --- Healthcare & Wellness ---
    "Healthcare",
    "Medical",
    "Nursing",
    "Physiotherapy",
    "Pharmacy",
    "Dentistry",
    "Mental Health",
    "Nutritionist",
    "Lab Technician",
    "Veterinary",
    
    // --- Engineering ---
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Environmental Engineering",
    "Industrial Engineering",
    "Biomedical Engineering",
    "Structural Engineering",
    
    // --- Architecture & Construction ---
    "Architecture",
    "Urban Planning",
    "Interior Design",
    "Construction Management",
    "Site Engineering",
    "Surveying",
    
    // --- Manufacturing, Logistics & Operations ---
    "Manufacturing",
    "Production Management",
    "Warehouse Operations",
    "Supply Chain Management",
    "Procurement",
    "Inventory Management",
    "Logistics",
    "Transportation",
    "Quality Control",
    
    // --- Government & Nonprofit ---
    "Government",
    "Public Policy",
    "Civil Services",
    "Defense & Military",
    "Nonprofit",
    "NGO",
    "Social Work",
    
    // --- Hospitality, Tourism & Events ---
    "Hospitality",
    "Hotel Management",
    "Travel & Tourism",
    "Event Management",
    "Food & Beverage",
    
    // --- Skilled Trades & Technical Jobs ---
    "Electrician",
    "Plumber",
    "Carpenter",
    "Mechanic",
    "Welding",
    "HVAC Technician",
    "Machinist",
    "CNC Operator",
    
    // --- Other / Emerging ---
    "Remote Jobs",
    "Freelance",
    "Internships",
    "Entry-Level",
    "Others"
  ],
  default: "Others"
}

}, {
    timestamps: true,
});

export default mongoose.model("Post", postSchema);