import React, { useState } from "react";
import axios from "axios";
import "../styles/PostForm.css";
import { Link } from "react-router-dom";
 
function PostForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    salary: "",
    requirements: "",
    type: "",
  });

  const jobTypes = ["Full-time", "Part-time", "Internship", "Contract"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.type) {
      alert("Please select a job type.");
      return;
    }

    const dataToSend = {
      ...formData,
      requirements: formData.requirements
        .split(",")
        .map((req) => req.trim())
        .filter((req) => req !== ""),
    };

    try {
      const res = await axios.post("http://localhost:5000/api/posts", dataToSend, {
        withCredentials: true, // important for cookie-based auth
      });
      alert("Post created successfully!");

      // Reset form
      setFormData({
        title: "",
        description: "",
        company: "",
        location: "",
        salary: "",
        requirements: "",
        type: "",
      });
    } catch (error) {
      console.error("Post creation error:", error);
      alert(error.response?.data?.message || "Post creation failed.");
    }
  };

  return (
    <div className="post-form-container">
      <h2>Create a Job Post</h2>
      <form className="post-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Job Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="company"
          placeholder="Company Name"
          value={formData.company}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Job Location"
          value={formData.location}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="salary"
          placeholder="Salary (optional)"
          value={formData.salary}
          onChange={handleChange}
        />
        <input
          type="text"
          name="requirements"
          placeholder="Requirements (comma-separated)"
          value={formData.requirements}
          onChange={handleChange}
        />
        <select name="type" value={formData.type} onChange={handleChange} required>
          <option value="">Select Job Type</option>
          {jobTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <button type="submit" className="btn">Post Job</button>
        <Link to="/profile">
        <button className="btn">Profile</button>
        </Link>
      </form>
    </div>
  );
}

export default PostForm;