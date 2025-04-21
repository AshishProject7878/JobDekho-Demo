import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    gstId: {
      type: String,
      required: [true, 'GST ID is required'],
      unique: [true, 'GST ID must be unique'],
      trim: true,
      match: [/^[0-9A-Z]{15}$/, 'GST ID must be 15 alphanumeric characters'],
      uppercase: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    contactEmail: {
      type: String,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?\d{10,15}$/, 'Phone number must be 10-15 digits'],
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+$/, 'Please enter a valid URL starting with http:// or https://'],
    },
    logoUrl: {
      type: String,
      trim: true,
      default: 'https://www.creativefabrica.com/wp-content/uploads/2022/10/04/Architecture-building-company-icon-Graphics-40076545-1-1-580x386.jpg',
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: [1, 'Rating must be at least 1'],
          max: [5, 'Rating cannot exceed 5'],
        },
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
  },
  {
    timestamps: true,
  }
);

// Update rating field when ratings array changes
companySchema.pre('save', function (next) {
  if (this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, r) => sum + r.rating, 0);
    this.rating = totalRating / this.ratings.length;
  } else {
    this.rating = 0;
  }
  next();
});

// Index for efficient querying by gstId
companySchema.index({ gstId: 1 });
// Index for efficient rating queries
companySchema.index({ 'ratings.user': 1 });

const Company = mongoose.model('Company', companySchema);

export default Company;