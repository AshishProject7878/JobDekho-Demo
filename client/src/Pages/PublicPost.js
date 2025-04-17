import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/PublicPost.css";
import { useNavigate } from "react-router-dom";
import CompLogo from "../Assests/CompLogo.png"; 

function PublicPost() {
  const navigate = useNavigate();
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const postsPerPage = 8;
  const categories = [
    // --- Tech & IT ---
    "All",
    "Software Development",
    "Web Development",
    "Mobile App Development",
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "Data Science",
    "Machine Learning",
    "Artificial Intelligence",
    "Cybersecurity",
    "Cloud Computing",
    "DevOps",
    "Blockchain",
    "IT Support",
    "Database Administration",
    "Network Engineering",
    "Game Development",
    "Quality Assurance",
    "UI/UX Design",
    "Product Management",
    "Project Management",
    
    // --- Business, Sales & Marketing ---
    "Digital Marketing",
    "Social Media Management",
    "Content Marketing",
    "SEO/SEM",
    "Marketing Strategy",
    "Business Development",
    "Sales",
    "Retail",
    "Customer Support",
    "Technical Sales",
    "Telemarketing",
    "E-commerce",
    "Brand Management",
    "Market Research",
    
    // --- Creative & Media ---
    "Graphic Design",
    "Visual Design",
    "Animation",
    "Illustration",
    "Video Editing",
    "Photography",
    "Content Writing",
    "Copywriting",
    "Blogging",
    "Scriptwriting",
    "Journalism",
    "Media & Broadcasting",
    "Public Relations",
    "Film Production",
    
    // --- Education & Research ---
    "Teaching",
    "Online Tutoring",
    "Curriculum Design",
    "Research",
    "Academic Writing",
    "Educational Counseling",
    "Library Science",
    
    // --- Finance & Legal ---
    "Accounting",
    "Auditing",
    "Bookkeeping",
    "Taxation",
    "Finance",
    "Banking",
    "Insurance",
    "Investment Management",
    "Legal Advisory",
    "Law Practice",
    "Paralegal",
    "Compliance",
    
    // --- HR & Admin ---
    "Human Resources",
    "Recruitment",
    "Training & Development",
    "Payroll Management",
    "Office Administration",
    "Executive Assistant",
    "Data Entry",
    
    // --- Healthcare & Wellness ---
    "Healthcare",
    "Medical",
    "Nursing",
    "Physiotherapy",
    "Pharmacy",
    "Dentistry",
    "Mental Health",
    "Nutritionist",
    "Lab Technician",
    "Veterinary",
    
    // --- Engineering ---
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Environmental Engineering",
    "Industrial Engineering",
    "Biomedical Engineering",
    "Structural Engineering",
    
    // --- Architecture & Construction ---
    "Architecture",
    "Urban Planning",
    "Interior Design",
    "Construction Management",
    "Site Engineering",
    "Surveying",
    
    // --- Manufacturing, Logistics & Operations ---
    "Manufacturing",
    "Production Management",
    "Warehouse Operations",
    "Supply Chain Management",
    "Procurement",
    "Inventory Management",
    "Logistics",
    "Transportation",
    "Quality Control",
    
    // --- Government & Nonprofit ---
    "Government",
    "Public Policy",
    "Civil Services",
    "Defense & Military",
    "Nonprofit",
    "NGO",
    "Social Work",
    
    // --- Hospitality, Tourism & Events ---
    "Hospitality",
    "Hotel Management",
    "Travel & Tourism",
    "Event Management",
    "Food & Beverage",
    
    // --- Skilled Trades & Technical Jobs ---
    "Electrician",
    "Plumber",
    "Carpenter",
    "Mechanic",
    "Welding",
    "HVAC Technician",
    "Machinist",
    "CNC Operator",
    
    // --- Other / Emerging ---
    "Remote Jobs",
    "Freelance",
    "Internships",
    "Entry-Level",
    "Others"
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (query = "", category = "") => {
    try {
      const url = `http://localhost:5000/api/posts${query || category ? "?" : ""}${
        query ? `search=${query}` : ""
      }${query && category ? "&" : ""}${category && category !== "All" ? `category=${category}` : ""}`;
      const res = await axios.get(url, { withCredentials: true });
      setFilteredPosts(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching public posts:", err);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPosts(searchQuery, categoryFilter);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategoryFilter(selectedCategory);
    fetchPosts(searchQuery, selectedCategory);
    setCurrentPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const truncate = (str, max = 45) =>
    str?.length > max ? str.substring(0, max) + "..." : str;

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <p className="public-info">Loading public job posts...</p>;
  }

  return (
    <div className="public-container">
      <h2 className="public-header">All Job Posts</h2>

      <div className="search-filter-bar">
        <div className="search-input">
          <input
            type="text"
            placeholder="Search jobs by title, company, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <div className="filter-dropdown">
          <label htmlFor="category-filter">Filter by Category:</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={handleCategoryChange}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentPosts.length > 0 ? (
        <>
          <div className="public-grid">
            {currentPosts.map((post) => (
              <div className="public-card" key={post._id}>
                <div className="top-section">
                  <span>{post.type || "Job"}</span>
                </div>
                <div className="mid-section">
                  <div className="comp-img">
                    <img src={CompLogo} alt={`${post.company} Logo`} />
                    <div className="comp-dets">
                      <h3 className="public-title">{post.title}</h3>
                      <p className="comp-name">{post.company}</p>
                      <div className="location1">
                        <span>📍 {post.location}</span>
                      </div>
                    </div>
                  </div>
                  <p className="public-description">{truncate(post.description)}</p>
                  <div className="skills">
                    {post.skills && post.skills.length > 0 ? (
                      post.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="skill-tag">No skills listed</span>
                    )}
                  </div>
                </div>
                <div className="bottom-section">
                  <span className="salary">
                    {post.salary && post.salary.min && post.salary.max
                      ? `${post.salary.currency} ${post.salary.min} - ${post.salary.max}`
                      : "Not Disclosed"}
                  </span>
                  <button
                    className="view-btn"
                    onClick={() => navigate(`/job/${post._id}`)}
                  >
                    View Job
                  </button>
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