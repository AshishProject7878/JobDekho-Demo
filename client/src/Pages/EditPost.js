import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/JobPostingForm.css"; // Reuse styling

function EditPost() {
  const { id } = useParams(); // Get postId from URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "", // Changed from companyName to company
    location: "",
    experience: "",
    salaryMin: "",
    salaryMax: "",
    educationLevel: "",
    languages: "",
    email: "",
    description: "",
    responsibilities: "",
    roleExperience: "",
    skills: [],
    type: "",
    applicationDeadline: "",
    remote: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [companies, setCompanies] = useState([]); // Store fetched companies

  const jobTypes = ["Full-time", "Part-time", "Internship", "Contract"];

  // Fetch companies and post data on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/companies", {
          withCredentials: true,
        });
        // Handle response based on API structure
        const companiesData = response.data.companies || response.data;
        setCompanies(Array.isArray(companiesData) ? companiesData : []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError("Failed to load companies. Please try again.");
      }
    };

    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${id}`, {
          withCredentials: true,
        });
        const post = res.data;
        setFormData({
          jobTitle: post.title || "",
          company: post.company || "", // Expecting company _id
          location: post.location || "",
          experience: post.experience || "",
          salaryMin: post.salary?.min || "",
          salaryMax: post.salary?.max || "",
          educationLevel: post.educationLevel || "",
          languages: post.languages || "",
          email: post+ post.contactEmail || "",
          description: post.description || "",
          responsibilities: post.responsibilities || "",
          roleExperience: post.roleExperience || "",
          skills: post.skills || [],
          type: post.type || "",
          applicationDeadline: post.applicationDeadline
            ? post.applicationDeadline.split("T")[0]
            : "",
          remote: post.remote || false,
        });
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError("Failed to load post data.");
        setLoading(false);
      }
    };

    Promise.all([fetchCompanies(), fetchPost()]).catch((err) => {
      setError("Failed to load data.");
      setLoading(false);
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSkillAdd = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, e.target.value.trim()],
      }));
      e.target.value = "";
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.type) {
      setError("Please select a job type.");
      return;
    }

    if (!formData.company) {
      setError("Please select a company.");
      return;
    }

    const postData = {
      title: formData.jobTitle,
      description: formData.description,
      company: formData.company, // Send company _id
      location: formData.location,
      salary: {
        min: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        max: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        currency: "LPA",
      },
      experience: formData.experience,
      educationLevel: formData.educationLevel,
      languages: formData.languages,
      responsibilities: formData.responsibilities,
      roleExperience: formData.roleExperience,
      skills: formData.skills,
      type: formData.type,
      applicationDeadline: formData.applicationDeadline || undefined,
      remote: formData.remote,
      contactEmail: formData.email,
    };

    try {
      await axios.put(
        `http://localhost:5000/api/posts/${id}`,
        postData,
        { withCredentials: true }
      );
      setSuccess("Job updated successfully!");
      setTimeout(() => navigate("/postList"), 1500); // Redirect after 1.5s
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update post.");
    }
  };

  if (loading) return <p>Loading post...</p>;
  if (error && !formData.jobTitle) return <p>{error}</p>;

  return (
    <div className="job-posting-container">
      <h2>Edit Job Posting</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <form onSubmit={handleSubmit} className="job-posting-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label>Job Title</label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Company</label>
            <select
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
            >
              <option value="">Select a Company</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>
            {companies.length === 0 && (
              <p className="form-error">No companies available. Please add a company first.</p>
            )}
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Contact Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Job Type</label>
            <select name="type" value={formData.type} onChange={handleChange} required>
              <option value="">Select Job Type</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Remote</label>
            <input
              type="checkbox"
              name="remote"
              checked={formData.remote}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Experience</label>
            <input
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
            />
          </div>
          <div className="form-group salary-group">
            <label>Salary Range (LPA)</label>
            <div className="salary-inputs">
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleChange}
                placeholder="Min"
              />
              <span>-</span>
              <input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleChange}
                placeholder="Max"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Education Level</label>
            <select
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
            >
              <option value="">Select Education Level</option>
              <option value="High School">High School</option>
              <option value="Graduate">Graduate</option>
              <option value="Post Graduate">Post Graduate</option>
            </select>
          </div>
          <div className="form-group">
            <label>Languages</label>
            <input
              type="text"
              name="languages"
              value={formData.languages}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Application Deadline</label>
            <input
              type="date"
              name="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Skills</label>
            <input
              type="text"
              onKeyDown={handleSkillAdd}
              placeholder="Type a skill and press Enter"
            />
            <div className="skills-list">
              {formData.skills.map((skill) => (
                <div key={skill} className="skill-tag">
                  {skill}
                  <span
                    className="remove-skill"
                    onClick={() => handleSkillRemove(skill)}
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>
          <div className="form-group">
            <label>Responsibilities</label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              rows="4"
            />
          </div>
          <div className="form-group">
            <label>Role & Experience</label>
            <textarea
              name="roleExperience"
              value={formData.roleExperience}
              onChange={handleChange}
              rows="4"
            />
          </div>
        </div>
        <button type="submit" className="nav-btn submit-btn">
          Update Job
        </button>
        <button
          type="button"
          className="nav-btn"
          onClick={() => navigate("/postList")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default EditPost;