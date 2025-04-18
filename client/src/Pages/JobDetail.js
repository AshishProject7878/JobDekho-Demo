import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import emailjs from "@emailjs/browser";
import "../styles/JobDetail.css";
import CompImg from "../Assests/CompLogo.png";

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="job-detail-container">
          <h1>Something went wrong.</h1>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionOrder, setSectionOrder] = useState([
    "Description",
    "Key Responsibilities",
    "Role & Experience",
  ]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [profileResume, setProfileResume] = useState(null);
  const [applicantEmail, setApplicantEmail] = useState(null);
  const [newResume, setNewResume] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shareStatus, setShareStatus] = useState(null);

  const BASE_URL = "http://localhost:5000";
  const PROFILE_API_URL = `${BASE_URL}/api/profile`;
  const UPLOAD_RESUME_URL = `${BASE_URL}/api/upload/resume`;
  const JOB_URL = `${window.location.origin}/job/${id}`;

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init("7E85Be-mzfn5NmnlF");
  }, []);

  // Fetch job details and profile data
  useEffect(() => {
    const fetchJobAndProfile = async () => {
      try {
        const jobResponse = await axios.get(`${BASE_URL}/api/posts/${id}`, {
          withCredentials: true,
        });
        console.log("Job API Response:", jobResponse.data);
        setJob(jobResponse.data);

        const profileResponse = await axios.get(PROFILE_API_URL, {
          withCredentials: true,
        });
        console.log("Profile API Response:", profileResponse.data);
        console.log("Personal Data:", profileResponse.data.personal);
        setProfileResume(profileResponse.data.personal?.resumeUrl || null);
        setApplicantEmail(profileResponse.data.user?.email || null); // Use user.email

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load job details or profile.");
        setLoading(false);
      }
    };

    fetchJobAndProfile();
  }, [id]);

  const handleTabClick = (tab) => {
    setSectionOrder((prevOrder) => {
      const newOrder = [...prevOrder];
      const index = newOrder.indexOf(tab);
      if (index > -1) {
        newOrder.splice(index, 1);
        newOrder.unshift(tab);
      }
      return newOrder;
    });
  };

  const renderTimeline = (text) => {
    if (!text || typeof text !== "string") return <p>Not provided</p>;
    const lines = text.split("\n").filter((line) => line.trim());
    return (
      <div className="timeline">
        {lines.map((line, index) => {
          const formatted = line
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")
            .replace(/^- /, "");
          return (
            <div key={index} className="timeline-item">
              <div className="content">
                <h3 dangerouslySetInnerHTML={{ __html: formatted }} />
                {lines.length > 1 && (
                  <p className="description" dangerouslySetInnerHTML={{ __html: formatted }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDescription = (text) => {
    if (!text || typeof text !== "string") return <p>Not provided</p>;
    return (
      <p
        dangerouslySetInnerHTML={{
          __html: text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>"),
        }}
      />
    );
  };

  const formatLanguages = (languages) => {
    console.log("Languages value:", languages);
    if (!languages) return "Not specified";
    if (Array.isArray(languages)) {
      return languages.length > 0 ? languages.join(", ") : "Not specified";
    } else if (typeof languages === "string") {
      return languages
        .split(/[\s,]+/)
        .map((lang) => lang.trim())
        .filter((lang) => lang)
        .join(", ");
    } else if (typeof languages === "object" && languages !== null) {
      return languages.name || "Not specified";
    }
    return "Not specified";
  };

  const handleApplyClick = () => {
    setShowApplyModal(true);
    setEmailStatus(null);
    setNewResume(null);
  };

  const handleShareClick = () => {
    setShowShareModal(true);
    setShareStatus(null);
    setShareEmail("");
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setEmailStatus("Error: Only PDF files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setEmailStatus("Error: File size must be less than 10MB.");
      return;
    }

    // Upload to /api/upload/resume
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const response = await axios.post(UPLOAD_RESUME_URL, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Resume Upload Response:", response.data);
      setProfileResume(response.data.url); // Update profile resume
      setNewResume(null); // Clear local file
      setEmailStatus("Resume uploaded successfully!");
    } catch (err) {
      console.error("Resume Upload Error:", err);
      setEmailStatus("Error: Failed to upload resume.");
    }
  };

  const sendResumeEmail = async () => {
    if (!job.contactEmail) {
      setEmailStatus("Error: No contact email available for this job.");
      return;
    }

    if (!profileResume) {
      setEmailStatus("Error: Please upload a resume.");
      return;
    }

    if (!applicantEmail) {
      setEmailStatus("Error: Applicant email not found in profile.");
      return;
    }

    const templateParams = {
      to_email: job.contactEmail,
      from_name: applicantEmail ? applicantEmail.split("@")[0] : "Job Applicant",
      reply_to: applicantEmail,
      job_title: job.title,
      company: typeof job.company === "string" ? job.company : job.company?.name || "Unknown Company",
      resume_url: profileResume, // Use profileResume (updated via upload)
    };

    console.log("Sending email with params:", templateParams);

    try {
      const response = await emailjs.send(
        "service_bqzf4o6",
        "template_bbsvz9h",
        templateParams
      );
      console.log("Email sent successfully:", response);
      setEmailStatus("Resume sent successfully!");
      setShowApplyModal(false);
    } catch (err) {
      console.error("Failed to send email:", err);
      setEmailStatus("Failed to send resume. Please try again.");
    }
  };

  const sendShareEmail = async () => {
    if (!shareEmail) {
      setShareStatus("Error: Please enter an email address.");
      return;
    }

    if (!applicantEmail) {
      setShareStatus("Error: Your email not found in profile.");
      return;
    }

    const templateParams = {
      to_email: shareEmail,
      from_name: applicantEmail ? applicantEmail.split("@")[0] : "Job Sharer",
      reply_to: applicantEmail,
      job_title: job.title,
      company: typeof job.company === "string" ? job.company : job.company?.name || "Unknown Company",
      job_url: JOB_URL,
      message: `Check out this job posting: ${job.title} at ${
        typeof job.company === "string" ? job.company : job.company?.name || "Unknown Company"
      }. Apply here: ${JOB_URL}`,
    };

    console.log("Sending share email with params:", templateParams);

    try {
      const response = await emailjs.send(
        "service_bqzf4o6",
        "template_bbsvz9h",
        templateParams
      );
      console.log("Share email sent successfully:", response);
      setShareStatus("Job shared successfully!");
      setShowShareModal(false);
    } catch (err) {
      console.error("Failed to send share email:", err);
      setShareStatus("Failed to share job. Please try again.");
    }
  };

  const copyJobLink = () => {
    navigator.clipboard.writeText(JOB_URL).then(
      () => {
        setShareStatus("Link copied to clipboard!");
        setTimeout(() => setShowShareModal(false), 1500);
      },
      (err) => {
        console.error("Failed to copy link:", err);
        setShareStatus("Failed to copy link.");
      }
    );
  };

  if (loading) return <div className="job-detail-container"><p>Loading job details...</p></div>;
  if (error) return <div className="job-detail-container"><p>{error}</p></div>;
  if (!job) return <div className="job-detail-container"><p>Job not found.</p></div>;

  const sections = {
    Description: (
      <>
        <h2>Description</h2>
        {renderDescription(job.description)}
      </>
    ),
    "Key Responsibilities": (
      <>
        <h2>Key Responsibilities</h2>
        {renderTimeline(job.responsibilities)}
      </>
    ),
    "Role & Experience": (
      <>
        <h2>Role & Experience</h2>
        {renderTimeline(job.roleExperience)}
      </>
    ),
  };

  return (
    <ErrorBoundary>
      <div className="job-detail-container">
        <div className="jobDetail-holder">
          <div className="jobDetail-dets">
            <h3 className="JobTitle">{job.title}</h3>
            <p className="CompName">
              {typeof job.company === "string" ? job.company : job.company?.name || "Unknown Company"}
            </p>
            <div className="jobLocation">
              <span>
                <i className="fa-solid fa-location-dot"></i>
              </span>
              <p>{typeof job.location === "string" ? job.location : "Not specified"}</p>
            </div>
          </div>
          <div className="editJobDetail">
            <button className="Jobbtn1" onClick={handleApplyClick}>
              Apply
            </button>
            <button className="Jobbtn1 btn-cv" onClick={handleShareClick}>
              Share
            </button>
          </div>
        </div>

        <div className="section2">
          <div className="section-buttons" style={{ marginBottom: "20px" }}>
            {["Description", "Key Responsibilities", "Role & Experience"].map((tab) => {
              const isActive = tab === sectionOrder[0];
              return (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={isActive ? "Jobbtn active-tab" : "Jobbtn inactive-tab"}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <hr style={{ marginBottom: "25px" }} />

          <div className="about-me">
            <div className="about-holder">
              {sectionOrder.map((tab) => (
                <div key={tab} className="section-block" style={{ marginBottom: "30px" }}>
                  {sections[tab]}
                </div>
              ))}
            </div>

            <div className="adv">
              <div className="overview">
                <h3 className="title">Overview</h3>
                <hr />
                <p className="short-dets">
                  <i className="fa-solid fa-briefcase"></i>
                  <span style={{ marginLeft: "20px" }}>Experience</span>
                </p>
                <p className="dets">
                  {typeof job.experience === "string" ? job.experience : "Not specified"}
                </p>

                <p className="short-dets">
                  <i className="fa-solid fa-sack-dollar"></i>
                  <span style={{ marginLeft: "20px" }}>Salary</span>
                </p>
                <p className="dets">
                  {job.salary && (job.salary.min || job.salary.max)
                    ? `${job.salary.min || "N/A"} - ${job.salary.max || "N/A"} ${
                        job.salary.currency || "LPA"
                      }`
                    : "Not disclosed"}
                </p>

                <p className="short-dets">
                  <i className="fa-solid fa-graduation-cap"></i>
                  <span style={{ marginLeft: "20px" }}>Education Level</span>
                </p>
                <p className="dets grad">
                  {typeof job.educationLevel === "string" ? job.educationLevel : "Not specified"}
                </p>

                <p className="short-dets">
                  <i className="fa-solid fa-microphone"></i>
                  <span style={{ marginLeft: "20px" }}>Language</span>
                </p>
                <p className="dets lang">{formatLanguages(job.languages)}</p>

                <p className="short-dets">
                  <i className="fa-solid fa-envelope"></i>
                  <span style={{ marginLeft: "20px" }}>Email</span>
                </p>
                <p className="dets lang">
                  {typeof job.contactEmail === "string" ? job.contactEmail : "Not specified"}
                </p>

                <button className="Jobbtn1 SM" style={{ marginTop: "20px" }}>
                  Send Message
                </button>
              </div>

              <div className="overview">
                <h3 className="title">Skills</h3>
                <hr />
                <div className="skills-list">
                  {job.skills && Array.isArray(job.skills) ? (
                    job.skills.map((skill, index) => (
                      <div key={index} className="skillColor">
                        {skill}
                      </div>
                    ))
                  ) : (
                    <p>No skills listed</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Apply Modal */}
        {showApplyModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Apply for {job.title}</h2>
              <p>
                Please select a resume to send to{" "}
                {typeof job.contactEmail === "string" ? job.contactEmail : "the job poster"}:
              </p>

              <div className="resume-option">
                <label>
                  <input
                    type="radio"
                    name="resume"
                    checked={!newResume && profileResume}
                    onChange={() => setNewResume(null)}
                    disabled={!profileResume}
                  />
                  Use Profile Resume
                </label>
                {profileResume ? (
                  <div className="resume-preview">
                    <a href={profileResume} target="_blank" rel="noopener noreferrer">
                      View Resume
                    </a>
                    <embed
                      src={profileResume}
                      type="application/pdf"
                      width="100%"
                      height="200px"
                      style={{ marginTop: "10px" }}
                    />
                  </div>
                ) : (
                  <p>No resume available in profile.</p>
                )}
              </div>

              <div className="resume-option">
                <label>
                  <input
                    type="radio"
                    name="resume"
                    checked={!!newResume}
                    onChange={() => {}}
                  />
                  Upload New Resume
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeChange}
                  className="resume-upload"
                />
              </div>

              {emailStatus && (
                <p className={emailStatus.includes("Error") ? "error-text" : "success-text"}>
                  {emailStatus}
                </p>
              )}

              <div className="modal-buttons">
                <button className="Jobbtn1" onClick={sendResumeEmail}>
                  Send Resume
                </button>
                <button className="Jobbtn1 btn-cancel" onClick={() => setShowApplyModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Share {job.title}</h2>
              <p>Share this job with others:</p>

              <div className="share-option">
                <h3>Via Email</h3>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="Enter recipient's email"
                  className="share-email-input"
                />
                <button className="Jobbtn1" onClick={sendShareEmail} style={{ marginTop: "10px" }}>
                  Send Email
                </button>
              </div>

              <div className="share-option">
                <h3>Copy Link</h3>
                <p>{JOB_URL}</p>
                <button className="Jobbtn1" onClick={copyJobLink}>
                  Copy to Clipboard
                </button>
              </div>

              <div className="share-option">
                <h3>Social Media</h3>
                <div className="social-buttons">
                  <button
                    className="Jobbtn1 social-btn"
                    onClick={() =>
                      window.open(
                        `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                          JOB_URL
                        )}&text=${encodeURIComponent(
                          `Check out this job: ${job.title} at ${
                            typeof job.company === "string"
                              ? job.company
                              : job.company?.name || "Unknown Company"
                          }`
                        )}`,
                        "_blank"
                      )
                    }
                  >
                    Twitter
                  </button>
                  <button
                    className="Jobbtn1 social-btn"
                    onClick={() =>
                      window.open(
                        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                          JOB_URL
                        )}`,
                        "_blank"
                      )
                    }
                  >
                    LinkedIn
                  </button>
                </div>
              </div>

              {shareStatus && (
                <p className={shareStatus.includes("Error") ? "error-text" : "success-text"}>
                  {shareStatus}
                </p>
              )}

              <div className="modal-buttons">
                <button className="Jobbtn1 btn-cancel" onClick={() => setShowShareModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default JobDetail;