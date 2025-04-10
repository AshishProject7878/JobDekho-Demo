import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Link } from 'react-router-dom'; // For Edit button
import '../styles/CompProfile.css'; // We'll adapt JobDetail.css

function CompProfile() {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionOrder, setSectionOrder] = useState([
    'Personal Information',
    'Job History',
    'Education History',
    'Professional Details',
    'Job Preferences',
  ]);

  const API_URL = 'http://localhost:5000/api/profile';

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(API_URL, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('API Response:', response.data); // Debug
        setProfileData(response.data);
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        setError(error.response?.data?.message || 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

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
                  <h3>{item.position || 'Position not specified'} at {item.company || 'Company not specified'}</h3>
                  <p>
                    {item.startDate ? format(new Date(item.startDate), 'MMM yyyy') : 'Not provided'} -{' '}
                    {item.endDate ? format(new Date(item.endDate), 'MMM yyyy') : 'Present'}
                  </p>
                  <p>{item.description || 'No description'}</p>
                </>
              ) : (
                <>
                  <h3>{item.degree || 'Degree not specified'} - {item.field || 'Field not specified'}</h3>
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
        <p><strong>Date of Birth:</strong> {profileData.personal.dob ? format(new Date(profileData.personal.dob), 'MMMM dd, yyyy') : 'Not provided'}</p>
        <p><strong>Gender:</strong> {profileData.personal.gender || 'Not provided'}</p>
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
        <p><strong>Job Title:</strong> {profileData.professional.jobTitle || 'Not provided'}</p>
        <p><strong>Company:</strong> {profileData.professional.company || 'Not provided'}</p>
        <p><strong>Experience:</strong> {profileData.professional.experience || '0'} years</p>
      </>
    ),
    'Job Preferences': (
      <>
        <h2>Job Preferences</h2>
        <p><strong>Preferred Roles:</strong> {profileData.jobPrefs.roles?.join(', ') || 'Not specified'}</p>
        <p><strong>Preferred Locations:</strong> {profileData.jobPrefs.locations?.join(', ') || 'Not specified'}</p>
        <p><strong>Expected Salary:</strong> {profileData.jobPrefs.salary || 'Not specified'}</p>
        <p><strong>Employment Type:</strong> {profileData.jobPrefs.employmentType?.join(', ') || 'Not specified'}</p>
      </>
    ),
  };

  return (
    <div className="Compprofile-container">
      <div className="profile-holder">
        <div className="profile-dets">
          <h3 className="profile-title">{profileData.personal.fullName || 'Your Profile'}</h3>
          <p className="profile-email">{profileData.personal.email || 'Email not provided'}</p>
        </div>
        <div className="edit-profile">
          <Link to="/edit-profile" className="profile-btn">Edit Profile</Link>
          <button className="profile-btn btn-share">Share</button>
        </div>
      </div>

      <div className="section2">
        <div className="section-buttons" style={{ marginBottom: '20px' }}>
          {['Personal Information', 'Job History', 'Education History', 'Professional Details', 'Job Preferences'].map((tab) => {
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
                {profileData.professional.skills && profileData.professional.skills.length > 0 ? (
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