import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/PublicPost.css";

function PublicPost() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/posts", { withCredentials: true })
      .then((res) => {
        setPosts(res.data);
        setFilteredPosts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching public posts:", err);
        setLoading(false);
      });
  }, []);

  const handleSearch = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/posts?search=${searchQuery}`, {
        withCredentials: true,
      });
      setFilteredPosts(res.data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const truncate = (str, max = 35) =>
    str?.length > max ? str.substring(0, max) + "..." : str;

  if (loading) {
    return <p className="public-info">Loading public job posts...</p>;
  }

  return (
    <div className="public-container">
      <h2 className="public-header">All Job Posts</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {filteredPosts.length > 0 ? (
        <div className="public-grid">
          {filteredPosts.map((post) => (
            <div className="public-card" key={post._id}>
              <h3 className="public-title">{post.title}</h3>
              <p className="public-description">{truncate(post.description)}</p>
              <div className="public-meta">
                <span>🏢 {post.company}</span>
                <span>📍 {post.location}</span>
                <span>💰 {post.salary || "Not Disclosed"}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="public-info">No matching job posts found.</p>
      )}
    </div>
  );
} 

export default PublicPost;
