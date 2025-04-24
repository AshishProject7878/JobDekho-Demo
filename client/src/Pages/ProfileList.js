import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import '../styles/ProfileList.css';

const ProfileList = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalProfiles: 0 });
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availablePositions, setAvailablePositions] = useState([]);

  const fetchProfiles = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        search,
        skills: selectedSkills.join(','),
        position: selectedPosition,
        page,
        limit: 6,
      };
      const response = await axios.get('http://localhost:5000/api/profile/all', {
        params,
        withCredentials: true,
      });
      console.log('API Response:', response.data); // Debug log
      setProfiles(response.data.profiles || []);
      setPagination(response.data.pagination || { currentPage: 1, totalPages: 1, totalProfiles: 0 });

      // Extract unique skills and positions
      const skillsSet = new Set();
      const positionsSet = new Set();
      (response.data.profiles || []).forEach((profile) => {
        (profile.professional?.skills || []).forEach((skill) => {
          if (skill) skillsSet.add(skill);
        });
        if (profile.professional?.jobTitle) positionsSet.add(profile.professional.jobTitle);
      });

      const newSkills = [...skillsSet].map((skill) => ({ value: skill, label: skill }));
      setAvailableSkills(newSkills);
      setAvailablePositions([...positionsSet]);
      console.log('Available Skills:', newSkills); // Debug log
      setLoading(false);
    } catch (err) {
      console.error('Fetch Profiles Error:', err); // Debug log
      setError(err.response?.data?.message || 'Error fetching profiles');
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchProfiles();
  }, []); // Empty dependency array to run only on mount

  // Fetch profiles when filters change (skills or position)
  useEffect(() => {
    fetchProfiles();
  }, [selectedSkills, selectedPosition]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    fetchProfiles(1);
  };

  const handleSkillChange = (selectedOptions) => {
    const skills = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    setSelectedSkills(skills);
    setCurrentPage(1);
  };

  const handlePositionChange = (e) => {
    setSelectedPosition(e.target.value);
    setCurrentPage(1);
  };

  const handleRemoveSkill = (skill) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
    setCurrentPage(1);
  };

  const handleRemovePosition = () => {
    setSelectedPosition('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
      fetchProfiles(page);
    }
  };

  if (loading) {
    return (
      <div className="profileList-loading-container">
        <div className="profileList-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profileList-error-container">
        <p className="profileList-error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="profileList-container">
      <h1 className="profileList-title">Registered User Profiles</h1>

      {/* Search and Filter Section */}
      <div className="profileList-filter-section">
        <div className="profileList-filter-group">
          <label className="profileList-filter-label">Search Profiles</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search profiles (e.g., Web, Developer)"
              value={search}
              onChange={handleSearchChange}
              className="profileList-search-input"
            />
            <button
              onClick={handleSearchSubmit}
              className="profileList-search-button"
            >
              Search
            </button>
          </div>
        </div>
        <div className="profileList-filter-group">
          <label className="profileList-filter-label">Skills</label>
          {availableSkills.length > 0 ? (
            <Select
              isMulti
              options={availableSkills}
              value={availableSkills.filter((option) => selectedSkills.includes(option.value))}
              onChange={handleSkillChange}
              className="profileList-filter-select"
              classNamePrefix="profileList-select"
              placeholder="Select skills..."
            />
          ) : (
            <p className="profileList-no-skills">No skills available</p>
          )}
        </div>
        <div className="profileList-filter-group">
          <label className="profileList-filter-label">Position</label>
          <select
            value={selectedPosition}
            onChange={handlePositionChange}
            className="profileList-filter-select-native"
          >
            <option value="">All Positions</option>
            {availablePositions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>
        {/* Selected Filters Tags */}
        {(selectedSkills.length > 0 || selectedPosition) && (
          <div className="profileList-selected-tags">
            {selectedSkills.map((skill) => (
              <span key={skill} className="profileList-tag">
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="profileList-tag-remove"
                >
                  <svg
                    className="profileList-tag-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </span>
            ))}
            {selectedPosition && (
              <span className="profileList-tag">
                {selectedPosition}
                <button
                  onClick={handleRemovePosition}
                  className="profileList-tag-remove"
                >
                  <svg
                    className="profileList-tag-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Profile Grid */}
      <div className="profileList-profile-grid">
        {profiles.length === 0 ? (
          <p className="profileList-no-results">No profiles match your search criteria.</p>
        ) : (
          profiles.map((profile) => (
            <div key={profile._id} className="profileList-profile-card">
              <div className="profileList-profile-header">
                <img
                  src={profile.personal.profilePicture}
                  alt={profile.personal.fullName}
                  className="profileList-profile-picture"
                  onError={(e) => {
                    e.target.src =
                      'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                  }}
                />
                <div>
                  <h2 className="profileList-profile-name">
                    {profile.personal.fullName || 'Anonymous'}
                  </h2>
                  <p className="profileList-profile-email">
                    {profile.user?.email || 'No email provided'}
                  </p>
                </div>
              </div>
              <div className="profileList-profile-section">
                <h3 className="profileList-section-title">Professional Details</h3>
                <p className="profileList-section-content">
                  {profile.professional.jobTitle
                    ? `${profile.professional.jobTitle} at ${profile.professional.company || 'N/A'}`
                    : 'No professional details provided'}
                </p>
                {profile.professional.skills.length > 0 && (
                  <div className="profileList-skills-section">
                    <p className="profileList-skills-label">Skills:</p>
                    <div className="profileList-skills-list">
                      {profile.professional.skills.map((skill, index) => (
                        <span key={index} className="profileList-skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {profile.educationHistory.length > 0 && (
                <div className="profileList-profile-section">
                  <h3 className="profileList-section-title">Education</h3>
                  {profile.educationHistory.map((edu, index) => (
                    <p key={index} className="profileList-section-content">
                      {edu.degree} in {edu.field || 'N/A'}, {edu.institution} (
                      {edu.graduationYear || 'N/A'})
                    </p>
                  ))}
                </div>
              )}
              {profile.jobHistory.length > 0 && (
                <div className="profileList-profile-section">
                  <h3 className="profileList-section-title">Work Experience</h3>
                  {profile.jobHistory.map((job, index) => (
                    <p key={index} className="profileList-section-content">
                      {job.position} at {job.company} ({job.startDate} - {job.endDate || 'Present'})
                    </p>
                  ))}
                </div>
              )}
              <div className="profileList-profile-actions">
                <Link
                  to={`/profiles/${profile._id}`}
                  className="profileList-view-profile-button"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {profiles.length > 0 && (
        <div className="profileList-pagination">
          <button
            className="profileList-pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {[...Array(pagination.totalPages).keys()].map((_, index) => (
            <button
              key={index + 1}
              className={`profileList-pagination-button ${
                currentPage === index + 1 ? 'profileList-pagination-button-active' : ''
              }`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="profileList-pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
          >
            Next
          </button>
          <p className="profileList-pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages} | Total Profiles:{' '}
            {pagination.totalProfiles}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileList;