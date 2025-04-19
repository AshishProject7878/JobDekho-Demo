import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/CompanyDetail.css";

function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingError, setRatingError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch company details
        const companyResponse = await axios.get(
          `http://localhost:5000/api/companies/${id}`,
          { withCredentials: true }
        );
        setCompany(companyResponse.data.company);

        // Fetch jobs for this company
        const jobsResponse = await axios.get(
          `http://localhost:5000/api/posts?companyId=${id}`,
          { withCredentials: true }
        );
        console.log("Jobs response:", jobsResponse.data);
        const fetchedJobs = Array.isArray(jobsResponse.data) ? jobsResponse.data : [];
        fetchedJobs.forEach((job, index) =>
          console.log(`Job ${index} company:`, job.company)
        );
        const filteredJobs = fetchedJobs.filter(
          (job) => job.company?._id === id || job.company === id
        );
        console.log("Filtered jobs:", filteredJobs);
        setJobs(filteredJobs);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to fetch company or jobs");
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleRatingSubmit = async () => {
    if (userRating < 1 || userRating > 5) {
      setRatingError("Please select a rating between 1 and 5 stars");
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:5000/api/companies/${id}/rate`,
        { rating: userRating },
        { withCredentials: true }
      );
      setCompany({
        ...company,
        averageRating: response.data.company.averageRating,
        ratings: [
          ...company.ratings,
          { user: "currentUser", rating: userRating },
        ],
      });
      setRatingError(null);
      setUserRating(0);
    } catch (err) {
      setRatingError(err.response?.data?.message || "Failed to submit rating");
    }
  };

  const truncate = (str, max = 45) =>
    str?.length > max ? str.substring(0, max) + "..." : str;

  if (loading) return <p className="company-info">Loading...</p>;
  if (error) return <p className="company-error">{error}</p>;
  if (!company) return <p className="company-info">Company not found</p>;

  return (
    <div className="company-detail-container">
      <div className="company-header">
        <img
          src={company.logoUrl}
          alt={`${company.name} Logo`}
          className="company-logo"
          onError={(e) => {
            e.target.src =
              "https://www.creativefabrica.com/wp-content/uploads/2022/10/04/Architecture-building-company-icon-Graphics-40076545-1-1-580x386.jpg";
          }}
        />
        <div className="company-title">
          <h2>{company.name}</h2>
          <p className="company-gst">GST ID: {company.gstId}</p>
        </div>
      </div>
      <div className="company-details">
        <p>
          <strong>Address:</strong> {company.address || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {company.contactEmail || "N/A"}
        </p>
        <p>
          <strong>Phone:</strong> {company.phoneNumber || "N/A"}
        </p>
        <p>
          <strong>Website:</strong>{" "}
          {company.website ? (
            <a href={company.website} target="_blank" rel="noopener noreferrer">
              {company.website}
            </a>
          ) : (
            "N/A"
          )}
        </p>
      </div>
      <div className="company-rating">
        <h3>Company Rating</h3>
        <div className="rating-display">
          <span>
            Average Rating: {company.averageRating.toFixed(1)} / 5
            {company.ratings.length > 0 && (
              <span> ({company.ratings.length} ratings)</span>
            )}
          </span>
          <div className="star-display">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${
                  star <= Math.round(company.averageRating) ? "filled" : ""
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <div className="rating-input">
          <p>Rate this company:</p>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${
                  star <= (hoverRating || userRating) ? "filled" : ""
                }`}
                onClick={() => setUserRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </span>
            ))}
          </div>
          <button onClick={handleRatingSubmit} className="submit-rating-btn">
            Submit Rating
          </button>
          {ratingError && <p className="rating-error">{ratingError}</p>}
        </div>
      </div>
      <div className="company-jobs">
        <h3>Job Openings</h3>
        {jobs.length > 0 ? (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div className="job-card" key={job._id}>
                <div className="job-top">
                  <span>{job.type || "Job"}</span>
                </div>
                <div className="job-mid">
                  <h4>{job.title}</h4>
                  <p className="job-location">📍 {job.location}</p>
                  <p className="job-description">{truncate(job.description)}</p>
                  <div className="job-skills">
                    {job.skills &&
                    Array.isArray(job.skills) &&
                    job.skills.length > 0 ? (
                      job.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="skill-tag">No skills listed</span>
                    )}
                  </div>
                </div>
                <div className="job-bottom">
                  <span className="job-salary">
                    {job.salary && job.salary.min && job.salary.max
                      ? `${job.salary.currency || ""} ${job.salary.min} - ${
                          job.salary.max
                        }`
                      : "Not Disclosed"}
                  </span>
                  <button
                    className="job-view-btn"
                    onClick={() => navigate(`/job/${job._id}`)}
                  >
                    View Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="company-info">No job openings currently available.</p>
        )}
      </div>
    </div>
  );
}

export default CompanyDetail;