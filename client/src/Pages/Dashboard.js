import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/Dashboard.css';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [user, setUser] = useState({ name: '', email: '' });
  const [autoAppliedJobs, setAutoAppliedJobs] = useState([]);
  const [manualAppliedJobs, setManualAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const profileResponse = await axios.get(`${BASE_URL}/api/profile`, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Profile API response:', profileResponse.data);
      setUser((prev) => ({
        ...prev,
        name: profileResponse.data.personal?.fullName || profileResponse.data.user?.name || prev.name,
        email: profileResponse.data.personal?.email || profileResponse.data.user?.email || prev.email,
      }));
      const autoJobs = profileResponse.data.autoJobApplications || [];
      const manualJobs = profileResponse.data.manualApplications || [];
      console.log('Setting autoAppliedJobs:', autoJobs);
      console.log('Setting manualAppliedJobs:', manualJobs);
      setAutoAppliedJobs(autoJobs);
      setManualAppliedJobs(manualJobs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        console.log('Unauthorized, redirecting to login');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Error fetching dashboard data');
        toast.error(error.response?.data?.message || 'Error fetching dashboard data');
      }
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    console.log('Dashboard useEffect running');
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      console.log('No user data, redirecting to login');
      navigate('/login');
      return;
    }
    setUser(userData);
    fetchDashboardData();
  }, [fetchDashboardData, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  console.log('Rendering Dashboard with autoAppliedJobs:', autoAppliedJobs);
  console.log('Rendering Dashboard with manualAppliedJobs:', manualAppliedJobs);
  const validAutoJobs = autoAppliedJobs.filter(app => app.jobId);
  const validManualJobs = manualAppliedJobs.filter(app => app.jobId);
  console.log('Valid auto jobs for rendering:', validAutoJobs);
  console.log('Valid manual jobs for rendering:', validManualJobs);

  const renderJobCard = (application, index) => (
    <div key={application._id} className="dashboard-job-card" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="dashboard-top-section">
        <span>{application.status || 'Pending'}</span>
      </div>
      <div className="dashboard-mid-section">
        <div className="dashboard-comp-img">
          <img
            src={application.jobId?.company?.logo || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
            alt={application.jobId?.company?.name || 'Company'}
          />
          <div className="dashboard-comp-dets">
            <h3 className="dashboard-job-title">{application.jobId?.title || 'Untitled Job'}</h3>
            <p className="dashboard-company-name">{application.jobId?.company?.name || 'Unknown Company'}</p>
            <p className="dashboard-location">
              <i className="fas fa-map-marker-alt"></i> {application.jobId?.location || 'Not specified'}
            </p>
          </div>
        </div>
        {application.jobId?.skills && (
          <div className="dashboard-skills">
            {application.jobId.skills.map((skill, idx) => (
              <span key={idx} className="dashboard-skill-tag">{skill}</span>
            ))}
          </div>
        )}
      </div>
      <div className="dashboard-bottom-section">
        <span className="dashboard-status">Status: {application.status || 'Pending'}</span>
        <span className="dashboard-applied-at">
          Applied: {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Unknown'}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-container">
        <h1>Dashboard</h1>
        <button className="dashboard-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-user-info">
        <h2>User Information</h2>
        <p>
          <strong>Name:</strong> {user.name || 'Not provided'}
        </p>
        <p>
          <strong>Email:</strong> {user.email || 'Not provided'}
        </p>
        <div className="dashboard-nav-buttons">
          <Link to="/profileComp" className="dashboard-nav-btn">
            Edit Profile
          </Link>
          <Link to="/auto-job-prefs" className="dashboard-nav-btn">
            Job Preferences
          </Link>
          <Link to="/auto-applied-jobs" className="dashboard-nav-btn">
            View All Auto-Applied Jobs
          </Link>
        </div>
      </div>

      <div className="dashboard-jobs-section">
        <h2>Auto-Applied Jobs</h2>
        {validAutoJobs.length === 0 ? (
          <p className="dashboard-status-message">
            No auto-applied jobs yet. Set up your job preferences to start auto-applying.
          </p>
        ) : (
          <div className="dashboard-jobs-container">
            {validAutoJobs.slice(0, 10).map((application, index) => renderJobCard(application, index))}
          </div>
        )}
      </div>

      <div className="dashboard-jobs-section">
        <h2>Manually Applied Jobs</h2>
        {validManualJobs.length === 0 ? (
          <p className="dashboard-status-message">
            No manually applied jobs yet. Apply to jobs directly from job listings.
          </p>
        ) : (
          <div className="dashboard-jobs-container">
            {validManualJobs.slice(0, 10).map((application, index) => renderJobCard(application, index))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;