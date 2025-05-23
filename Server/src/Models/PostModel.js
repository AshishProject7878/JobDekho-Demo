import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  salary: {
    min: {
      type: Number,
      min: 0,
      required: false,
    },
    max: {
      type: Number,
      min: 0,
      required: false,
    },
    currency: {
      type: String,
      default: 'LPA',
      enum: ['LPA', 'USD', 'EUR', 'INR'],
    },
  },
  experience: {
    type: String,
    required: false,
    trim: true,
  },
  educationLevel: {
    type: String,
    enum: ['High School', 'Graduate', 'Post Graduate', ''],
    required: false,
  },
  languages: {
    type: [String],
    required: false,
    default: [],
  },
  responsibilities: {
    type: String,
    required: false,
    trim: true,
  },
  roleExperience: {
    type: String,
    required: false,
    trim: true,
  },
  skills: {
    type: [String],
    required: true,
    validate: {
      validator: (skills) => skills.length > 0,
      message: 'At least one skill is required',
    },
    set: (skills) => skills.map(skill => skill.trim().toLowerCase()), // Normalize skills
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract', ''],
    required: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  applicationDeadline: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  },
  remote: {
    type: Boolean,
    default: false,
  },
  contactEmail: {
    type: String,
    required: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
    trim: true,
  },
  views: {
    type: Number,
    default: 0,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Software Development',
      'Web Development',
      'Mobile App Development',
      'Frontend Development',
      'Backend Development',
      'Full Stack Development',
      'Data Science',
      'Machine Learning',
      'Artificial Intelligence',
      'Cybersecurity',
      'Cloud Computing',
      'DevOps',
      'Blockchain',
      'IT Support',
      'Database Administration',
      'Network Engineering',
      'Game Development',
      'Quality Assurance',
      'UI/UX Design',
      'Product Management',
      'Project Management',
      'Digital Marketing',
      'Social Media Management',
      'Content Marketing',
      'SEO/SEM',
      'Marketing Strategy',
      'Business Development',
      'Sales',
      'Retail',
      'Customer Support',
      'Technical Sales',
      'Telemarketing',
      'E-commerce',
      'Brand Management',
      'Market Research',
      'Graphic Design',
      'Visual Design',
      'Animation',
      'Illustration',
      'Video Editing',
      'Photography',
      'Content Writing',
      'Copywriting',
      'Blogging',
      'Scriptwriting',
      'Journalism',
      'Media & Broadcasting',
      'Public Relations',
      'Film Production',
      'Teaching',
      'Online Tutoring',
      'Curriculum Design',
      'Research',
      'Academic Writing',
      'Educational Counseling',
      'Library Science',
      'Accounting',
      'Auditing',
      'Bookkeeping',
      'Taxation',
      'Finance',
      'Banking',
      'Insurance',
      'Investment Management',
      'Legal Advisory',
      'Law Practice',
      'Paralegal',
      'Compliance',
      'Human Resources',
      'Recruitment',
      'Training & Development',
      'Payroll Management',
      'Office Administration',
      'Executive Assistant',
      'Data Entry',
      'Healthcare',
      'Medical',
      'Nursing',
      'Physiotherapy',
      'Pharmacy',
      'Dentistry',
      'Mental Health',
      'Nutritionist',
      'Lab Technician',
      'Veterinary',
      'Mechanical Engineering',
      'Electrical Engineering',
      'Civil Engineering',
      'Chemical Engineering',
      'Environmental Engineering',
      'Industrial Engineering',
      'Biomedical Engineering',
      'Structural Engineering',
      'Architecture',
      'Urban Planning',
      'Interior Design',
      'Construction Management',
      'Site Engineering',
      'Surveying',
      'Manufacturing',
      'Production Management',
      'Warehouse Operations',
      'Supply Chain Management',
      'Procurement',
      'Inventory Management',
      'Logistics',
      'Transportation',
      'Quality Control',
      'Government',
      'Public Policy',
      'Civil Services',
      'Defense & Military',
      'Nonprofit',
      'NGO',
      'Social Work',
      'Hospitality',
      'Hotel Management',
      'Travel & Tourism',
      'Event Management',
      'Food & Beverage',
      'Electrician',
      'Plumber',
      'Carpenter',
      'Mechanic',
      'Welding',
      'HVAC Technician',
      'Machinist',
      'CNC Operator',
      'Remote Jobs',
      'Freelance',
      'Internships',
      'Entry-Level',
      'Others',
    ],
    default: 'Others',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Post', postSchema);