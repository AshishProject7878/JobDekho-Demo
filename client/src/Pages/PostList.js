import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/PostList.css";
import CompLogo from "../Assests/CompLogo.png";

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
      await axios.delete(`http://localhost:5000/api/posts/${id}`, {
        withCredentials: true,
      });
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete post:", err.response?.status, err.response?.data);
      alert("Failed to delete post: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-post/${id}`);
  };

  const truncate = (str, max = 100) =>
    str?.length > max ? str.substring(0, max) + "..." : str;

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return "Not Disclosed";
    const { min, max, currency } = salary;
    if (min && max) return `${min} - ${max} ${currency}`;
    if (min) return `${min} ${currency} (min)`;
    if (max) return `${max} ${currency} (max)`;
    return "Not Disclosed";
  };

  const formatDate = (date) => 
    date ? new Date(date).toLocaleDateString() : "Open";

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
        <div className="card-holder">
          {posts.map((post) => (
            <div className="card" key={post._id}>
              <div className="top-section">
                <span>{post.type}</span>
                <div className="action-icons">
                  <i 
                    className="fa-solid fa-edit" 
                    onClick={() => handleEdit(post._id)}
                    title="Edit Post"
                  ></i>
                  <i 
                    className="fa-solid fa-trash" 
                    onClick={() => handleDelete(post._id)}
                    title="Delete Post"
                  ></i>
                </div>
              </div>
              <div className="mid-section">
                <div className="comp-img">
                  <img src={CompLogo} alt={`${post.company} Logo`} />
                  <div className="comp-dets">
                    <h3 className="job-title">{post.title}</h3>
                    <p className="comp-name">{post.company}</p>
                    <div className="location1">
                      <i className="fa-solid fa-location-dot"></i>
                      {post.location} {post.remote ? "(Remote)" : "(On-site)"}
                    </div>
                  </div>
                </div>
                <p className="desc">{truncate(post.description)}</p>
                
                
              </div>
              <div className="bottom-section">
                <span className="salary">{formatSalary(post.salary)}</span>
                <div>
                  <button
                    className="btn view-btn"
                    onClick={() => navigate(`/job/${post._id}`)}
                  >
                    View Job
                  </button>
                </div>
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