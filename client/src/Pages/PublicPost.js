import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/PublicPost.css";
import Img1 from "../Assests/Enthusiastic-bro.svg";
import Img2 from "../Assests/Learning-rafiki.svg";
import Comp from "../Assests/CompLogo.png";

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
  const [showFilterModal, setShowFilterModal] = useState(false);
  const modalRef = useRef(null);

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

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowFilterModal(false);
      }
    };

    if (showFilterModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterModal]);

  useEffect(() => {
    fetchData();
  }, [searchQuery, categoryFilter, viewMode]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (viewMode === "Jobs") {
        const postsUrl = `http://localhost:5000/api/posts${
          searchQuery || categoryFilter ? "?" : ""
        }${searchQuery ? `search=${searchQuery}` : ""}${
          searchQuery && categoryFilter ? "&" : ""
        }${categoryFilter && categoryFilter !== "All" ? `category=${categoryFilter}` : ""}`;
        const postsRes = await axios.get(postsUrl, { withCredentials: true });
        setFilteredPosts(postsRes.data || []);
      } else {
        const companiesUrl = `http://localhost:5000/api/companies${
          searchQuery ? `?search=${searchQuery}` : ""
        }`;
        const companiesRes = await axios.get(companiesUrl, { withCredentials: true });
        setCompanies(companiesRes.data.companies || []);
      }
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
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleViewModeChange = (e) => {
    const newViewMode = e.target.value;
    setViewMode(newViewMode);
    setSearchQuery("");
    setCategoryFilter("");
    setCurrentPage(1);
    if (newViewMode === "Companies") {
      fetchData();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const toggleFilterModal = () => {
    setShowFilterModal(!showFilterModal);
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
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div>
      <div className="main">
        <div className="hero-holder">
          <div className="img-container">
            <img src={Img2} alt="Learning Illustration" />
          </div>
          <div className="search-container">
            <h1>{viewMode === "Jobs" ? "Available Jobs" : "Explore Companies"}</h1>
            <p>
              {viewMode === "Jobs"
                ? "Discover thousands of job opportunities with top companies worldwide."
                : "Find the best companies to work with, tailored to your career goals."}
            </p>
            <div className="Search-form-container">
              {viewMode === "Jobs" && (
                <select
                  className="Industry"
                  value={categoryFilter}
                  onChange={handleCategoryChange}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="text"
                placeholder={
                  viewMode === "Jobs"
                    ? "Search jobs by title, company, or location..."
                    : "Search companies by name or GST ID..."
                }
                className="Keywords"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className="search-btn" onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>
          <div className="img-container">
            <img src={Img1} alt="Enthusiastic Illustration" />
          </div>
        </div>

        {loading ? (
          <div className="public-loader-container">
            <div className="public-loader"></div>
          </div>
        ) : error ? (
          <p className="public-info">{error}</p>
        ) : currentItems.length > 0 ? (
          <>
            <div className="card-holder">
              {viewMode === "Jobs" ? (
                currentItems.map((post) => (
                  <div className="public-card" key={post._id}>
                    <div className="top-section">
                      <span>{post.type || "Job"}</span>
                      <i className="fa-solid fa-bookmark"></i>
                    </div>
                    <div className="mid-section">
                      <div className="comp-img">
                        <img
                          src={post.company?.logoUrl || Comp}
                          alt={`${post.company?.name || "Company"} Logo`}
                          onError={(e) => {
                            e.target.src = Comp;
                          }}
                        />
                        <div className="comp-dets">
                          <h3 className="public-title">{post.title}</h3>
                          <p className="comp-name">
                            {post.company?.name || post.company}
                          </p>
                          <div className="location1">
                            <i className="fa-solid fa-location-dot"></i>{" "}
                            {post.location}
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
                  <div className="public-card" key={company._id}>
                    <div className="top-section">
                      <span>Company</span>
                      <i className="fa-solid fa-bookmark"></i>
                    </div>
                    <div className="mid-section">
                      <div className="comp-img">
                        <img
                          src={company.logoUrl || Comp}
                          alt={`${company.name} Logo`}
                          onError={(e) => {
                            e.target.src = Comp;
                          }}
                        />
                        <div className="comp-dets">
                          <h3 className="public-title">{company.name}</h3>
                          <p className="comp-name">GST ID: {company.gstId}</p>
                          <div className="location1">
                            <i className="fa-solid fa-star"></i>{" "}
                            Rating: {company.averageRating.toFixed(1)} / 5
                            {company.ratings.length > 0 && (
                              <span> ({company.ratings.length} ratings)</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="public-description">
                        {truncate(
                          company.contactEmail ||
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
                            : "No contact details provided"
                        )}
                      </p>
                      <div className="skills">
                        <span className="skill-tag">Registered Company</span>
                      </div>
                    </div>
                    <div className="bottom-section">
                      <span className="salary">Contact Details</span>
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

            <div className="pagination-holder">
              <button
                className="prev-btn"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <p className="page-number">
                {[...Array(totalPages).keys()].map((num) => (
                  <span
                    key={num + 1}
                    className={`no ${currentPage === num + 1 ? "active" : ""}`}
                    onClick={() => changePage(num + 1)}
                  >
                    {num + 1}
                  </span>
                ))}
              </p>
              <button
                className="next-btn"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="public-info">
            No {viewMode.toLowerCase()} found.
          </p>
        )}

        <button className="filter-btn" onClick={toggleFilterModal}>
          <i className="fa-solid fa-filter"></i>
        </button>

        {showFilterModal && (
          <div className="filter-modal" ref={modalRef}>
            <p className="close-btn" onClick={toggleFilterModal}>
              ×
            </p>
            <h3>Filters</h3>
            <select value={viewMode} onChange={handleViewModeChange}>
              <option value="Jobs">Jobs</option>
              <option value="Companies">Companies</option>
            </select>
            {viewMode === "Jobs" && (
              <select value={categoryFilter} onChange={handleCategoryChange}>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
            <button onClick={toggleFilterModal}>Apply Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicPost;