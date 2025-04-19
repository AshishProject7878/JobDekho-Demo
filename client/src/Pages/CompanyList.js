import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/CompanyList.css";

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="company-list-container">
          <h1>Something went wrong.</h1>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch companies for the authenticated user
  useEffect(() => {
    if (user?._id) {
      const fetchCompanies = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/companies?userId=${user._id}`,
            { withCredentials: true }
          );
          setCompanies(response.data.companies || []);
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || "Failed to fetch companies");
          setLoading(false);
        }
      };
      fetchCompanies();
    } else {
      setLoading(false);
    }
  }, [user]);

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
    navigate(`/CompanyEdit/${id}`);
  };

  if (!user) {
    return <p className="info-message">Please log in to view your companies.</p>;
  }

  if (loading) {
    return <p className="info-message">Loading your companies...</p>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <ErrorBoundary>
      <div className="company-list-container">
        <div className="list-header">
          <h2>My Companies</h2>
          <button
            className="add-btn"
            onClick={() => navigate("/companyForm")}
          >
            Add New Company
          </button>
        </div>
        {companies.length === 0 ? (
          <p className="info-message">You haven’t registered any companies yet.</p>
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
    </ErrorBoundary>
  );
}

export default CompanyList;