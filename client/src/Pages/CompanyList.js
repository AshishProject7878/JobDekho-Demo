import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/CompanyList.css";

function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch all companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/companies", {
          withCredentials: true,
        });
        setCompanies(response.data.companies || []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch companies");
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // Handle delete company
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?")) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/companies/${id}`, {
        withCredentials: true,
      });
      setCompanies(companies.filter((company) => company._id !== id));
      alert("Company deleted successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete company");
    }
  };

  // Navigate to update form
  const handleUpdate = (id) => {
    navigate(`/companies/edit/${id}`);
  };

  if (loading) {
    return <div className="loading">Loading companies...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="company-list-container">
      <div className="list-header">
        <h2>Registered Companies</h2>
        <button
          className="add-btn"
          onClick={() => navigate("/companyForm")}
        >
          Add New Company
        </button>
      </div>
      {companies.length === 0 ? (
        <p className="no-companies">No companies registered yet.</p>
      ) : (
        <div className="company-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>GST ID</th>
                <th>Address</th>
                <th>Contact Email</th>
                <th>Phone Number</th>
                <th>Website</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company._id}>
                  <td>{company.name}</td>
                  <td>{company.gstId}</td>
                  <td>{company.address || "N/A"}</td>
                  <td>{company.contactEmail || "N/A"}</td>
                  <td>{company.phoneNumber || "N/A"}</td>
                  <td>
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    <button
                      className="action-btn update-btn"
                      onClick={() => handleUpdate(company._id)}
                    >
                      Update
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(company._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CompanyList;