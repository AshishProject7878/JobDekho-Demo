import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/JobPostingForm.css";

function JobPostingForm() {
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "", // Changed from companyName to company
    location: "",
    experience: "",
    salaryMin: "",
    salaryMax: "",
    educationLevel: "",
    languages: "",
    email: "",
    description: "",
    responsibilities: "",
    roleExperience: "",
    skills: [],
    category: "",
    type: "",
    applicationDeadline: "",
    remote: false,
  });

  const [newSkill, setNewSkill] = useState("");
  const [activeSection, setActiveSection] = useState("Basic Information");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [companies, setCompanies] = useState([]); // Store fetched companies

  const [suggestedSkills] = useState([
    "JavaScript", "Python", "React", "Node.js", "Java", "SQL", "NoSQL", "HTML", "CSS", "TypeScript",
    "AWS", "Azure", "Docker", "Kubernetes", "Git", "Machine Learning", "TensorFlow", "Cybersecurity",
    "CI/CD", "Figma",
    "SEO", "Google Ads", "Meta Ads", "CRM", "Salesforce", "HubSpot", "A/B Testing", "Lead Generation",
    "Email Marketing", "Copywriting", "Market Research", "Cold Calling", "E-commerce Tools",
    "Adobe Photoshop", "Illustrator", "Premiere Pro", "After Effects", "Video Editing", "Photography",
    "Storyboarding", "Figma", "Content Writing", "Scriptwriting", "Canva",
    "Lesson Planning", "Google Classroom", "Zoom", "Moodle", "Academic Writing", "Curriculum Design",
    "Critical Thinking", "Research Methods",
    "Excel", "QuickBooks", "Tally", "Taxation", "Auditing", "Legal Research", "Contract Drafting",
    "Financial Modelling", "Compliance", "Risk Analysis",
    "Recruitment", "Payroll", "HRIS", "Conflict Resolution", "MS Excel", "Employee Engagement",
    "Office Management", "Data Entry",
    "Patient Care", "Medical Records", "EMR", "Diagnosis Coding", "Mental Health Support",
    "Nutrition Planning", "Pharmacology", "CPR Certification",
    "AutoCAD", "MATLAB", "SolidWorks", "PLC Programming", "Circuit Design", "Thermodynamics",
    "Structural Analysis", "Project Management",
    "Revit", "Urban Planning", "SketchUp", "Blueprint Reading", "3D Modeling", "Cost Estimation",
    "GIS", "Construction Scheduling",
    "Lean Manufacturing", "Six Sigma", "Inventory Management", "Procurement", "Logistics",
    "Supply Chain", "ERP", "Warehouse Operations", "Quality Control",
    "Public Policy", "Stakeholder Management", "Grant Writing", "Community Outreach",
    "Research Writing", "NGO Tools",
    "Event Planning", "Guest Services", "Food Safety", "Hospitality Management",
    "Reservations Systems", "Multilingual Communication", "Vendor Management",
    "Blueprint Reading", "Electrical Wiring", "Plumbing", "CNC Operation", "Machining",
    "Welding", "HVAC", "Preventive Maintenance",
    "Remote Collaboration", "Time Management", "Notion", "Slack", "Freelancing", "Portfolio Design",
    "Client Communication", "Entry-Level Tools"
  ]);

  const categories = [
    "Software Development", "Web Development", "Mobile App Development", "Frontend Development",
    "Backend Development", "Full Stack Development", "Data Science", "Machine Learning",
    "Artificial Intelligence", "Cybersecurity", "Cloud Computing", "DevOps", "Blockchain",
    "IT Support", "Database Administration", "Network Engineering", "Game Development",
    "Quality Assurance", "UI/UX Design", "Product Management", "Project Management",
    "Digital Marketing", "Social Media Management", "Content Marketing", "SEO/SEM",
    "Marketing Strategy", "Business Development", "Sales", "Retail", "Customer Support",
    "Technical Sales", "Telemarketing", "E-commerce", "Brand Management", "Market Research",
    "Graphic Design", "Visual Design", "Animation", "Illustration", "Video Editing",
    "Photography", "Content Writing", "Copywriting", "Blogging", "Scriptwriting",
    "Journalism", "Media & Broadcasting", "Public Relations", "Film Production",
    "Teaching", "Online Tutoring", "Curriculum Design", "Research", "Academic Writing",
    "Educational Counseling", "Library Science",
    "Accounting", "Auditing", "Bookkeeping", "Taxation", "Finance", "Banking",
    "Insurance", "Investment Management", "Legal Advisory", "Law Practice", "Paralegal",
    "Compliance",
    "Human Resources", "Recruitment", "Training & Development", "Payroll Management",
    "Office Administration", "Executive Assistant", "Data Entry",
    "Healthcare", "Medical", "Nursing", "Physiotherapy", "Pharmacy", "Dentistry",
    "Mental Health", "Nutritionist", "Lab Technician", "Veterinary",
    "Mechanical Engineering", "Electrical Engineering", "Civil Engineering",
    "Chemical Engineering", "Environmental Engineering", "Industrial Engineering",
    "Biomedical Engineering", "Structural Engineering",
    "Architecture", "Urban Planning", "Interior Design", "Construction Management",
    "Site Engineering", "Surveying",
    "Manufacturing", "Production Management", "Warehouse Operations", "Supply Chain Management",
    "Procurement", "Inventory Management", "Logistics", "Transportation", "Quality Control",
    "Government", "Public Policy", "Civil Services", "Defense & Military", "Nonprofit",
    "NGO", "Social Work",
    "Hospitality", "Hotel Management", "Travel & Tourism", "Event Management",
    "Food & Beverage",
    "Electrician", "Plumber", "Carpenter", "Mechanic", "Welding", "HVAC Technician",
    "Machinist", "CNC Operator",
    "Remote Jobs", "Freelance", "Internships", "Entry-Level", "Others"
  ];

  const descriptionRef = useRef(null);
  const responsibilitiesRef = useRef(null);
  const roleExperienceRef = useRef(null);

  const sections = [
    "Basic Information",
    "Job Requirements",
    "Skills",
    "Job Details",
    "Review",
  ];

  const jobTypes = ["Full-time", "Part-time", "Internship", "Contract"];

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/companies", {
          withCredentials: true,
        });
        // Handle response based on your API structure
        const companiesData = response.data.companies || response.data;
        setCompanies(Array.isArray(companiesData) ? companiesData : []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError("Failed to load companies. Please try again.");
      }
    };
    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSkillAdd = (skill) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill.trim()],
      }));
      setNewSkill("");
      setShowSuggestions(false);
    }
  };

  const handleSkillInput = (e) => {
    setNewSkill(e.target.value);
    setShowSuggestions(true);
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.type) {
      alert("Please select a job type.");
      return;
    }

    if (!formData.category) {
      alert("Please select a category.");
      return;
    }

    if (!formData.company) {
      alert("Please select a company.");
      return;
    }

    const postData = {
      title: formData.jobTitle,
      description: formData.description,
      company: formData.company, // Send company _id
      location: formData.location,
      salary: {
        min: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        max: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        currency: "LPA",
      },
      experience: formData.experience,
      educationLevel: formData.educationLevel,
      languages: formData.languages,
      responsibilities: formData.responsibilities,
      roleExperience: formData.roleExperience,
      skills: formData.skills,
      category: formData.category,
      type: formData.type,
      applicationDeadline: formData.applicationDeadline || undefined,
      remote: formData.remote,
      contactEmail: formData.email,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/posts/",
        postData,
        {
          withCredentials: true,
        }
      );

      alert("Job posted successfully!");
      console.log("Job Posting Response:", response.data);

      setFormData({
        jobTitle: "",
        company: "", // Reset to empty string
        location: "",
        experience: "",
        salaryMin: "",
        salaryMax: "",
        educationLevel: "",
        languages: "",
        email: "",
        description: "",
        responsibilities: "",
        roleExperience: "",
        skills: [],
        category: "",
        type: "",
        applicationDeadline: "",
        remote: false,
      });

      setActiveSection("Basic Information");
      setError(null);
      setSuccess("Job posted successfully!");
    } catch (error) {
      console.error("Post creation error:", error);
      setError(error.response?.data?.message || "Post creation failed.");
      setSuccess(null);
    }
  };

  const applyFormatting = (field, type) => {
    const ref = {
      description: descriptionRef,
      responsibilities: responsibilitiesRef,
      roleExperience: roleExperienceRef,
    }[field];

    const textarea = ref.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData[field].substring(start, end);

    let formattedText = "";
    switch (type) {
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        break;
      case "underline":
        formattedText = `<u>${selectedText}</u>`;
        break;
      case "bullet":
        formattedText = `\n- ${selectedText || ""}`;
        break;
      default:
        return;
    }

    const newText =
      formData[field].substring(0, start) +
      formattedText +
      formData[field].substring(end);

    setFormData((prev) => ({
      ...prev,
      [field]: newText,
    }));
  };

  const renderFormattedText = (text) => {
    if (!text) return "Not provided";

    const lines = text.split("\n");
    const elements = [];
    let listItems = [];
    let inList = false;

    lines.forEach((line, index) => {
      if (line.trim().startsWith("- ")) {
        if (!inList) {
          inList = true;
          if (elements.length > 0) {
            elements.push(<br key={`br-${index}`} />);
          }
        }
        listItems.push(parseInlineFormatting(line.substring(2)));
      } else {
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`ul-${index}`} className="formatted-list">
              {listItems.map((item, i) => (
                <li key={`li-${i}`}>{item}</li>
              ))}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        if (line.trim()) {
          elements.push(
            <span key={`span-${index}`}>
              {parseInlineFormatting(line)}
              {index < lines.length - 1 && <br />}
            </span>
          );
        }
      }
    });

    if (inList && listItems.length > 0) {
      elements.push(
        <ul key="ul-final" className="formatted-list">
          {listItems.map((item, i) => (
            <li key={`li-final-${i}`}>{item}</li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  const parseInlineFormatting = (text) => {
    const parts = [];
    let remainingText = text;
    let key = 0;

    while (remainingText.includes("**")) {
      const start = remainingText.indexOf("**");
      const end = remainingText.indexOf("**", start + 2);
      if (end === -1) break;

      parts.push(remainingText.substring(0, start));
      parts.push(<strong key={`bold-${key++}`}>{remainingText.substring(start + 2, end)}</strong>);
      remainingText = remainingText.substring(end + 2);
    }
    if (parts.length > 0) {
      parts.push(remainingText);
    }

    if (parts.length === 0) parts.push(remainingText);

    const italicParts = [];
    parts.forEach((part, index) => {
      if (typeof part === "string" && part.includes("*")) {
        let subRemaining = part;
        while (subRemaining.includes("*")) {
          const start = subRemaining.indexOf("*");
          const end = subRemaining.indexOf("*", start + 1);
          if (end === -1) break;

          italicParts.push(subRemaining.substring(0, start));
          italicParts.push(<em key={`italic-${key++}`}>{subRemaining.substring(start + 1, end)}</em>);
          subRemaining = subRemaining.substring(end + 1);
        }
        italicParts.push(subRemaining);
      } else {
        italicParts.push(part);
      }
    });

    const finalParts = [];
    italicParts.forEach((part, index) => {
      if (typeof part === "string" && part.includes("<u>")) {
        let subRemaining = part;
        while (subRemaining.includes("<u>")) {
          const start = subRemaining.indexOf("<u>");
          const end = subRemaining.indexOf("</u>", start + 3);
          if (end === -1) break;

          finalParts.push(subRemaining.substring(0, start));
          finalParts.push(<u key={`underline-${key++}`}>{subRemaining.substring(start + 3, end)}</u>);
          subRemaining = subRemaining.substring(end + 4);
        }
        finalParts.push(subRemaining);
      } else {
        finalParts.push(part);
      }
    });

    return finalParts;
  };

  const renderSection = () => {
    switch (activeSection) {
      case "Basic Information":
        return (
          <div className="form-section animate-in">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Full Stack Web Developer"
                required
              />
            </div>
            <div className="form-group">
              <label>Company</label>
              <select
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
              >
                <option value="">Select a Company</option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
              {companies.length === 0 && (
                <p className="form-error">No companies available. Please add a company first.</p>
              )}
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. 123 Maplewood Drive, Springfield, Illinois"
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. johndoe787@gmail.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Job Type</label>
              <select name="type" value={formData.type} onChange={handleChange} required>
                <option value="">Select Job Type</option>
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Remote</label>
              <input
                type="checkbox"
                name="remote"
                checked={formData.remote}
                onChange={handleChange}
              />
            </div>
          </div>
        );
      case "Job Requirements":
        return (
          <div className="form-section animate-in">
            <h3>Job Requirements</h3>
            <div className="form-group">
              <label>Experience</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g. 2-4 years"
              />
            </div>
            <div className="form-group salary-group">
              <label>Salary Range (LPA)</label>
              <div className="salary-inputs">
                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  placeholder="Min"
                />
                <span>-</span>
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  placeholder="Max"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Education Level</label>
              <select
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
              >
                <option value="">Select Education Level</option>
                <option value="High School">High School</option>
                <option value="Graduate">Graduate</option>
                <option value="Post Graduate">Post Graduate</option>
              </select>
            </div>
            <div className="form-group">
              <label>Languages</label>
              <input
                type="text"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                placeholder="e.g. English, Hindi, Gujarati"
              />
            </div>
            <div className="form-group">
              <label>Application Deadline</label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleChange}
              />
            </div>
          </div>
        );
      case "Skills":
        return (
          <div className="form-section animate-in">
            <h3>Skills</h3>
            <div className="skills-container">
              <div className="skills-input-group">
                <input
                  type="text"
                  value={newSkill}
                  onChange={handleSkillInput}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSkillAdd(newSkill);
                    }
                  }}
                  placeholder="Type a skill and press Enter or select below"
                />
                <button
                  type="button"
                  className="add-skill-btn"
                  onClick={() => handleSkillAdd(newSkill)}
                >
                  Add
                </button>
              </div>

              {showSuggestions && newSkill && (
                <div className="suggested-skills">
                  <div className="suggested-skills-list">
                    {suggestedSkills
                      .filter(skill =>
                        skill.toLowerCase().includes(newSkill.toLowerCase()) &&
                        !formData.skills.includes(skill)
                      )
                      .map(skill => (
                        <div
                          key={skill}
                          className="suggested-skill-item"
                          onClick={() => handleSkillAdd(skill)}
                        >
                          {skill}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="skills-list">
                {formData.skills.map((skill) => (
                  <div key={skill} className="skill-tag">
                    {skill}
                    <span
                      className="remove-skill"
                      onClick={() => handleSkillRemove(skill)}
                    >
                      ×
                    </span>
                  </div>
                ))}
                {formData.skills.length === 0 && (
                  <p className="skills-placeholder">No skills added yet</p>
                )}
              </div>
            </div>
          </div>
        );
      case "Job Details":
        return (
          <div className="form-section animate-in">
            <h3>Job Details</h3>
            <div className="form-group">
              <label>Description</label>
              <div className="formatting-controls">
                <button
                  type="button"
                  onClick={() => applyFormatting("description", "bold")}
                  title="Bold"
                >
                  <b>B</b>
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("description", "italic")}
                  title="Italic"
                >
                  <i>I</i>
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("description", "underline")}
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("description", "bullet")}
                  title="Bullet List"
                >
                  •
                </button>
              </div>
              <textarea
                ref={descriptionRef}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the job role... (Use formatting buttons above)"
                rows="4"
              />
            </div>
            <div className="form-group">
              <label>Key Responsibilities</label>
              <div className="formatting-controls">
                <button
                  type="button"
                  onClick={() => applyFormatting("responsibilities", "bold")}
                  title="Bold"
                >
                  <b>B</b>
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("responsibilities", "italic")}
                  title="Italic"
                >
                  <i>I</i>
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("responsibilities", "underline")}
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("responsibilities", "bullet")}
                  title="Bullet List"
                >
                  •
                </button>
              </div>
              <textarea
                ref={responsibilitiesRef}
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                placeholder="List key responsibilities... (Use formatting buttons above)"
                rows="4"
              />
            </div>
            <div className="form-group">
              <label>Role & Experience</label>
              <div className="formatting-controls">
                <button
                  type="button"
                  onClick={() => applyFormatting("roleExperience", "bold")}
                  title="Bold"
                >
                  <b>B</b>
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("roleExperience", "italic")}
                  title="Italic"
                >
                  <i>I</i>
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("roleExperience", "underline")}
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("roleExperience", "bullet")}
                  title="Bullet List"
                >
                  •
                </button>
              </div>
              <textarea
                ref={roleExperienceRef}
                name="roleExperience"
                value={formData.roleExperience}
                onChange={handleChange}
                placeholder="Describe required role and experience... (Use formatting buttons above)"
                rows="4"
              />
            </div>
          </div>
        );
      case "Review":
        return (
          <div className="form-section review-section animate-in">
            <h3>Review Your Job Posting</h3>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <div className="review-content">
              <div className="review-block">
                <h4>Basic Information</h4>
                <p><span>Job Title:</span> {formData.jobTitle || "Not provided"}</p>
                <p><span>Company:</span> {companies.find(c => c._id === formData.company)?.name || "Not selected"}</p>
                <p><span>Location:</span> {formData.location || "Not provided"}</p>
                <p><span>Email:</span> {formData.email || "Not provided"}</p>
                <p><span>Type:</span> {formData.type || "Not provided"}</p>
                <p><span>Category:</span> {formData.category || "Not provided"}</p>
                <p><span>Remote:</span> {formData.remote ? "Yes" : "No"}</p>
              </div>
              <div className="review-block">
                <h4>Job Requirements</h4>
                <p><span>Experience:</span> {formData.experience || "Not provided"}</p>
                <p><span>Salary:</span> {formData.salaryMin && formData.salaryMax
                  ? `${formData.salaryMin} - ${formData.salaryMax} LPA`
                  : "Not provided"}</p>
                <p><span>Education:</span> {formData.educationLevel || "Not provided"}</p>
                <p><span>Languages:</span> {formData.languages || "Not provided"}</p>
                <p><span>Deadline:</span> {formData.applicationDeadline || "Not provided"}</p>
              </div>
              <div className="review-block">
                <h4>Skills</h4>
                {formData.skills.length > 0 ? (
                  <div className="skills-list">
                    {formData.skills.map((skill) => (
                      <div key={skill} className="skill-tag">{skill}</div>
                    ))}
                  </div>
                ) : (
                  <p>Not provided</p>
                )}
              </div>
              <div className="review-block">
                <h4>Job Details</h4>
                <p><span>Description:</span> <div className="formatted-text">{renderFormattedText(formData.description)}</div></p>
                <p><span>Responsibilities:</span> <div className="formatted-text">{renderFormattedText(formData.responsibilities)}</div></p>
                <p><span>Role & Exp:</span> <div className="formatted-text">{renderFormattedText(formData.roleExperience)}</div></p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="job-posting-container">
      <div className="form-header">
        <h2>Create Job Posting</h2>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((sections.indexOf(activeSection) + 1) / sections.length) * 100}%` }}
          ></div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="job-posting-form">
        <div className="section-tabs">
          {sections.map((section, index) => (
            <button
              key={section}
              type="button"
              className={`tab-btn ${activeSection === section ? "active" : ""}`}
              onClick={() => setActiveSection(section)}
            >
              <span className="tab-number">{index + 1}</span>
              {section}
            </button>
          ))}
        </div>

        {renderSection()}

        <div className="form-navigation">
          {activeSection !== sections[0] && (
            <button
              type="button"
              className="nav-btn prev-btn"
              onClick={() => setActiveSection(sections[sections.indexOf(activeSection) - 1])}
            >
              ← Previous
            </button>
          )}
          {activeSection !== "Review" && (
            <button
              type="button"
              className="nav-btn next-btn"
              onClick={() => setActiveSection(sections[sections.indexOf(activeSection) + 1])}
            >
              Next →
            </button>
          )}
          {activeSection === "Review" && (
            <button type="submit" className="nav-btn submit-btn">
              Post Job
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default JobPostingForm;