import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/PostList.css"; // Assuming the same CSS file

function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?._id) {
      axios
        .get(`http://localhost:5000/api/posts?userId=${user._id}`, {
          withCredentials: true,
        })
        .then((res) => {
          setPosts(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch posts:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/user/${id}/post`, {
        withCredentials: true,
      });
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  const truncate = (str, max = 35) =>
    str?.length > max ? str.substring(0, max) + "..." : str;

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return "Not Disclosed";
    const { min, max, currency } = salary;
    if (min && max) return `${min} - ${max} ${currency}`;
    if (min) return `${min} ${currency} (min)`;
    if (max) return `${max} ${currency} (max)`;
    return "Not Disclosed";
  };

  if (!user) {
    return <p className="info-message">Please log in to view your job posts.</p>;
  }

  if (loading) {
    return <p className="info-message">Loading your job posts...</p>;
  }

  return (
    <div className="post-list-container">
      <div className="header">
        <h2>My Job Posts</h2>
        <Link to="/jobPostingForm">
          <button className="post-btn">Post New Job</button>
        </Link>
      </div>

      {posts.length > 0 ? (
        <div className="card-grid">
          {posts.map((post) => (
            <div className="post-card" key={post._id}>
              <h3 className="post-title">{post.title}</h3>
              <p className="post-description">{truncate(post.description)}</p>
              <div className="post-meta">
                <span>🏢 {post.company}</span>
                <span>📍 {post.location}</span>
                <span>💰 {formatSalary(post.salary)}</span>
                <span>🕒 {post.type}</span>
                <span>🏠 {post.remote ? "Remote" : "On-site"}</span>
              </div>
              <div className="post-details">
                <p><strong>Skills:</strong> {post.skills?.length > 0 ? post.skills.join(", ") : "None listed"}</p>
                <p><strong>Experience:</strong> {post.experience || "Not specified"}</p>
                <p><strong>Education:</strong> {post.educationLevel || "Not specified"}</p>
                <p><strong>Languages:</strong> {post.languages || "Not specified"}</p>
                <p><strong>Deadline:</strong> {post.applicationDeadline ? new Date(post.applicationDeadline).toLocaleDateString() : "Open"}</p>
              </div>
              <div className="card-actions">
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/edit-post/${post._id}`)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(post._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="info-message">You haven’t posted any jobs yet.</p>
      )}
    </div>
  );
}

export default PostList;