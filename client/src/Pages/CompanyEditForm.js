import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/CompanyEditForm.css";

function CompanyEditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    gstId: "",
    address: "",
    contactEmail: "",
    phoneNumber: "",
    website: "",
    logoUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/companies/${id}`,
          { withCredentials: true }
        );
        setFormData(response.data.company);
        setPreviewUrl(response.data.company.logoUrl || "");
        setLoading(false);
      } catch (err) {
        console.error("Error fetching company:", err);
        setError(err.response?.data?.message || "Failed to fetch company");
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("gstId", formData.gstId);
    data.append("address", formData.address);
    data.append("contactEmail", formData.contactEmail);
    data.append("phoneNumber", formData.phoneNumber);
    data.append("website", formData.website);
    if (selectedFile) {
      data.append("logo", selectedFile);
    }

    try {
      await axios.put(`http://localhost:5000/api/companies/${id}`, data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/companyList");
    } catch (err) {
      console.error("Error updating company:", err);
      setSubmitError(err.response?.data?.message || "Failed to update company");
    }
  };

  if (loading) return <p className="form-info">Loading...</p>;
  if (error) return <p className="form-error">{error}</p>;

  return (
    <div className="company-edit-container">
      <h2 className="form-header">Edit Company</h2>
      <form className="company-edit-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Company Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="gstId">GST ID</label>
          <input
            type="text"
            id="gstId"
            name="gstId"
            value={formData.gstId}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
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
          />
        </div>
        <div className="form-group">
          <label htmlFor="logo">Company Logo</label>
          <input
            type="file"
            id="logo"
            name="logo"
            accept="image/*"
            onChange={handleFileChange}
          />
          {previewUrl && (
            <div className="logo-preview">
              <img
                src={previewUrl}
                alt="Logo Preview"
                onError={(e) => {
                  e.target.src =
                    "https://www.creativefabrica.com/wp-content/uploads/2022/10/04/Architecture-building-company-icon-Graphics-40076545-1-1-580x386.jpg";
                }}
              />
            </div>
          )}
        </div>
        {submitError && <p className="form-error">{submitError}</p>}
        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Save Changes
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/companyList")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CompanyEditForm;