import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/PublicPost.css";

function PublicPost() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const postsPerPage = 9;

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
      setCurrentPage(1); // Reset to page 1 on new search
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const truncate = (str, max = 35) =>
    str?.length > max ? str.substring(0, max) + "..." : str;

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // be fancy
  };

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

      {currentPosts.length > 0 ? (
        <>
          <div className="public-grid">
            {currentPosts.map((post) => (
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

          <div className="pagination">
            {[...Array(totalPages).keys()].map((num) => (
              <button
                key={num + 1}
                className={`page-btn ${currentPage === num + 1 ? "active" : ""}`}
                onClick={() => changePage(num + 1)}
              >
                {num + 1}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="public-info">No matching job posts found.</p>
      )}
    </div>
  );
}

export default PublicPost;
