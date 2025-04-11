import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import emailjs from "@emailjs/browser";
import "../styles/JobDetail.css";
import CompImg from "../Assests/CompLogo.png";

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
  const [showModal, setShowModal] = useState(false);
  const [profileResume, setProfileResume] = useState(null);
  const [applicantEmail, setApplicantEmail] = useState(null); // Applicant's email
  const [newResume, setNewResume] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);

  const BASE_URL = "http://localhost:5000";
  const PROFILE_API_URL = `${BASE_URL}/api/profile`;

  // Fetch job details and profile data (resume + email)
  useEffect(() => {
    const fetchJobAndProfile = async () => {
      try {
        // Fetch job details
        const jobResponse = await axios.get(`${BASE_URL}/api/posts/${id}`, {
          withCredentials: true,
        });
        console.log("Job API Response:", jobResponse.data);
        setJob(jobResponse.data);

        // Fetch profile resume and email
        const profileResponse = await axios.get(PROFILE_API_URL, {
          withCredentials: true,
        });
        console.log("Profile API Response:", profileResponse.data);
        setProfileResume(profileResponse.data.personal?.resume || null);
        setApplicantEmail(profileResponse.data.personal?.email || null); // Fetch applicant's email

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
    if (!text) return <p>Not provided</p>;
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
    if (!text) return <p>Not provided</p>;
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
    } else {
      return "Not specified";
    }
  };

  // Handle Apply button click
  const handleApplyClick = () => {
    setShowModal(true);
    setEmailStatus(null);
  };

  // Handle new resume upload
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setEmailStatus("Error: Only PDF files are allowed.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setEmailStatus("Error: File size must be less than 10MB.");
        return;
      }
      setNewResume(file);
      setEmailStatus(null);
    }
  };

  // Send resume via EmailJS
  const sendResumeEmail = async () => {
    if (!job.contactEmail) {
      setEmailStatus("Error: No contact email available for this job.");
      return;
    }

    const resumeToSend = newResume || profileResume;
    if (!resumeToSend) {
      setEmailStatus("Error: Please upload a resume or ensure one is in your profile.");
      return;
    }

    if (!applicantEmail) {
      setEmailStatus("Error: Applicant email not found in profile.");
      return;
    }

    emailjs.init("7E85Be-mzfn5NmnlF"); // Your Public Key

    const templateParams = {
      to_email: job.contactEmail, // Job poster's email
      from_name: applicantEmail ? applicantEmail.split("@")[0] : "Job Applicant", // Display name
      reply_to: applicantEmail, // Applicant's email for Reply-To
      job_title: job.title,
      company: job.company,
      resume_url: typeof resumeToSend === "string" ? resumeToSend : URL.createObjectURL(resumeToSend),
    };

    console.log("Sending email with params:", templateParams);

    try {
      const response = await emailjs.send(
        "service_bqzf4o6", // Your Service ID
        "template_bbsvz9h", // Your Template ID
        templateParams
      );
      console.log("Email sent successfully:", response);
      setEmailStatus("Resume sent successfully!");
      setShowModal(false);
    } catch (err) {
      console.error("Failed to send email:", err);
      setEmailStatus("Failed to send resume. Please try again.");
    }
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
    <div className="job-detail-container">
      <div className="jobDetail-holder">
        <div className="jobDetail-dets">
          <h3 className="JobTitle">{job.title}</h3>
          <p className="CompName">{job.company}</p>
          <div className="jobLocation">
            <span><i className="fa-solid fa-location-dot"></i></span>
            <p>{job.location}</p>
          </div>
        </div>
        <div className="editJobDetail">
          <button className="Jobbtn1" onClick={handleApplyClick}>
            Apply
          </button>
          <button className="Jobbtn1 btn-cv">Share</button>
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
              <p className="dets">{job.experience || "Not specified"}</p>

              <p className="short-dets">
                <i className="fa-solid fa-sack-dollar"></i>
                <span style={{ marginLeft: "20px" }}>Salary</span>
              </p>
              <p className="dets">
                {job.salary && (job.salary.min || job.salary.max)
                  ? `${job.salary.min || "N/A"} - ${job.salary.max || "N/A"} ${job.salary.currency || "LPA"}`
                  : "Not disclosed"}
              </p>

              <p className="short-dets">
                <i className="fa-solid fa-graduation-cap"></i>
                <span style={{ marginLeft: "20px" }}>Education Level</span>
              </p>
              <p className="dets grad">{job.educationLevel || "Not specified"}</p>

              <p className="short-dets">
                <i className="fa-solid fa-microphone"></i>
                <span style={{ marginLeft: "20px" }}>Language</span>
              </p>
              <p className="dets lang">{formatLanguages(job.languages)}</p>

              <p className="short-dets">
                <i className="fa-solid fa-envelope"></i>
                <span style={{ marginLeft: "20px" }}>Email</span>
              </p>
              <p className="dets lang">{job.contactEmail || "Not specified"}</p>

              <button className="Jobbtn1 SM" style={{ marginTop: "20px" }}>
                Send Message
              </button>
            </div>

            <div className="overview">
              <h3 className="title">Skills</h3>
              <hr />
              <div className="skills-list">
                {job.skills && job.skills.length > 0 ? (
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

      {/* Resume Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Apply for {job.title}</h2>
            <p>Please select a resume to send to {job.contactEmail || "the job poster"}:</p>

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
                {profileResume ? (
                  <a href={profileResume} target="_blank" rel="noopener noreferrer">
                    (View)
                  </a>
                ) : (
                  <span> (Not available)</span>
                )}
              </label>
            </div>

            <div className="resume-option">
              <label>
                <input
                  type="radio"
                  name="resume"
                  checked={!!newResume}
                  onChange={() => setNewResume(null)}
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
              <button className="Jobbtn1 btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobDetail;