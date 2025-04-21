import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import '../styles/AutoAppliedJobs.css';

const AutoAppliedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptedApply, setAttemptedApply] = useState(false);
  const [prefs, setPrefs] = useState({
    minSalary: null,
    experienceLevel: '',
    categories: [],
    skills: [],
    remoteOnly: false,
    minCompanyRating: null,
    enabled: false,
  });
  const [resumeUrl, setResumeUrl] = useState(null);

  useEffect(() => {
    fetchAutoJobPrefs();
    fetchAutoAppliedJobs();
  }, []);

  const fetchAutoJobPrefs = async () => {
    try {
      const res = await api.get('/api/profileComp', { withCredentials: true });
      const autoJobPrefs = {
        minSalary: res.data.autoJobPrefs?.minSalary != null ? Number(res.data.autoJobPrefs.minSalary) : null,
        experienceLevel: res.data.autoJobPrefs?.experienceLevel || '',
        categories: Array.isArray(res.data.autoJobPrefs?.categories) ? res.data.autoJobPrefs.categories : [],
        skills: Array.isArray(res.data.autoJobPrefs?.skills) ? res.data.autoJobPrefs.skills : [],
        remoteOnly: res.data.autoJobPrefs?.remoteOnly || false,
        minCompanyRating: res.data.autoJobPrefs?.minCompanyRating != null ? Number(res.data.autoJobPrefs.minCompanyRating) : null,
        enabled: res.data.autoJobPrefs?.enabled || false,
      };
      setPrefs(autoJobPrefs);
      setResumeUrl(res.data.personal?.resumeUrl || null);
    } catch (error) {
      console.error('Error fetching preferences:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error fetching job preferences');
    }
  };

  const fetchAutoAppliedJobs = async () => {
    try {
      const res = await api.get('/api/profile/auto-job/applications', { withCredentials: true });
      setJobs(res.data);
    } catch (error) {
      console.error('Error fetching auto-applied jobs:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error fetching auto-applied jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyNow = async () => {
    if (!prefs.skills || prefs.skills.length === 0) {
      toast.error('Please add at least one skill in your job preferences');
      return;
    }
    if (!resumeUrl) {
      toast.error('Please upload a resume to your profile before using auto-apply');
      return;
    }
    try {
      const normalizedSkills = [...new Set(prefs.skills.map(skill => skill.trim().toLowerCase()))];
      console.log('Sending normalized skills:', normalizedSkills);
      const res = await api.post(
        '/api/profile/auto-job/apply',
        { skills: normalizedSkills, resumeUrl },
        { withCredentials: true }
      );
      console.log('Auto-apply response:', res.data);
      if (res.data.appliedJobs && res.data.appliedJobs.length > 0) {
        toast.success(`Successfully applied to ${res.data.appliedJobs.length} matching job(s)`);
      } else {
        toast.warn(res.data.message || 'No jobs found matching your skills. Try adding more skills or check available jobs.');
      }
      setAttemptedApply(true);
      await fetchAutoAppliedJobs();
    } catch (error) {
      console.error('Error applying to jobs:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error applying to jobs');
    }
  };

  return (
    <div className="auto-applied-jobs-container">
      <div className="header-container">
        <h1>Auto-Applied Jobs</h1>
        <button onClick={handleApplyNow} disabled={!resumeUrl || !prefs.skills.length} className="apply-button">
          Apply to Matching Jobs
        </button>
      </div>
      {prefs.enabled && (
        <div className="info-message">
          <p>Auto-apply is enabled. Jobs will be applied automatically every 3 days based on your preferences.</p>
        </div>
      )}
      {!resumeUrl && (
        <div className="warning-message">
          <p>Please upload a resume to your profile to enable auto-apply.</p>
          <button onClick={() => window.location.href = '/profile'} className="nav-button">
            Go to Profile
          </button>
        </div>
      )}
      {loading ? (
        <p className="status-message">Loading...</p>
      ) : jobs.length === 0 ? (
        <p className="status-message">
          {attemptedApply
            ? 'No jobs found matching your skills. Try adding more skills or check available jobs.'
            : 'No auto-applied jobs yet. Click "Apply to Matching Jobs" to start.'}
        </p>
      ) : (
        <div className="jobs-container">
          {jobs.map((application, index) => (
            <div key={application._id} className="job-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="top-section">
                <span>{application.status || 'Pending'}</span>
                {/* <i className="fas fa-heart"></i> */}
              </div>
              <div className="mid-section">
                <div className="comp-img">
                  <img
                    src={application.jobId?.company?.logo || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                    alt={application.jobId?.company?.name || 'Company'}
                  />
                  <div className="comp-dets">
                    <h3 className="job-title">{application.jobId?.title || 'Untitled Job'}</h3>
                    <p className="company-name">{application.jobId?.company?.name || 'Unknown Company'}</p>
                    <p className="location">
                      <i className="fas fa-map-marker-alt"></i> {application.jobId?.location || 'Not specified'}
                    </p>
                  </div>
                </div>
                {application.jobId?.skills && (
                  <div className="skills">
                    {application.jobId.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="bottom-section">
                <span className="status">Status: {application.status || 'Pending'}</span>
                <span className="applied-at">
                  Applied: {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoAppliedJobs;