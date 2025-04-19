import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import '../styles/AutoJobPrefs.css';

const AutoJobPrefs = () => {
  const [prefs, setPrefs] = useState({
    enabled: false,
    minSalary: '',
    experienceLevel: '',
    categories: [],
    skills: [],
    remoteOnly: false,
    minCompanyRating: ''
  });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, message: '' });
  const navigate = useNavigate();
  const [categories] = useState([
    "Software Development",
    "Web Development",
    "Mobile App Development",
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "Data Science",
    "Machine Learning",
    "Artificial Intelligence",
    "Cybersecurity",
    "Cloud Computing",
    "DevOps",
    "Blockchain",
    "IT Support",
    "Database Administration",
    "Network Engineering",
    "Game Development",
    "Quality Assurance",
    "UI/UX Design",
    "Product Management",
    "Project Management",
    "Digital Marketing",
    "Social Media Management",
    "Content Marketing",
    "SEO/SEM",
    "Marketing Strategy",
    "Business Development",
    "Sales",
    "Retail",
    "Customer Support",
    "Technical Sales",
    "Telemarketing",
    "E-commerce",
    "Brand Management",
    "Market Research",
    "Graphic Design",
    "Visual Design",
    "Animation",
    "Illustration",
    "Video Editing",
    "Photography",
    "Content Writing",
    "Copywriting",
    "Blogging",
    "Scriptwriting",
    "Journalism",
    "Media & Broadcasting",
    "Public Relations",
    "Film Production",
    "Teaching",
    "Online Tutoring",
    "Curriculum Design",
    "Research",
    "Academic Writing",
    "Educational Counseling",
    "Library Science",
    "Accounting",
    "Auditing",
    "Bookkeeping",
    "Taxation",
    "Finance",
    "Banking",
    "Insurance",
    "Investment Management",
    "Legal Advisory",
    "Law Practice",
    "Paralegal",
    "Compliance",
    "Human Resources",
    "Recruitment",
    "Training & Development",
    "Payroll Management",
    "Office Administration",
    "Executive Assistant",
    "Data Entry",
    "Healthcare",
    "Medical",
    "Nursing",
    "Physiotherapy",
    "Pharmacy",
    "Dentistry",
    "Mental Health",
    "Nutritionist",
    "Lab Technician",
    "Veterinary",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Environmental Engineering",
    "Industrial Engineering",
    "Biomedical Engineering",
    "Structural Engineering",
    "Architecture",
    "Urban Planning",
    "Interior Design",
    "Construction Management",
    "Site Engineering",
    "Surveying",
    "Manufacturing",
    "Production Management",
    "Warehouse Operations",
    "Supply Chain Management",
    "Procurement",
    "Inventory Management",
    "Logistics",
    "Transportation",
    "Quality Control",
    "Government",
    "Public Policy",
    "Civil Services",
    "Defense & Military",
    "Nonprofit",
    "NGO",
    "Social Work",
    "Hospitality",
    "Hotel Management",
    "Travel & Tourism",
    "Event Management",
    "Food & Beverage",
    "Electrician",
    "Plumber",
    "Carpenter",
    "Mechanic",
    "Welding",
    "HVAC Technician",
    "Machinist",
    "CNC Operator",
    "Remote Jobs",
    "Freelance",
    "Internships",
    "Entry-Level",
    "Others"
  ]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/profile', {
        withCredentials: true
      });
      const autoJobPrefs = {
        enabled: res.data.autoJobPrefs?.enabled ?? false,
        minSalary: res.data.autoJobPrefs?.minSalary != null ? String(res.data.autoJobPrefs.minSalary) : '',
        experienceLevel: res.data.autoJobPrefs?.experienceLevel ?? '',
        categories: Array.isArray(res.data.autoJobPrefs?.categories) ? res.data.autoJobPrefs.categories : [],
        skills: Array.isArray(res.data.autoJobPrefs?.skills) ? res.data.autoJobPrefs.skills : [],
        remoteOnly: res.data.autoJobPrefs?.remoteOnly ?? false,
        minCompanyRating: res.data.autoJobPrefs?.minCompanyRating != null ? String(res.data.autoJobPrefs.minCompanyRating) : ''
      };
      // Merge professional.skills only if autoJobPrefs.skills is empty
      const professionalSkills = Array.isArray(res.data.professional?.skills) ? res.data.professional.skills : [];
      const skills = autoJobPrefs.skills.length > 0 ? autoJobPrefs.skills : [...new Set(professionalSkills)];
      setPrefs({ ...autoJobPrefs, skills });
    } catch (error) {
      console.error('Error fetching profile:', error.response?.data);
      if (error.response?.status === 401) {
        toast.error('Session expired, please log in again');
        window.location.href = '/login';
      } else {
        toast.error('Error fetching preferences');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/api/profile', {
        autoJobPrefs: {
          ...prefs,
          minSalary: prefs.minSalary ? Number(prefs.minSalary) : null,
          minCompanyRating: prefs.minCompanyRating ? Number(prefs.minCompanyRating) : null
        }
      }, {
        withCredentials: true
      });
      toast.success('Preferences saved successfully');
      setModal({ isOpen: true, message: 'Preferences saved successfully.' });
      // Redirect to /auto-job/applications after a brief delay to show modal
      setTimeout(() => {
        navigate('/auto-job/applications');
      }, 1500);
    } catch (error) {
      console.error('Error saving preferences:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error saving preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      const res = await api.patch('/api/profile/auto-job/toggle', {}, {
        withCredentials: true
      });
      setPrefs({ ...prefs, enabled: res.data.enabled });
      toast.success(`Auto job application ${res.data.enabled ? 'enabled' : 'disabled'}`);
      // Trigger auto-apply and show modal if enabled
      if (res.data.enabled) {
        await api.post('/api/profile/auto-job/apply', {}, { withCredentials: true });
        setModal({ isOpen: true, message: 'Auto job application enabled. Applying to matching jobs.' });
      }
    } catch (error) {
      console.error('Error toggling auto job:', error.response?.data);
      toast.error('Error toggling auto job');
    }
  };

  const handleSkillChange = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = e.target.value.trim();
      if (value && !prefs.skills.includes(value)) {
        setPrefs({ ...prefs, skills: [...prefs.skills, value] });
      }
      e.target.value = '';
    }
  };

  const removeSkill = (skillToRemove) => {
    setPrefs({ ...prefs, skills: prefs.skills.filter(skill => skill !== skillToRemove) });
  };

  const closeModal = () => {
    setModal({ isOpen: false, message: '' });
  };

  return (
    <div className="auto-job-prefs-container">
      <h1>Auto Job Application Preferences</h1>
      
      <div className="toggle-container">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={prefs.enabled}
            onChange={handleToggle}
            className="toggle-input"
          />
          <span className="toggle-slider"></span>
          <span className="toggle-text">Enable Auto Job Application</span>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label>Minimum Salary (LPA)</label>
          <input
            type="number"
            value={prefs.minSalary}
            onChange={(e) => setPrefs({ ...prefs, minSalary: e.target.value })}
            className="form-input"
            placeholder="Enter minimum salary"
          />
        </div>

        <div className="form-group">
          <label>Experience Level</label>
          <select
            value={prefs.experienceLevel}
            onChange={(e) => setPrefs({ ...prefs, experienceLevel: e.target.value })}
            className="form-input"
          >
            <option value="">Select experience level</option>
            <option value="Entry">Entry</option>
            <option value="Mid">Mid</option>
            <option value="Senior">Senior</option>
          </select>
        </div>

        <div className="form-group">
          <label>Minimum Company Rating</label>
          <select
            value={prefs.minCompanyRating}
            onChange={(e) => setPrefs({ ...prefs, minCompanyRating: e.target.value })}
            className="form-input"
          >
            <option value="">No preference</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>

        <div className="form-group">
          <label>Categories <span className="help-text">(Hold Ctrl/Cmd to select multiple)</span></label>
          <select
            multiple
            value={prefs.categories}
            onChange={(e) => setPrefs({ ...prefs, categories: Array.from(e.target.selectedOptions, option => option.value) })}
            className="form-input form-input-multi"
          >
            <option value="" disabled>Select categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Skills</label>
          <input
            type="text"
            onKeyDown={handleSkillChange}
            className="form-input"
            placeholder="Type a skill and press Enter"
          />
          <div className="skills-container">
            {prefs.skills.map(skill => (
              <span
                key={skill}
                className="skill-tag"
                onClick={() => removeSkill(skill)}
              >
                {skill} <span className="skill-remove">×</span>
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={prefs.remoteOnly}
              onChange={(e) => setPrefs({ ...prefs, remoteOnly: e.target.checked })}
              className="checkbox-input"
            />
            <span>Remote Only</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="submit-button"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>

      {modal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>{modal.message}</p>
            <button onClick={closeModal} className="modal-close-button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoJobPrefs;