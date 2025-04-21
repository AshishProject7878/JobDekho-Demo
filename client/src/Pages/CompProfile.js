import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import '../styles/CompProfile.css';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function CompProfile() {
  const [profileData, setProfileData] = useState(null);
  const [user, setUser] = useState({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumeFile, setResumeFile] = useState(null); 
  const [videoFile, setVideoFile] = useState(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(null); // 'resume' or 'video'
  const [showErrorPopup, setShowErrorPopup] = useState(null); // 'resume' or 'video'
  const [errorMessage, setErrorMessage] = useState('');
  const [sectionOrder, setSectionOrder] = useState([
    'Personal Information',
    'Job History',
    'Education History',
    'Professional Details',
    'Job Preferences',
  ]);
  const navigate = useNavigate();

  const API_URL = `${BASE_URL}/api/profile`;
  const tabs = [
    'Personal Information',
    'Job History',
    'Education History',
    'Professional Details',
    'Job Preferences',
  ];

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('API Response:', response.data);
      setProfileData(response.data);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      setError(error.response?.data?.message || 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
    } else {
      setUser(userData);
      fetchProfileData();
    }
  }, [API_URL, navigate]);

  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  useEffect(() => {
    if (showErrorPopup) {
      const timer = setTimeout(() => {
        setShowErrorPopup(null);
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showErrorPopup]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleTabClick = (tab) => {
    setSectionOrder((prevOrder) => {
      const newOrder = [...prevOrder];
      const index = newOrder.indexOf(tab);
      if (index > 0) {
        newOrder.splice(index, 1);
        newOrder.unshift(tab);
      }
      return newOrder;
    });
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrorMessage('Please upload a valid PDF file');
        setShowErrorPopup('resume');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setErrorMessage('File size must be less than 10MB');
        setShowErrorPopup('resume');
        return;
      }
      setResumeFile(file);
      setErrorMessage('');
      setShowErrorPopup(null);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['video/mp4', 'video/webm'].includes(file.type)) {
        setErrorMessage('Please upload a valid MP4 or WebM video');
        setShowErrorPopup('video');
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setErrorMessage('Video size must be less than 50MB');
        setShowErrorPopup('video');
        return;
      }
      setVideoFile(file);
      setErrorMessage('');
      setShowErrorPopup(null);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setErrorMessage('Please select a file to upload');
      setShowErrorPopup('resume');
      return;
    }

    setIsUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const response = await axios.post(`${BASE_URL}/api/upload/resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      console.log('Resume Upload Response:', response.data);
      setShowSuccessPopup('resume');
      setResumeFile(null);
      await fetchProfileData();
    } catch (error) {
      console.error('Error uploading resume:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to upload resume');
      setShowErrorPopup('resume');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile) {
      setErrorMessage('Please select a video file to upload');
      setShowErrorPopup('video');
      return;
    }

    setIsUploadingVideo(true);
    const formData = new FormData();
    formData.append('videoResume', videoFile);

    try {
      const response = await axios.post(`${BASE_URL}/api/upload/video-resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      console.log('Video Resume Upload Response:', response.data);
      setShowSuccessPopup('video');
      setVideoFile(null);
      await fetchProfileData();
    } catch (error) {
      console.error('Error uploading video resume:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to upload video resume');
      setShowErrorPopup('video');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const renderTimeline = (items, type) => {
    if (!items || items.length === 0) return <p>Not provided</p>;

    return (
      <div className="timeline1">
        {items.map((item, index) => (
          <div key={index} className="timeline-item">
            <div className="content">
              {type === 'job' ? (
                <>
                  <h3>
                    {item.position || 'Position not specified'} at{' '}
                    {item.company || 'Company not specified'}
                  </h3>
                  <p>
                    {item.startDate
                      ? format(new Date(item.startDate), 'MMM yyyy')
                      : 'Not provided'}{' '}
                    -{' '}
                    {item.endDate
                      ? format(new Date(item.endDate), 'MMM yyyy')
                      : 'Present'}
                  </p>
                  <p>{item.description || 'No description'}</p>
                </>
              ) : (
                <>
                  <h3>
                    {item.degree || 'Degree not specified'} -{' '}
                    {item.field || 'Field not specified'}
                  </h3>
                  <p>
                    <strong>Institution:</strong> {item.institution || 'Not provided'}
                  </p>
                  <p>
                    <strong>Year:</strong> {item.graduationYear || 'Not provided'}
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) return <div className="Compprofile-container"><p>Loading your profile...</p></div>;
  if (error) return <div className="Compprofile-container"><p>{error}</p></div>;
  if (!profileData) return <div className="Compprofile-container"><p>No profile data available.</p></div>;

  const sections = {
    'Personal Information': (
      <>
        <h2>Personal Information</h2>
        <p>
          <strong>Date of Birth:</strong>{' '}
          {profileData.personal?.dob
            ? format(new Date(profileData.personal.dob), 'MMMM dd, yyyy')
            : 'Not provided'}
        </p>
        <p>
          <strong>Gender:</strong> {profileData.personal?.gender || 'Not provided'}
        </p>
        {/* Resume Preview (from JobDetail.js) */}
        <div className="resume-option">
          <h3>Resume</h3>
          {profileData.personal?.resumeUrl ? (
            <div className="resume-preview">
              <a href={profileData.personal.resumeUrl} target="_blank" rel="noopener noreferrer">
                View Resume
              </a>
              <embed
                src={profileData.personal.resumeUrl}
                type="application/pdf"
                width="100%"
                height="200px"
                style={{ marginTop: '10px' }}
              />
            </div>
          ) : (
            <p>No resume available.</p>
          )}
          <div className="upload-resume">
            <input
              type="file"
              accept=".pdf"
              onChange={handleResumeChange}
              className="resume-upload-input"
              key={resumeFile ? resumeFile.name : 'resume-input'}
            />
            <button
              className={`profile-btn ${isUploadingResume ? 'loading-btn' : ''}`}
              onClick={handleResumeUpload}
              disabled={isUploadingResume || !resumeFile}
            >
              {isUploadingResume ? (
                <>
                  <span className="loader"></span> Uploading...
                </>
              ) : profileData.personal?.resumeUrl ? (
                'Change Resume'
              ) : (
                'Upload Resume'
              )}
            </button>
          </div>
        </div>
        {/* Video Resume Preview (from JobDetail.js) */}
        <div className="resume-option">
          <h3>Video Resume</h3>
          {profileData.personal?.videoResumeUrl ? (
            <div className="video-resume-preview">
              <video
                controls
                src={profileData.personal.videoResumeUrl}
                style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <p>No video resume available.</p>
          )}
          <div className="upload-video-resume">
            <input
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleVideoChange}
              className="video-upload-input"
              key={videoFile ? videoFile.name : 'video-input'}
            />
            <button
              className={`profile-btn ${isUploadingVideo ? 'loading-btn' : ''}`}
              onClick={handleVideoUpload}
              disabled={isUploadingVideo || !videoFile}
            >
              {isUploadingVideo ? (
                <>
                  <span className="loader"></span> Uploading...
                </>
              ) : profileData.personal?.videoResumeUrl ? (
                'Change Video Resume'
              ) : (
                'Upload Video Resume'
              )}
            </button>
          </div>
        </div>
      </>
    ),
    'Job History': (
      <>
        <h2>Job History</h2>
        {profileData.isFresher ? (
          <p className="fresher">Fresher - No job history provided</p>
        ) : (
          renderTimeline(profileData.jobHistory, 'job')
        )}
      </>
    ),
    'Education History': (
      <>
        <h2>Education History</h2>
        {renderTimeline(profileData.educationHistory, 'education')}
      </>
    ),
    'Professional Details': (
      <>
        <h2>Professional Details</h2>
        <p>
          <strong>Job Title:</strong> {profileData.professional?.jobTitle || 'Not provided'}
        </p>
        <p>
          <strong>Company:</strong> {profileData.professional?.company || 'Not provided'}
        </p>
        <p>
          <strong>Experience:</strong> {profileData.professional?.experience || '0'} years
        </p>
      </>
    ),
    'Job Preferences': (
      <>
        <h2>Job Preferences</h2>
        <p>
          <strong>Preferred Roles:</strong>{' '}
          {profileData.jobPrefs?.roles?.length > 0
            ? profileData.jobPrefs.roles.join(', ')
            : 'Not specified'}
        </p>
        <p>
          <strong>Preferred Locations:</strong>{' '}
          {profileData.jobPrefs?.locations?.length > 0
            ? profileData.jobPrefs.locations.join(', ')
            : 'Not specified'}
        </p>
        <p>
          <strong>Expected Salary:</strong> {profileData.jobPrefs?.salary || 'Not specified'}
        </p>
        <p>
          <strong>Employment Type:</strong>{' '}
          {profileData.jobPrefs?.employmentType?.length > 0
            ? profileData.jobPrefs.employmentType.join(', ')
            : 'Not specified'}
        </p>
      </>
    ),
  };

  return (
    <div className="Compprofile-container">
      {/* Success Pop-up */}
      {showSuccessPopup && (
        <div className="success-popup" onClick={() => setShowSuccessPopup(null)}>
          <div className="success-popup-content" onClick={(e) => e.stopPropagation()}>
            <i className="fa-solid fa-check checkmark-icon"></i>
            <h2>
              {showSuccessPopup === 'resume'
                ? 'Resume Uploaded Successfully!'
                : 'Video Resume Uploaded Successfully!'}
            </h2>
            <button
              className="profile-btn popup-btn"
              onClick={() => setShowSuccessPopup(null)}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {/* Error Pop-up */}
      {showErrorPopup && (
        <div className="success-popup" onClick={() => setShowErrorPopup(null)}>
          <div className="success-popup-content error-popup-content" onClick={(e) => e.stopPropagation()}>
            <i className="fa-solid fa-exclamation-circle error-icon"></i>
            <h2>{errorMessage}</h2>
            <button
              className="profile-btn popup-btn"
              onClick={() => setShowErrorPopup(null)}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      <div className="profile-holder">
        <div className="profile-dets">
          <img
            src={
              profileData.personal?.profilePicture ||
              'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
            }
            alt="Profile"
            className="profile-pic"
            onError={(e) => {
              console.error('Profile picture failed to load:', profileData.personal?.profilePicture);
              e.target.src =
                'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
            }}
          />
          <div className="profile-text">
            <h3 className="profile-title">{user.name || 'Your Profile'}</h3>
            <p className="profile-email">{user.email || 'Email not provided'}</p>
          </div>
        </div>
        <div className="edit-profile">
          <Link to="/profileForm" className="profile-btn">
            Edit Profile
          </Link>
          <Link to="/auto-job/applications" className='profile-btn'>Auto Applied Applications</Link>
          {/* <button className="profile-btn btn-share">Share</button> */}
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="Profile-section2">
        <div className="section-buttons" style={{ marginBottom: '20px' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={sectionOrder[0] === tab ? 'profile-btn active-tab' : 'profile-btn inactive-tab'}
            >
              {tab}
            </button>
          ))}
        </div>

        <hr style={{ marginBottom: '25px' }} />

        <div className="about-me">
          <div className="about-holder">
            {sectionOrder.map((tab) => (
              <div key={tab} className="section-block" style={{ marginBottom: '30px' }}>
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
                <span style={{ marginLeft: '20px' }}>Experience</span>
              </p>
              <p className="dets">{profileData.professional?.experience || '0'} years</p>

              <p className="short-dets">
                <i className="fa-solid fa-graduation-cap"></i>
                <span style={{ marginLeft: '20px' }}>Highest Education</span>
              </p>
              <p className="dets grad">
                {profileData.educationHistory?.length > 0
                  ? profileData.educationHistory[0]?.degree || 'Not specified'
                  : 'Not specified'}
              </p>

              <p className="short-dets">
                <i className="fa-solid fa-envelope"></i>
                <span style={{ marginLeft: '20px' }}>Email</span>
              </p>
              <p className="dets lang">{user.email || 'Not specified'}</p>

              <button className="profile-btn SM" style={{ marginTop: '20px' }}>
                Send Message
              </button>
            </div>

            <div className="overview">
              <h3 className="title">Skills</h3>
              <hr />
              <div className="skills-list">
                {profileData.professional?.skills?.length > 0 ? (
                  profileData.professional.skills.map((skill, index) => (
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

export default CompProfile;