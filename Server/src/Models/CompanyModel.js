import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Company name is required"],
    trim: true,
    maxlength: [100, "Company name cannot exceed 100 characters"],
  },
  gstId: {
    type: String,
    required: [true, "GST ID is required"],
    unique: [true, "GST ID must be unique"],
    trim: true,
    match: [/^[0-9A-Z]{15}$/, "GST ID must be 15 alphanumeric characters"],
    uppercase: true,
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, "Address cannot exceed 500 characters"],
  },
  contactEmail: {
    type: String,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?\d{10,15}$/, "Phone number must be 10-15 digits"],
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+$/, "Please enter a valid URL starting with http:// or https://"],
  },
},

{
    timestamps: true,
});

// Index for efficient querying by gstId
companySchema.index({ gstId: 1 });

const Company = mongoose.model("Company", companySchema);

export default Company;