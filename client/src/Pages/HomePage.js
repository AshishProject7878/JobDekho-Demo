import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import emailjs from "@emailjs/browser";
import "../styles/HomePage.css";
import Hero from "../Assests/Enthusiastic-bro.svg";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import GoogleLogo from "../Assests/Google.png";
import AmazonLogo from "../Assests/Amazon.png";
import FaceLogo from "../Assests/Facebook.png";
import NetflixLogo from "../Assests/Netflix.png";
import CompLogo from "../Assests/CompLogo.png"; 
import api from '../api'; 

// Company logos 
const companies = [
    { id: 1, name: "Google", logo: GoogleLogo },
    { id: 2, name: "Amazon", logo: AmazonLogo },
    { id: 3, name: "Microsoft", logo: GoogleLogo },
    { id: 4, name: "Netflix", logo: NetflixLogo },
    { id: 5, name: "Facebook", logo: FaceLogo }
];

function HomePage() {
    const swiperRef = useRef(null);
    const modalRef = useRef(null);
    const navigate = useNavigate();
    const [scrollPosition, setScrollPosition] = useState(0);
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showQuickApplyModal, setShowQuickApplyModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [profileResume, setProfileResume] = useState(null);
    const [profileVideoResume, setProfileVideoResume] = useState(null);
    const [applicantEmail, setApplicantEmail] = useState(null);
    const [newResume, setNewResume] = useState(null);
    const [newVideoResume, setNewVideoResume] = useState(null);
    const [isUploadingResume, setIsUploadingResume] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [emailStatus, setEmailStatus] = useState(null);
    const [resumeError, setResumeError] = useState(null);
    const [videoError, setVideoError] = useState(null);

    const BASE_URL = "http://localhost:5000";
    const PROFILE_API_URL = `${BASE_URL}/api/profile`;
    const UPLOAD_RESUME_URL = `${BASE_URL}/api/upload/resume`;
    const UPLOAD_VIDEO_URL = `${BASE_URL}/api/upload/video-resume`;

    // Initialize EmailJS
    useEffect(() => {
        emailjs.init("7E85Be-mzfn5NmnlF");
    }, []);

    // Close modal on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowQuickApplyModal(false);
                setEmailStatus(null);
                setResumeError(null);
                setVideoError(null);
            }
        };

        if (showQuickApplyModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showQuickApplyModal]);

    // Function to format salary object into a string
    const formatSalary = (salary) => {
        if (!salary || typeof salary !== 'object' || !salary.min || !salary.max) {
            return 'Not disclosed';
        }
        const { min, max, currency } = salary;
        const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '';
        return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()} / Year`;
    };

    // Function to truncate title
    const truncateTitle = (title, maxLength = 20) => {
        if (!title) return 'Untitled Job';
        return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
    };

    // Function to get company name
    const getCompanyName = (company) => {
        if (!company) return 'Unknown Company';
        if (typeof company === 'string') return company;
        return company.name || 'Unknown Company';
    };

    // Fetch jobs and profile data
    useEffect(() => {
        const fetchJobsAndProfile = async () => {
            setIsLoading(true);
            try {
                const jobResponse = await api.get('/api/posts', { withCredentials: true });
                const allJobs = jobResponse.data;
                // Select 8 random jobs
                const shuffled = allJobs.sort(() => 0.5 - Math.random());
                const selectedJobs = shuffled.slice(0, 8);
                setJobs(selectedJobs);

                const profileResponse = await axios.get(PROFILE_API_URL, {
                    withCredentials: true,
                });
                setProfileResume(profileResponse.data.personal?.resumeUrl || null);
                setProfileVideoResume(profileResponse.data.personal?.videoResumeUrl || null);
                setApplicantEmail(profileResponse.data.user?.email || null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load job postings or profile.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobsAndProfile();
    }, []);

    // Handle scroll for carousel
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setScrollPosition(scrollY);

            if (swiperRef.current) {
                const swiperInstance = swiperRef.current.swiper;
                swiperInstance.slideTo(Math.floor(scrollY / 100));
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Handle Quick Apply button click
    const handleQuickApplyClick = (job, e) => {
        e.stopPropagation();
        setSelectedJob(job);
        setShowQuickApplyModal(true);
        setEmailStatus(null);
        setResumeError(null);
        setVideoError(null);
        setNewResume(null);
        setNewVideoResume(null);
    };

    // Handle job card click to navigate to job detail page
    const handleJobCardClick = (jobId) => {
        navigate(`/job/${jobId}`);
    };

    // Handle resume file selection
    const handleResumeChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            setResumeError("Error: Only PDF files are allowed.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setResumeError("Error: File size must be less than 10MB.");
            return;
        }

        setNewResume(file);
        setResumeError(null);
    };

    // Handle resume upload
    const handleResumeUpload = async () => {
        if (!newResume) {
            setResumeError("Error: Please select a resume file to upload.");
            return;
        }

        setIsUploadingResume(true);
        const formData = new FormData();
        formData.append("resume", newResume);

        try {
            const response = await axios.post(UPLOAD_RESUME_URL, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });
            setProfileResume(response.data.url);
            setNewResume(null);
            setResumeError(null);
            setEmailStatus("Resume uploaded successfully!");
        } catch (err) {
            console.error("Resume Upload Error:", err);
            setResumeError("Error: Failed to upload resume.");
        } finally {
            setIsUploadingResume(false);
        }
    };

    // Handle video resume file selection
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

    // Handle video resume upload
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
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
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

    // Send application email
    const sendResumeEmail = async () => {
        if (!selectedJob.contactEmail) {
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
            to_email: selectedJob.contactEmail,
            from_name: applicantEmail ? applicantEmail.split("@")[0] : "Job Applicant",
            reply_to: applicantEmail,
            job_title: selectedJob.title,
            company: getCompanyName(selectedJob.company),
            resume_url: profileResume,
            video_resume_url: profileVideoResume || "",
        };

        try {
            await emailjs.send("service_bqzf4o6", "template_bbsvz9h", templateParams);
            setEmailStatus("Application sent successfully!");
            setShowQuickApplyModal(false);
        } catch (err) {
            console.error("Failed to send email:", err);
            setEmailStatus("Failed to send application. Please try again.");
        }
    };

    return (
        <div className='Home-main'>
            <div className='Home-header'>
                <div className='Home-Section-1'>
                    <h1 className='hero-title'>
                        Discover Your Dream <br /> Career Today!
                    </h1>
                    <p className='hero-subtitle'>
                        Explore thousands of job opportunities with top companies worldwide.
                    </p>
                </div>
                <div className='Home-Section-2'>
                    <img src={Hero} alt="Hero Section" className='hero-image'/>
                </div>
            </div>

            {/* ----------------------- Mid Section (Company Carousel) --------------------- */}
            <div className='Mid-Section'>
                <h2 className="carousel-title">Top Hiring Companies</h2>
                
                <div className="carousel-wrapper">
                    <Swiper
                        ref={swiperRef}
                        slidesPerView={4}
                        spaceBetween={20}
                        loop={true}
                        className="company-carousel"
                    >
                        {companies.map((company) => (
                            <SwiperSlide key={company.id}>
                                <div className="company-card">
                                    <img src={company.logo} alt={company.name} />
                                    <p>{company.name}</p>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>

            {/* ----------------------- Trending Jobs Section --------------------- */}
            <div className="hp-trending-jobs-section">
                <h2 className="hp-trending-jobs-title">Trending Jobs</h2>
                {isLoading ? (
                    <div className="hp-loader-container">
                        <div className="hp-loader"></div>
                    </div>
                ) : error ? (
                    <div className="hp-error">{error}</div>
                ) : (
                    <div className="hp-trending-jobs-container">
                        {jobs.map((job) => (
                            <div 
                                key={job._id} 
                                className="hp-job-card"
                                onClick={() => handleJobCardClick(job._id)}
                            >
                                <div className="hp-job-card-header">
                                    <span className="hp-job-badge">Featured</span>
                                    <i className="fa-solid fa-bookmark hp-job-bookmark-icon"></i>
                                </div>
                                <div className="hp-job-card-body">
                                    <div className="hp-company-info">
                                        <img src={CompLogo} alt="Company Logo" className="hp-company-logo" />
                                        <div className="hp-company-details">
                                            <h3 className="hp-job-title">{truncateTitle(job.title)}</h3>
                                            <p className="hp-company-name">{getCompanyName(job.company)}</p>
                                            <div className="hp-job-location">
                                                <i className="fa-solid fa-location-dot"></i> {job.location || 'Remote'}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="hp-job-description">
                                        {job.description?.substring(0, 80) || 'No description available'}...
                                    </p>
                                    <div className="hp-job-tags">
                                        {(job.skills || []).slice(0, 3).map((skill, index) => (
                                            <span key={index} className="hp-job-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="hp-job-card-footer">
                                    <span className="hp-job-salary">{formatSalary(job.salary)}</span>
                                    <button
                                        className="hp-apply-button"
                                        onClick={(e) => handleQuickApplyClick(job, e)}
                                    >
                                        Quick Apply
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ----------------------- Quick Apply Modal --------------------- */}
            {showQuickApplyModal && selectedJob && (
                <div className="hp-modal-overlay">
                    <div className="hp-modal-content" ref={modalRef}>
                        <h2>Apply for {truncateTitle(selectedJob.title, 30)}</h2>
                        <p>
                            Please select a resume to send to{" "}
                            {selectedJob.contactEmail || "the job poster"}:
                        </p>

                        <div className="hp-resume-option">
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
                            <div className="hp-upload-preview-container">
                                {profileResume ? (
                                    <div className="hp-resume-preview">
                                        <a href={profileResume} target="_blank" rel="noopener noreferrer">
                                            View Resume
                                        </a>
                                        <embed
                                            src={profileResume}
                                            type="application/pdf"
                                            width="100%"
                                            height="150px"
                                            style={{ marginTop: "8px" }}
                                        />
                                    </div>
                                ) : (
                                    <p>No resume available in profile.</p>
                                )}
                                <div className="hp-resume-upload-container">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleResumeChange}
                                        className="hp-resume-upload"
                                    />
                                    <button
                                        className={`hp-modal-button ${isUploadingResume ? "hp-loading-btn" : ""}`}
                                        onClick={handleResumeUpload}
                                        disabled={isUploadingResume || !newResume}
                                        style={{ marginTop: "8px" }}
                                    >
                                        {isUploadingResume ? (
                                            <>
                                                <span className="hp-loader"></span> Uploading...
                                            </>
                                        ) : (
                                            "Upload Resume"
                                        )}
                                    </button>
                                    {resumeError && <p className="hp-error-text">{resumeError}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="hp-resume-option">
                            <label>
                                <input
                                    type="radio"
                                    name="videoResume"
                                    checked={!newVideoResume && profileVideoResume}
                                    onChange={() => setNewVideoResume(null)}
                                    disabled={!profileVideoResume}
                                />
                                Use Profile Video Resume
                            </label>
                            <div className="hp-upload-preview-container">
                                {profileVideoResume ? (
                                    <div className="hp-video-resume-preview">
                                        <video
                                            controls
                                            src={profileVideoResume}
                                            style={{ maxWidth: "100%", height: "120px", marginTop: "8px" }}
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                ) : (
                                    <p>No video resume available in profile.</p>
                                )}
                                <div className="hp-video-upload-container">
                                    <input
                                        type="file"
                                        accept="video/mp4,video/webm"
                                        onChange={handleVideoResumeChange}
                                        className="hp-video-upload"
                                    />
                                    <button
                                        className={`hp-modal-button ${isUploadingVideo ? "hp-loading-btn" : ""}`}
                                        onClick={handleVideoResumeUpload}
                                        disabled={isUploadingVideo || !newVideoResume}
                                        style={{ marginTop: "8px" }}
                                    >
                                        {isUploadingVideo ? (
                                            <>
                                                <span className="hp-loader"></span> Uploading...
                                            </>
                                        ) : (
                                            "Upload Video Resume"
                                        )}
                                    </button>
                                    {videoError && <p className="hp-error-text">{videoError}</p>}
                                </div>
                            </div>
                        </div>

                        {emailStatus && (
                            <p className={emailStatus.includes("Error") ? "hp-error-text" : "hp-success-text"}>
                                {emailStatus}
                            </p>
                        )}

                        <div className="hp-modal-buttons">
                            <button className="hp-modal-button" onClick={sendResumeEmail}>
                                Send Application
                            </button>
                            <button
                                className="hp-modal-button hp-btn-cancel"
                                onClick={() => setShowQuickApplyModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ----------------------- Why Us Section --------------------- */}
            <div className="why-us-section">
                <h2 className="why-us-title">Why Choose Us?</h2>
                <p className="why-us-subtitle">
                    Elevate your job search with our innovative features!
                </p>
                <div className="why-us-container">
                    <div className="why-us-card">
                        <div className="icon-wrapper">
                            <i className="fa-solid fa-robot feature-icon"></i>
                        </div>
                        <h3>Auto Job Application</h3>
                        <p>Streamline your applications and boost your chances effortlessly.</p>
                    </div>
                    <div className="why-us-card">
                        <div className="icon-wrapper">
                            <i className="fa-solid fa-video feature-icon"></i>
                        </div>
                        <h3>Video Resume</h3>
                        <p>Stand out with a compelling video resume.</p>
                    </div>
                    <div className="why-us-card">
                        <div className="icon-wrapper">
                            <i className="fa-solid fa-bolt feature-icon"></i>
                        </div>
                        <h3>Quick Apply</h3>
                        <p>Apply instantly and get hired faster!</p>
                    </div>
                </div>
            </div>

            {/* ----------------------- Subscription Section --------------------- */}
            <div className="subscription-section">
                <h2 className="subscription-title">Stay in the Loop!</h2>
                <p className="subscription-subtitle">
                    Subscribe for the latest job opportunities and career insights.
                </p>
                <div className="subscription-form">
                    <input type="email" placeholder="Enter your email" className="subscription-input" required />
                    <button type="submit" className="subscription-button">Subscribe</button>
                </div>
            </div>

            {/* ----------------------- Footer Section --------------------- */}
            <footer className="site-footer">
                <div className="footer-wrapper">
                    <div className="footer-block">
                        <h3 className="footer-heading">About Us</h3>
                        <p className="footer-text">Your trusted platform for job opportunities.</p>
                    </div>
                    <div className="footer-block">
                        <h3 className="footer-heading">Quick Links</h3>
                        <ul className="footer-links">
                            <li><a href="#">Home</a></li>
                            <li><a href="#">Jobs</a></li>
                            <li><a href="#">Companies</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    </div>
                    <div className="footer-block">
                        <h3 className="footer-heading">Contact Us</h3>
                        <p className="footer-text">Email: support@jobportal.com</p>
                        <p className="footer-text">Phone: +1 234 567 890</p>
                        <p className="footer-text">Address: 123 Job Street, City</p>
                    </div>
                </div>
                <div className="footer-socials">
                    <a href="#"><i className="fab fa-facebook-f"></i></a>
                    <a href="#"><i className="fab fa-twitter"></i></a>
                    <a href="#"><i className="fab fa-instagram"></i></a>
                    <a href="#"><i className="fab fa-linkedin-in"></i></a>
                </div>
                <div className="footer-bottom">
                    © 2025 JobDekho. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
}

export default HomePage;