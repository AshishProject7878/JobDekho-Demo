import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import '../styles/CompProfile.css';

function CompProfile() {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumeError, setResumeError] = useState(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeStatus, setResumeStatus] = useState({ accessible: false, checked: false });
  const [sectionOrder, setSectionOrder] = useState([
    'Personal Information',
    'Job History',
    'Education History',
    'Professional Details',
    'Job Preferences',
  ]);

  const BASE_URL = 'http://localhost:5000';
  const API_URL = `${BASE_URL}/api/profile`;
  const RESUME_UPLOAD_URL = `${BASE_URL}/api/upload/resume`;

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Fetched Profile Data:', response.data);
      console.log('Profile Picture:', response.data.personal?.profilePicture);
      console.log('Resume:', response.data.personal?.resume);
      setProfileData(response.data);
      setError(null);
      checkResumeAccessibility(response.data.personal?.resume);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      setError(error.response?.data?.message || 'Failed to load profile data');
      setProfileData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const checkResumeAccessibility = async (url) => {
    if (!url || !url.match(/\.pdf$/i)) {
      setResumeStatus({ accessible: false, checked: true });
      return;
    }
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const isAccessible = response.ok && response.headers.get('content-type') === 'application/pdf';
      setResumeStatus({ accessible: isAccessible, checked: true });
      if (!isAccessible) {
        console.warn('Resume URL is inaccessible:', { url, status: response.status });
        setResumeError(`Resume is not accessible (Status: ${response.status}). Please re-upload.`);
      } else {
        setResumeError(null);
      }
    } catch (error) {
      console.error('Error checking resume accessibility:', error.message);
      setResumeStatus({ accessible: false, checked: true });
      setResumeError('Unable to verify resume accessibility. Please try re-uploading.');
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [API_URL]);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setResumeError('Only PDF files are allowed');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setResumeError('File size must be less than 10MB');
      return;
    }

    setResumeError(null);
    setIsUploadingResume(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const uploadResponse = await axios.post(RESUME_UPLOAD_URL, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const resumeUrl = uploadResponse.data.url;
      console.log('Uploaded Resume URL:', resumeUrl);

      const updateResponse = await axios.put(
        API_URL,
        { personal: { resume: resumeUrl } },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      console.log('Profile Update Response:', updateResponse.data);

      setProfileData(updateResponse.data.data);
      setResumeStatus({ accessible: false, checked: false });
      await checkResumeAccessibility(resumeUrl);
      alert('Resume uploaded successfully!');
    } catch (error) {
      console.error('Resume upload failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMsg = error.response?.data?.message || 'Failed to upload resume';
      setResumeError(`${errorMsg}. ${errorMsg.includes('inaccessible') ? 'Please try again or check Cloudinary settings.' : ''}`);
      await fetchProfileData();
    } finally {
      setIsUploadingResume(false);
    }
  };

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

  const renderTimeline = (items, type) => {
    if (!items || items.length === 0) return <p>Not provided</p>;

    return (
      <div className="timeline">
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
                  <p><strong>Institution:</strong> {item.institution || 'Not provided'}</p>
                  <p><strong>Year:</strong> {item.graduationYear || 'Not provided'}</p>
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
          {profileData.personal.dob
            ? format(new Date(profileData.personal.dob), 'MMMM dd, yyyy')
            : 'Not provided'}
        </p>
        <p>
          <strong>Gender:</strong> {profileData.personal.gender || 'Not provided'}
        </p>
        <p>
          <strong>Resume:</strong>{' '}
          {profileData.personal.resume && resumeStatus.checked ? (
            resumeStatus.accessible ? (
              <a
                href={profileData.personal.resume}
                target="_blank"
                rel="noopener noreferrer"
                download={`${profileData.personal.fullName || 'resume'}.pdf`}
                className="resume-download-btn"
                onClick={() => console.log('Opening and downloading resume:', profileData.personal.resume)}
              >
                Download Resume
              </a>
            ) : (
              <span className="error-text">Resume unavailable (please re-upload)</span>
            )
          ) : profileData.personal.resume ? (
            <span>Checking resume accessibility...</span>
          ) : (
            'Not uploaded'
          )}
        </p>
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
          <strong>Job Title:</strong> {profileData.professional.jobTitle || 'Not provided'}
        </p>
        <p>
          <strong>Company:</strong> {profileData.professional.company || 'Not provided'}
        </p>
        <p>
          <strong>Experience:</strong> {profileData.professional.experience || '0'} years
        </p>
      </>
    ),
    'Job Preferences': (
      <>
        <h2>Job Preferences</h2>
        <p>
          <strong>Preferred Roles:</strong>{' '}
          {profileData.jobPrefs.roles?.join(', ') || 'Not specified'}
        </p>
        <p>
          <strong>Preferred Locations:</strong>{' '}
          {profileData.jobPrefs.locations?.join(', ') || 'Not specified'}
        </p>
        <p>
          <strong>Expected Salary:</strong> {profileData.jobPrefs.salary || 'Not specified'}
        </p>
        <p>
          <strong>Employment Type:</strong>{' '}
          {profileData.jobPrefs.employmentType?.join(', ') || 'Not specified'}
        </p>
      </>
    ),
  };

  return (
    <div className="Compprofile-container">
      <div className="profile-holder">
        <div className="profile-dets">
          <img
            src={
              profileData.personal.profilePicture
                ? profileData.personal.profilePicture.startsWith('http')
                  ? profileData.personal.profilePicture
                  : `${BASE_URL}${profileData.personal.profilePicture}`
                : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
            }
            alt="Profile"
            className="profile-pic"
            onError={(e) =>
              (e.target.src =
                'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y')
            }
          />
          <div className="profile-text">
            <h3 className="profile-title">
              {profileData.personal.fullName || 'Your Profile'}
            </h3>
            <p className="profile-email">
              {profileData.personal.email || 'Email not provided'}
            </p>
          </div>
        </div>
        <div className="edit-profile">
          <Link to="/edit-profile" className="profile-btn">
            Edit Profile
          </Link>
          <label className="profile-btn" style={{ position: 'relative' }}>
            {isUploadingResume
              ? 'Uploading...'
              : profileData.personal.resume
              ? 'Change Resume'
              : 'Upload Resume'}
            <input
              type="file"
              accept="application/pdf"
              onChange={handleResumeUpload}
              disabled={isUploadingResume}
              style={{ display: 'none' }}
            />
          </label>
          <button className="profile-btn btn-share">Share</button>
        </div>
        {resumeError && <p className="error-message" style={{ color: 'red' }}>{resumeError}</p>}
      </div>

      <div className="section2">
        <div className="section-buttons" style={{ marginBottom: '20px' }}>
          {[
            'Personal Information',
            'Job History',
            'Education History',
            'Professional Details',
            'Job Preferences',
          ].map((tab) => {
            const isActive = tab === sectionOrder[0];
            return (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={isActive ? 'profile-btn active-tab' : 'profile-btn inactive-tab'}
              >
                {tab}
              </button>
            );
          })}
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
              <p className="dets">{profileData.professional.experience || '0'} years</p>

              <p className="short-dets">
                <i className="fa-solid fa-graduation-cap"></i>
                <span style={{ marginLeft: '20px' }}>Highest Education</span>
              </p>
              <p className="dets grad">
                {profileData.educationHistory?.length > 0
                  ? profileData.educationHistory[0].degree || 'Not specified'
                  : 'Not specified'}
              </p>

              <p className="short-dets">
                <i className="fa-solid fa-envelope"></i>
                <span style={{ marginLeft: '20px' }}>Email</span>
              </p>
              <p className="dets lang">{profileData.personal.email || 'Not specified'}</p>

              <button className="profile-btn SM" style={{ marginTop: '20px' }}>
                Send Message
              </button>
            </div>

            <div className="overview">
              <h3 className="title">Skills</h3>
              <hr />
              <div className="skills-list">
                {profileData.professional.skills &&
                profileData.professional.skills.length > 0 ? (
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