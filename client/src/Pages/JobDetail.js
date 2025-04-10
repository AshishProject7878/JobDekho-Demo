import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
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

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${id}`, {
          withCredentials: true,
        });
        console.log("API Response:", response.data); // Debug: Log the full response
        setJob(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch job:", err);
        setError("Failed to load job details.");
        setLoading(false);
      }
    };

    fetchJob();
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
              {/* <div className="circle">{index + 1}</div> */}
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

  // Updated formatLanguages to handle different types
  const formatLanguages = (languages) => {
    console.log("Languages value:", languages); // Debug: Log the value of languages
    if (!languages) return "Not specified";

    // Handle different types of languages input
    if (Array.isArray(languages)) {
      return languages.length > 0 ? languages.join(", ") : "Not specified";
    } else if (typeof languages === "string") {
      return languages
        .split(/[\s,]+/)
        .map(lang => lang.trim())
        .filter(lang => lang)
        .join(", ");
    } else {
      return "Not specified"; // Fallback for unexpected types (object, number, etc.)
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
        {/* <div className="img-container1">
          <img src={CompImg} alt={`${job.company} Logo`} />
        </div> */}
        <div className="jobDetail-dets">
          <h3 className="JobTitle">{job.title}</h3>
          <p className="CompName">{job.company}</p>
          {/* <p>⭐⭐⭐⭐⭐</p> */}
          <div className="jobLocation">
            <span><i className="fa-solid fa-location-dot"></i></span>
            <p>{job.location}</p>
          </div>
        </div>
        <div className="editJobDetail">
          <button className="Jobbtn1">Apply</button>
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
    </div>
  );
}

export default JobDetail;