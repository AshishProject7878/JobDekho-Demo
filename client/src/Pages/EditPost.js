import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/PostForm.css";

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    salary: "",
    requirements: "",
    type: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const jobTypes = ["Full-time", "Part-time", "Internship", "Contract"];

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${id}`, {
          withCredentials: true,
        });
        const post = res.data;

        setFormData({
          title: post.title || "",
          description: post.description || "",
          company: post.company || "",
          location: post.location || "",
          salary: post.salary || "",
          requirements: post.requirements?.join(", ") || "",
          type: post.type || "",
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching post:", error);
        setError("Unauthorized or post not found.");
        navigate("/post"); // Or redirect to 404
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const updatedData = {
      ...formData,
      requirements: formData.requirements
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean),
    };

    try {
      const res = await axios.put(
        `http://localhost:5000/api/posts/${id}`,
        updatedData,
        {
          withCredentials: true,
        }
      );
      alert("Post updated successfully!");
      navigate("/postList");
    } catch (error) {
      console.error("Update error:", error);
      const msg =
        error.response?.data?.message || "Something went wrong while updating.";
      alert(msg);
    }
  };

  if (loading) return <p>Loading post...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="post-form-container">
      <h2>Edit Job Post</h2>
      <form className="post-form" onSubmit={handleUpdate}>
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
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="">Select Job Type</option>
          {jobTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <button type="submit" className="btn">
          Update Post
        </button>
      </form>
    </div>
  );
}

export default EditPost;
