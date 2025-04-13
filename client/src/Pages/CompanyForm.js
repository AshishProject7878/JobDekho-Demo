import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/CompanyForm.css";

function CompanyForm({ companyId = null }) { // Pass companyId for updates
  const [formData, setFormData] = useState({
    companyName: "",
    gstId: "",
    address: "",
    contactEmail: "",
    phoneNumber: "",
    website: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch company data for update
  useEffect(() => {
    if (companyId) {
      const fetchCompany = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/companies/${companyId}`);
          const { name, gstId, address, contactEmail, phoneNumber, website } = response.data.company;
          setFormData({ companyName: name, gstId, address, contactEmail, phoneNumber, website });
        } catch (err) {
          setError("Failed to load company data");
        }
      };
      fetchCompany();
    }
  }, [companyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!formData.companyName || !formData.gstId) {
      setError("Company Name and GST ID are required.");
      setLoading(false);
      return;
    }
    const gstRegex = /^[0-9A-Z]{15}$/;
    if (!gstRegex.test(formData.gstId)) {
      setError("GST ID must be 15 alphanumeric characters.");
      setLoading(false);
      return;
    }

    const postData = {
      name: formData.companyName,
      gstId: formData.gstId,
      address: formData.address || undefined,
      contactEmail: formData.contactEmail || undefined,
      phoneNumber: formData.phoneNumber || undefined,
      website: formData.website || undefined,
    };

    try {
      if (companyId) {
        // Update company
        const response = await axios.put(
          `http://localhost:5000/api/companies/${companyId}`,
          postData,
          { withCredentials: true }
        );
        setSuccess("Company updated successfully!");
      } else {
        // Register company
        const response = await axios.post(
          "http://localhost:5000/api/companies",
          postData,
          { withCredentials: true }
        );
        setSuccess("Company registered successfully!");
      }
      setFormData({
        companyName: "",
        gstId: "",
        address: "",
        contactEmail: "",
        phoneNumber: "",
        website: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="company-form-container">
      <div className="form-header">
        <h2>{companyId ? "Update Company" : "Register Your Company"}</h2>
      </div>
      <form onSubmit={handleSubmit} className="company-form">
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <div className="form-group">
          <label htmlFor="companyName">Company Name *</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="e.g. Wrogan Tech Solutions"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="gstId">GST ID *</label>
          <input
            type="text"
            id="gstId"
            name="gstId"
            value={formData.gstId}
            onChange={handleChange}
            placeholder="e.g. 22AAAAA0000A1Z5"
            required
            maxLength={15}
          />
          <small>Enter a valid 15-character GST ID</small>
        </div>
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g. 123 Maplewood Drive, Springfield, Illinois"
            rows="3"
          />
        </div>
        <div className="form-group">
          <label htmlFor="contactEmail">Contact Email</label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="e.g. contact@wrogan.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="e.g. +1234567890"
          />
        </div>
        <div className="form-group">
          <label htmlFor="website">Website</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="e.g. https://www.wrogan.com"
          />
        </div>
        <div className="form-navigation">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Processing..." : companyId ? "Update Company" : "Register Company"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CompanyForm;