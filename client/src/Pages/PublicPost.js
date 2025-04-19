import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/PublicPost.css";

function PublicPost() {
  const navigate = useNavigate();
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [viewMode, setViewMode] = useState("Jobs");
  const [currentPage, setCurrentPage] = useState(1);

  const postsPerPage = 8;
  const categories = [
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
    "Teaching",
    "Online Tutoring",
    "Curriculum Design",
    "Research",
    "Academic Writing",
    "Educational Counseling",
    "Library Science",
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
    "Human Resources",
    "Recruitment",
    "Training & Development",
    "Payroll Management",
    "Office Administration",
    "Executive Assistant",
    "Data Entry",
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
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Environmental Engineering",
    "Industrial Engineering",
    "Biomedical Engineering",
    "Structural Engineering",
    "Architecture",
    "Urban Planning",
    "Interior Design",
    "Construction Management",
    "Site Engineering",
    "Surveying",
    "Manufacturing",
    "Production Management",
    "Warehouse Operations",
    "Supply Chain Management",
    "Procurement",
    "Inventory Management",
    "Logistics",
    "Transportation",
    "Quality Control",
    "Government",
    "Public Policy",
    "Civil Services",
    "Defense & Military",
    "Nonprofit",
    "NGO",
    "Social Work",
    "Hospitality",
    "Hotel Management",
    "Travel & Tourism",
    "Event Management",
    "Food & Beverage",
    "Electrician",
    "Plumber",
    "Carpenter",
    "Mechanic",
    "Welding",
    "HVAC Technician",
    "Machinist",
    "CNC Operator",
    "Remote Jobs",
    "Freelance",
    "Internships",
    "Entry-Level",
    "Others",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const postsUrl = `http://localhost:5000/api/posts${
        searchQuery || categoryFilter ? "?" : ""
      }${searchQuery ? `search=${searchQuery}` : ""}${
        searchQuery && categoryFilter ? "&" : ""
      }${categoryFilter && categoryFilter !== "All" ? `category=${categoryFilter}` : ""}`;
      const postsRes = await axios.get(postsUrl, { withCredentials: true });
      setFilteredPosts(postsRes.data || []);

      const companiesUrl = `http://localhost:5000/api/companies${
        searchQuery ? `?search=${searchQuery}` : ""
      }`;
      const companiesRes = await axios.get(companiesUrl, { withCredentials: true });
      setCompanies(companiesRes.data.companies || []);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (viewMode === "Jobs") {
      fetchData();
    } else {
      // Filter companies client-side
      const filtered = companies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.gstId.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setCompanies(filtered);
      setCurrentPage(1);
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategoryFilter(selectedCategory);
    if (viewMode === "Jobs") {
      fetchData();
    }
    setCurrentPage(1);
  };

  const handleViewModeChange = (e) => {
    setViewMode(e.target.value);
    setSearchQuery("");
    setCategoryFilter("");
    setCurrentPage(1);
    if (e.target.value === "Companies") {
      fetchData();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const truncate = (str, max = 45) =>
    str?.length > max ? str.substring(0, max) + "..." : str;

  const totalItems = viewMode === "Jobs" ? filteredPosts.length : companies.length;
  const totalPages = Math.ceil(totalItems / postsPerPage);
  const indexOfLastItem = currentPage * postsPerPage;
  const indexOfFirstItem = indexOfLastItem - postsPerPage;
  const currentItems =
    viewMode === "Jobs"
      ? filteredPosts.slice(indexOfFirstItem, indexOfLastItem)
      : companies.slice(indexOfFirstItem, indexOfLastItem);

  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <p className="public-info">Loading {viewMode.toLowerCase()}...</p>;
  }

  if (error) {
    return <p className="public-info">{error}</p>;
  }

  return (
    <div className="public-container">
      <h2 className="public-header">
        {viewMode === "Jobs" ? "All Job Posts" : "All Companies"}
      </h2>

      <div className="search-filter-bar">
        <div className="view-mode-dropdown">
          <label htmlFor="view-mode">View:</label>
          <select
            id="view-mode"
            value={viewMode}
            onChange={handleViewModeChange}
          >
            <option value="Jobs">Jobs</option>
            <option value="Companies">Companies</option>
          </select>
        </div>
        <div className="search-input">
          <input
            type="text"
            placeholder={
              viewMode === "Jobs"
                ? "Search jobs by title, company, or location..."
                : "Search companies by name or GST ID..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        {viewMode === "Jobs" && (
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
        )}
      </div>

      {currentItems.length > 0 ? (
        <>
          <div className="public-grid">
            {viewMode === "Jobs" ? (
              currentItems.map((post) => (
                <div className="public-card" key={post._id}>
                  <div className="top-section">
                    <span>{post.type || "Job"}</span>
                  </div>
                  <div className="mid-section">
                    <div className="comp-img">
                      <img
                        src={post.company?.logoUrl}
                        alt={`${post.company?.name || "Company"} Logo`}
                        onError={(e) => {
                          e.target.src =
                            "https://www.creativefabrica.com/wp-content/uploads/2022/10/04/Architecture-building-company-icon-Graphics-40076545-1-1-580x386.jpg";
                        }}
                      />
                      <div className="comp-dets">
                        <h3 className="public-title">{post.title}</h3>
                        <p className="comp-name">
                          {post.company?.name || post.company}
                        </p>
                        <div className="location1">
                          <span>📍 {post.location}</span>
                        </div>
                      </div>
                    </div>
                    <p className="public-description">
                      {truncate(post.description)}
                    </p>
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
              ))
            ) : (
              currentItems.map((company) => (
                <div className="public-card company-card" key={company._id}>
                  <div className="top-section">
                    <span>Company</span>
                  </div>
                  <div className="mid-section">
                    <div className="comp-img">
                      <img
                        src={company.logoUrl}
                        alt={`${company.name} Logo`}
                        onError={(e) => {
                          e.target.src =
                            "https://www.creativefabrica.com/wp-content/uploads/2022/10/04/Architecture-building-company-icon-Graphics40076545-1-1-580x386.jpg";
                        }}
                      />
                      <div className="comp-dets">
                        <h3 className="public-title">{company.name}</h3>
                        <p className="comp-gst">GST ID: {company.gstId}</p>
                        <div className="company-rating">
                          <span>
                            Rating: {company.averageRating.toFixed(1)} / 5
                            {company.ratings.length > 0 && (
                              <span> ({company.ratings.length} ratings)</span>
                            )}
                          </span>
                          <div className="star-display">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`star ${
                                  star <= Math.round(company.averageRating)
                                    ? "filled"
                                    : ""
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="public-description">
                      {company.contactEmail ||
                      company.phoneNumber ||
                      company.website
                        ? [
                            company.contactEmail &&
                              `Email: ${company.contactEmail}`,
                            company.phoneNumber &&
                              `Phone: ${company.phoneNumber}`,
                            company.website && `Website: ${company.website}`,
                          ]
                            .filter(Boolean)
                            .join(" | ")
                        : "No contact details provided"}
                    </p>
                  </div>
                  <div className="bottom-section">
                    <span className="company-info">Registered Company</span>
                    <button
                      className="view-btn"
                      onClick={() => navigate(`/companies/${company._id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
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
        <p className="public-info">
          No {viewMode.toLowerCase()} found.
        </p>
      )}
    </div>
  );
}

export default PublicPost;