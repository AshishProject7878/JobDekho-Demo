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
  const [profileVideoResume, setProfileVideoResume] = useState(null);
  const [applicantEmail, setApplicantEmail] = useState(null);
  const [newResume, setNewResume] = useState(null);
  const [newVideoResume, setNewVideoResume] = useState(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shareStatus, setShareStatus] = useState(null);
  const [videoError, setVideoError] = useState(null);
  const [isApplied, setIsApplied] = useState(false); // New state for applied status

  const BASE_URL = "http://localhost:5000";
  const PROFILE_API_URL = `${BASE_URL}/api/profile`;
  const UPLOAD_RESUME_URL = `${BASE_URL}/api/upload/resume`;
  const UPLOAD_VIDEO_URL = `${BASE_URL}/api/upload/video-resume`;
  const AUTO_APPLY_URL = `${BASE_URL}/api/profile/auto-job/applications`;
  const JOB_URL = `${window.location.origin}/job/${id}`;

  useEffect(() => {
    emailjs.init("7E85Be-mzfn5NmnlF");
  }, []);

  useEffect(() => {
    const fetchJobAndProfile = async () => {
      try {
        const jobResponse = await axios.get(`${BASE_URL}/api/posts/${id}`, {
          withCredentials: true,
        });
        setJob(jobResponse.data);

        const profileResponse = await axios.get(PROFILE_API_URL, {
          withCredentials: true,
        });
        setProfileResume(profileResponse.data.personal?.resumeUrl || null);
        setProfileVideoResume(profileResponse.data.personal?.videoResumeUrl || null);
        setApplicantEmail(profileResponse.data.user?.email || null);

        // Check if job is in auto-applied jobs
        const autoApplyResponse = await axios.get(AUTO_APPLY_URL, {
          withCredentials: true,
        });
        const isJobApplied = autoApplyResponse.data.some(
          (application) => application.jobId?._id === id
        );
        setIsApplied(isJobApplied);

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
    setNewVideoResume(null);
    setVideoError(null);
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

    try {
      const formData = new FormData();
      formData.append("resume", file);
      const response = await axios.post(UPLOAD_RESUME_URL, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfileResume(response.data.url);
      setNewResume(null);
      setEmailStatus("Resume uploaded successfully!");
    } catch (err) {
      console.error("Resume Upload Error:", err);
      setEmailStatus("Error: Failed to upload resume.");
    }
  };

  const handleVideoResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["video/mp4", "video/webm"].includes(file.type)) {
      setVideoError("Error: Only MP4 or WebM videos are allowed.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setVideoError("Error: Video size must be less than 50MB.");
      return;
    }

    setNewVideoResume(file);
    setVideoError(null);
  };

  const handleVideoResumeUpload = async () => {
    if (!newVideoResume) {
      setVideoError("Error: Please select a video file to upload.");
      return;
    }

    setIsUploadingVideo(true);
    const formData = new FormData();
    formData.append("videoResume", newVideoResume);

    try {
      const response = await axios.post(UPLOAD_VIDEO_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setProfileVideoResume(response.data.url);
      setNewVideoResume(null);
      setVideoError(null);
      setEmailStatus("Video resume uploaded successfully!");
    } catch (err) {
      console.error("Video Resume Upload Error:", err);
      setVideoError(err.response?.data?.message || "Error: Failed to upload video resume.");
    } finally {
      setIsUploadingVideo(false);
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
      resume_url: profileResume,
      video_resume_url: profileVideoResume || "",
    };

    try {
      await emailjs.send("service_bqzf4o6", "template_bbsvz9h", templateParams);
      setEmailStatus("Application sent successfully!");
      setIsApplied(true); // Set applied status
      setShowApplyModal(false);
    } catch (err) {
      console.error("Failed to send email:", err);
      setEmailStatus("Failed to send application. Please try again.");
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

    try {
      await emailjs.send("service_bqzf4o6", "template_bbsvz9h", templateParams);
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

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setShowApplyModal(false);
      setShowShareModal(false);
    }
  };

  if (loading) return <div className="job-detail-container"><div className="loader">Loading...</div></div>;
  if (error) return <div className="job-detail-container"><p className="error-text">{error}</p></div>;
  if (!job) return <div className="job-detail-container"><p className="error-text">Job not found.</p></div>;

  const sections = {
    Description: (
      <div className="section-content">
        <h2>Description</h2>
        {renderDescription(job.description)}
      </div>
    ),
    "Key Responsibilities": (
      <div className="section-content">
        <h2>Key Responsibilities</h2>
        {renderTimeline(job.responsibilities)}
      </div>
    ),
    "Role & Experience": (
      <div className="section-content">
        <h2>Role & Experience</h2>
        {renderTimeline(job.roleExperience)}
      </div>
    ),
  };

  return (
    <ErrorBoundary>
      <div className="job-detail-container">
        <div className="jobDetail-holder">
          <div className="jobDetail-dets">
            <div className="img-container1">
              <img src={CompImg} alt="Company Logo" />
            </div>
            <h3 className="JobTitle">{job.title}</h3>
            <p className="CompName">
              {typeof job.company === "string" ? job.company : job.company?.name || "Unknown Company"}
            </p>
            <div className="jobLocation">
              <i className="fa-solid fa-location-dot"></i>
              <p>{typeof job.location === "string" ? job.location : "Not specified"}</p>
            </div>
          </div>
          <div className="editJobDetail">
            <button
              className={`Jobbtn1 ${isApplied ? "applied-btn" : ""}`}
              onClick={handleApplyClick}
              disabled={isApplied}
              data-testid="apply-button"
            >
              {isApplied ? "Applied" : "Apply"}
            </button>
            <button className="Jobbtn1 btn-cv" onClick={handleShareClick}>
              Share
            </button>
          </div>
        </div>

        <div className="section2">
          <div className="section-buttons">
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

          <div className="about-me">
            <div className="about-holder">
              {sectionOrder.map((tab) => (
                <div key={tab} className="section-block">
                  {sections[tab]}
                </div>
              ))}
            </div>

            <div className="adv">
              <div className="overview">
                <h3 className="title">Overview</h3>
                <div className="overview-item">
                  <p className="short-dets">
                    <i className="fa-solid fa-briefcase"></i> Experience
                  </p>
                  <p className="dets">
                    {typeof job.experience === "string" ? job.experience : "Not specified"}
                  </p>
                </div>
                <div className="overview-item">
                  <p className="short-dets">
                    <i className="fa-solid fa-sack-dollar"></i> Salary
                  </p>
                  <p className="dets">
                    {job.salary && (job.salary.min || job.salary.max)
                      ? `${job.salary.min || "N/A"} - ${job.salary.max || "N/A"} ${
                          job.salary.currency || "LPA"
                        }`
                      : "Not disclosed"}
                  </p>
                </div>
                <div className="overview-item">
                  <p className="short-dets">
                    <i className="fa-solid fa-graduation-cap"></i> Education Level
                  </p>
                  <p className="dets grad">
                    {typeof job.educationLevel === "string" ? job.educationLevel : "Not specified"}
                  </p>
                </div>
                <div className="overview-item">
                  <p className="short-dets">
                    <i className="fa-solid fa-microphone"></i> Language
                  </p>
                  <p className="dets lang">{formatLanguages(job.languages)}</p>
                </div>
                <div className="overview-item">
                  <p className="short-dets">
                    <i className="fa-solid fa-envelope"></i> Email
                  </p>
                  <p className="dets lang">
                    {typeof job.contactEmail === "string" ? job.contactEmail : "Not specified"}
                  </p>
                </div>
                <button className="Jobbtn1 SM">Send Message</button>
              </div>

              <div className="overview">
                <h3 className="title">Skills</h3>
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
          <div className="modal-overlay" onClick={handleOverlayClick} data-testid="apply-modal">
            <div className="modal-content" data-testid="apply-modal-content">
              <h2 data-testid="apply-modal-title">Apply for {job.title}</h2>
              <p data-testid="apply-modal-description">
                Please select a resume to send to{" "}
                {typeof job.contactEmail === "string" ? job.contactEmail : "the job poster"}:
              </p>

              <div className="resume-option" data-testid="resume-option">
                <label>
                  <input
                    type="radio"
                    name="resume"
                    checked={!newResume && profileResume}
                    onChange={() => setNewResume(null)}
                    disabled={!profileResume}
                    data-testid="profile-resume-radio"
                  />
                  Use Profile Resume
                </label>
                <div className="resume-option-content">
                  {profileResume ? (
                    <div className="resume-preview" data-testid="resume-preview">
                      <a href={profileResume} target="_blank" rel="noopener noreferrer">
                        View Resume
                      </a>
                      <embed
                        src={profileResume}
                        type="application/pdf"
                        width="100%"
                        height="200px"
                        data-testid="resize-embed"
                      />
                    </div>
                  ) : (
                    <p data-testid="no-resume-text">No resume available in profile.</p>
                  )}
                  <div className="resume-upload-container">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleResumeChange}
                      className="resume-upload"
                      data-testid="resume-upload"
                    />
                  </div>
                </div>
              </div>

              <div className="resume-option" data-testid="video-resume-option">
                <label>
                  <input
                    type="radio"
                    name="videoResume"
                    checked={!newVideoResume && profileVideoResume}
                    onChange={() => setNewVideoResume(null)}
                    disabled={!profileVideoResume}
                    data-testid="profile-video-resume-radio"
                  />
                  Use Profile Video Resume
                </label>
                <div className="resume-option-content">
                  {profileVideoResume ? (
                    <div className="video-resume-preview" data-testid="video-resume-preview">
                      <video
                        controls
                        src={profileVideoResume}
                        style={{ maxWidth: "100%", height: "auto" }}
                        data-testid="video-resume-embed"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <p data-testid="no-video-resume-text">No video resume available in profile.</p>
                  )}
                  <div className="video-upload-container">
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleVideoResumeChange}
                      className="video-upload"
                      data-testid="video-upload"
                    />
                    <button
                      className={`Jobbtn1 ${isUploadingVideo ? "loading-btn" : ""}`}
                      onClick={handleVideoResumeUpload}
                      disabled={isUploadingVideo || !newVideoResume}
                      data-testid="upload-video-button"
                    >
                      {isUploadingVideo ? (
                        <>
                          <span className="loader"></span> Uploading...
                        </>
                      ) : (
                        "Upload Video Resume"
                      )}
                    </button>
                  </div>
                </div>
                {videoError && <p className="error-text" data-testid="video-error">{videoError}</p>}
              </div>

              {emailStatus && (
                <p
                  className={emailStatus.includes("Error") ? "error-text" : "success-text"}
                  data-testid="email-status"
                >
                  {emailStatus}
                </p>
              )}

              <div className="modal-buttons" data-testid="apply-modal-buttons">
                <button
                  className="Jobbtn1"
                  onClick={sendResumeEmail}
                  data-testid="send-application-button"
                >
                  Send Application
                </button>
                <button
                  className="Jobbtn1 btn-cancel"
                  onClick={() => setShowApplyModal(false)}
                  data-testid="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="modal-overlay" onClick={handleOverlayClick} data-testid="share-modal">
            <div className="modal-content" data-testid="share-modal-content">
              <h2 data-testid="share-modal-title">Share {job.title}</h2>
              <p data-testid="share-modal-description">Share this job with others:</p>

              <div className="share-option" data-testid="share-email-option">
                <h3>Via Email</h3>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="Enter recipient's email"
                  className="share-email-input"
                  data-testid="share-email-input"
                />
                <button
                  className="Jobbtn1"
                  onClick={sendShareEmail}
                  data-testid="send-email-button"
                >
                  Send Email
                </button>
              </div>

              <div className="share-option" data-testid="copy-link-option">
                <h3>Copy Link</h3>
                <p data-testid="job-url">{JOB_URL}</p>
                <button
                  className="Jobbtn1"
                  onClick={copyJobLink}
                  data-testid="copy-link-button"
                >
                  Copy to Clipboard
                </button>
              </div>

              <div className="share-option" data-testid="social-media-option">
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
                    data-testid="twitter-button"
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
                    data-testid="linkedin-button"
                  >
                    LinkedIn
                  </button>
                </div>
              </div>

              {shareStatus && (
                <p
                  className={shareStatus.includes("Error") ? "error-text" : "success-text"}
                  data-testid="share-status"
                >
                  {shareStatus}
                </p>
              )}

              <div className="modal-buttons" data-testid="share-modal-buttons">
                <button
                  className="Jobbtn1 btn-cancel"
                  onClick={() => setShowShareModal(false)}
                  data-testid="close-button"
                >
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