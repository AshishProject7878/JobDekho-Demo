import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/UserDashboard.css";

function UserDashboard() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Fetch user's posts
      const postsResponse = await axios.get("http://localhost:5000/api/posts", {
        params: { userId: "current" }, // Assumes backend recognizes 'current' for authenticated user
        withCredentials: true,
      });
      setPosts(postsResponse.data);

      // Fetch user's profile
      const profileResponse = await axios.get("http://localhost:5000/api/profile", {
        withCredentials: true,
      });
      setProfile(profileResponse.data);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        withCredentials: true,
      });
      setPosts(posts.filter((post) => post._id !== postId));
      alert("Post deleted successfully!");
    } catch (err) {
      console.error("Error deleting post:", err);
      alert(err.response?.data?.message || "Failed to delete post");
    }
  };

  const truncate = (str, max = 45) =>
    str?.length > max ? str.substring(0, max) + "..." : str;

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">User Dashboard</h1>

      {/* Profile Summary */}
      <div className="profile-section">
        <h2>Profile</h2>
        {profile ? (
          <div className="profile-card">
            <p><strong>Name:</strong> {profile.name || "Not set"}</p>
            <p><strong>Email:</strong> {profile.email || "Not set"}</p>
            <p><strong>Company:</strong> {profile.company?.name || "Not associated"}</p>
            <p><strong>Bio:</strong> {profile.bio || "No bio provided"}</p>
            <button
              className="edit-profile-btn"
              onClick={() => navigate("/profile/edit")}
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <p>No profile found. <button onClick={() => navigate("/profile/create")}>Create Profile</button></p>
        )}
      </div>

      {/* Job Posts Section */}
      <div className="posts-section">
        <div className="posts-header">
          <h2>Your Job Posts</h2>
          <button
            className="create-post-btn"
            onClick={() => navigate("/job/create")}
          >
            Create New Job Post
          </button>
        </div>

        {posts.length > 0 ? (
          <div className="posts-grid">
            {posts.map((post) => (
              <div className="post-card" key={post._id}>
                <div className="post-card-header">
                  <h3>{post.title}</h3>
                  <span className="post-type">{post.type || "Job"}</span>
                </div>
                <p><strong>Company:</strong> {post.company?.name || "Unknown"}</p>
                <p><strong>Location:</strong> {post.location}</p>
                <p><strong>Description:</strong> {truncate(post.description)}</p>
                <p>
                  <strong>Salary:</strong>{" "}
                  {post.salary && post.salary.min && post.salary.max
                    ? `${post.salary.currency} ${post.salary.min} - ${post.salary.max}`
                    : "Not Disclosed"}
                </p>
                <p><strong>Category:</strong> {post.category}</p>
                <div className="post-actions">
                  <button
                    className="edit-post-btn"
                    onClick={() => navigate(`/job/edit/${post._id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-post-btn"
                    onClick={() => handleDeletePost(post._id)}
                  >
                    Delete
                  </button>
                  <button
                    className="view-post-btn"
                    onClick={() => navigate(`/job/${post._id}`)}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-posts">You haven't created any job posts yet.</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;