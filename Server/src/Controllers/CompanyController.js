import Company from "../Models/CompanyModel.js";

// Register a new company
const registerCompany = async (req, res) => {
  try {
    const { name, gstId, address, contactEmail, phoneNumber, website, logoUrl } = req.body;

    // Basic validation
    if (!name || !gstId) {
      return res.status(400).json({ message: "Company name and GST ID are required" });
    }

    // Create new company instance
    const company = new Company({
      name,
      gstId,
      address,
      contactEmail,
      phoneNumber,
      website,
      logoUrl,
    });

    // Save to database
    const savedCompany = await company.save();

    res.status(201).json({
      message: "Company registered successfully",
      company: {
        id: savedCompany._id,
        name: savedCompany.name,
        gstId: savedCompany.gstId,
        address: savedCompany.address,
        contactEmail: savedCompany.contactEmail,
        phoneNumber: savedCompany.phoneNumber,
        website: savedCompany.website,
        logoUrl: savedCompany.logoUrl,
        createdAt: savedCompany.createdAt,
      },
    });
  } catch (error) {
    console.error("Error registering company:", error);
    if (error.code === 11000 && error.keyPattern?.gstId) {
      return res.status(400).json({ message: "GST ID already exists" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Server error during company registration" });
  }
};

// Get all companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().select("-__v");
    res.status(200).json({
      message: "Companies retrieved successfully",
      count: companies.length,
      companies,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Server error while fetching companies" });
  }
};

// Get a company by ID
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    // Find company
    const company = await Company.findById(id).select("-__v");

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({
      message: "Company retrieved successfully",
      company,
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid company ID" });
    }
    res.status(500).json({ message: "Server error while fetching company" });
  }
};

// Update a company by ID
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gstId, address, contactEmail, phoneNumber, website, logoUrl } = req.body;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    // Check if company exists
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Prepare update data
    const updateData = {
      name: name || company.name,
      gstId: gstId || company.gstId,
      address: address !== undefined ? address : company.address,
      contactEmail: contactEmail !== undefined ? contactEmail : company.contactEmail,
      phoneNumber: phoneNumber !== undefined ? phoneNumber : company.phoneNumber,
      website: website !== undefined ? website : company.website,
      logoUrl: logoUrl !== undefined ? logoUrl : company.logoUrl,
    };

    // Update company
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    console.error("Error updating company:", error);
    if (error.code === 11000 && error.keyPattern?.gstId) {
      return res.status(400).json({ message: "GST ID already exists" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Server error during company update" });
  }
};

// Delete a company by ID
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    // Delete company
    const deletedCompany = await Company.findByIdAndDelete(id);

    if (!deletedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({
      message: "Company deleted successfully",
      company: {
        id: deletedCompany._id,
        name: deletedCompany.name,
        gstId: deletedCompany.gstId,
      },
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid company ID" });
    }
    res.status(500).json({ message: "Server error during company deletion" });
  }
};

// Rate a company
const rateCompany = async (req, res) => {
  try {
    const { rating } = req.body;
    const { id } = req.params;
    const userId = req.user._id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Validate company ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    // Find company
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Check if user already rated
    const existingRating = company.ratings.find(
      (r) => r.user.toString() === userId.toString()
    );
    if (existingRating) {
      return res.status(400).json({ message: "You have already rated this company" });
    }

    // Add new rating
    company.ratings.push({ user: userId, rating });

    // Calculate average rating
    const totalRatings = company.ratings.length;
    const sumRatings = company.ratings.reduce((sum, r) => sum + r.rating, 0);
    company.averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    // Save company
    const updatedCompany = await company.save();

    res.status(200).json({
      message: "Rating submitted successfully",
      company: {
        id: updatedCompany._id,
        averageRating: updatedCompany.averageRating,
        ratingsCount: updatedCompany.ratings.length,
      },
    });
  } catch (error) {
    console.error("Error rating company:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid company ID" });
    }
    res.status(500).json({ message: "Server error during rating submission" });
  }
};

export {
  registerCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  rateCompany,
};