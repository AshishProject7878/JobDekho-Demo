import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import '../styles/AutoAppliedJobs.css';

const AutoAppliedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptedApply, setAttemptedApply] = useState(false);

  useEffect(() => {
    fetchAutoAppliedJobs();
  }, []);

  const fetchAutoAppliedJobs = async () => {
    try {
      const res = await api.get('/api/profile/auto-job/applications', {
        withCredentials: true
      });
      setJobs(res.data);
    } catch (error) {
      console.error('Error fetching auto-applied jobs:', error.response?.data);
      toast.error('Error fetching auto-applied jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyNow = async () => {
    try {
      const res = await api.post('/api/profile/auto-job/apply', {}, {
        withCredentials: true
      });
      toast.success(res.data.message);
      setAttemptedApply(true);
      fetchAutoAppliedJobs();
    } catch (error) {
      console.error('Error applying to jobs:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error applying to jobs');
    }
  };

  return (
    <div className="auto-applied-jobs-container">
      <div className="header-container">
        <h1>Auto-Applied Jobs</h1>
        <button
          onClick={handleApplyNow}
          className="apply-button"
        >
          Apply to Matching Jobs
        </button>
      </div>

      {loading ? (
        <p className="status-message">Loading...</p>
      ) : jobs.length === 0 ? (
        <p className="status-message">
          {attemptedApply ? 'No matching jobs found as per your preferences' : 'No auto-applied jobs yet'}
        </p>
      ) : (
        <div className="jobs-container">
          {jobs.map(application => (
            <div key={application._id} className="job-card">
              <h2>{application.jobId?.title}</h2>
              <p className="company-name">{application.jobId?.company?.name}</p>
              <p className="job-detail">Location: {application.jobId?.location}</p>
              <p className="job-detail">Applied: {new Date(application.appliedAt).toLocaleDateString()}</p>
              <p className="job-detail">Status: {application.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoAppliedJobs;