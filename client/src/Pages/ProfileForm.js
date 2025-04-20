import React, { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import api from "../api";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/ProfileForm.css";

function ProfileForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [hasProfile, setHasProfile] = useState(false);
  const [formData, setFormData] = useState({
    personal: {
      fullName: "",
      email: "",
      dob: "",
      gender: "",
      profilePicture: "",
      resumeUrl: "",
      videoResumeUrl: "",
    },
    isFresher: false,
    jobHistory: [{ company: "", position: "", startDate: "", endDate: "", description: "" }],
    educationHistory: [{ degree: "", institution: "", field: "", graduationYear: "" }],
    professional: { jobTitle: "", company: "", experience: "", skills: [] },
    jobPrefs: { roles: [], locations: [], salary: "", employmentType: [] },
    autoJobPrefs: {
      enabled: false,
      minSalary: 0,
      experienceLevel: "",
      categories: [],
      skills: [],
      remoteOnly: false,
      minCompanyRating: 0,
    },
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [categoryInput, setCategoryInput] = useState("");

  const UPLOAD_URL = "http://localhost:5000/api/upload";
  const UPLOAD_RESUME_URL = "http://localhost:5000/api/upload/resume";
  const UPLOAD_VIDEO_URL = "http://localhost:5000/api/upload/video-resume";

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      navigate("/login");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        fullName: userData.name || location.state?.name || "",
        email: userData.email || location.state?.email || "",
      },
    }));

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/api/profile", { withCredentials: true });
        setHasProfile(true);
        setFormData((prev) => ({
          ...prev,
          ...response.data,
          personal: {
            fullName: userData.name || location.state?.name || "",
            email: userData.email || location.state?.email || "",
            profilePicture: response.data.personal?.profilePicture || "",
            dob: response.data.personal?.dob || "",
            gender: response.data.personal?.gender || "",
            resumeUrl: response.data.personal?.resumeUrl || "",
            videoResumeUrl: response.data.personal?.videoResumeUrl || "",
          },
          jobHistory: response.data.jobHistory?.length
            ? response.data.jobHistory
            : prev.jobHistory,
          educationHistory: response.data.educationHistory?.length
            ? response.data.educationHistory
            : prev.educationHistory,
          professional: { ...prev.professional, ...response.data.professional },
          jobPrefs: { ...prev.jobPrefs, ...response.data.jobPrefs },
          autoJobPrefs: { ...prev.autoJobPrefs, ...response.data.autoJobPrefs },
        }));
      } catch (error) {
        if (error.response?.status === 404) {
          setHasProfile(false);
          console.log("No profile found, starting with empty form.");
        } else {
          console.error("Failed to fetch profile:", error);
          setErrorMessage(error.response?.data?.message || "Failed to load profile");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, location.state]);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const validateField = (section, field, value, index = null) => {
    const newErrors = { ...errors };
    const fieldKey = index !== null ? `${field}${index}` : field;

    if (touched[fieldKey] || isSubmitting) {
      if (
        section === "personal" &&
        ["dob", "gender"].includes(field) &&
        !value
      ) {
        newErrors[fieldKey] = "This field is required";
      } else if (
        section === "professional" &&
        ["jobTitle", "company", "skills"].includes(field) &&
        !value
      ) {
        newErrors[fieldKey] = field === "skills" ? "At least one skill is required" : "This field is required";
      } else if (
        section === "jobPrefs" &&
        ["roles", "locations"].includes(field) &&
        value.length === 0
      ) {
        newErrors[fieldKey] = `At least one ${field} is required`;
      } else if (
        section === "autoJobPrefs" &&
        field === "minSalary" &&
        value < 0
      ) {
        newErrors[fieldKey] = "Minimum salary cannot be negative";
      } else if (
        section === "autoJobPrefs" &&
        field === "minCompanyRating" &&
        (value < 0 || value > 5)
      ) {
        newErrors[fieldKey] = "Company rating must be between 0 and 5";
      } else if (
        section === "educationHistory" &&
        ["degree", "institution"].includes(field) &&
        !value
      ) {
        newErrors[fieldKey] = "This field is required";
      } else if (
        section === "educationHistory" &&
        field === "graduationYear" &&
        value
      ) {
        const year = parseInt(value);
        if (year < 1900 || year > new Date().getFullYear()) {
          newErrors[fieldKey] = `Year must be between 1900 and ${new Date().getFullYear()}`;
        }
      } else if (
        section === "jobHistory" &&
        index !== null &&
        !formData.isFresher &&
        ["company", "position", "startDate"].includes(field) &&
        !value
      ) {
        newErrors[fieldKey] = "This field is required for non-freshers";
      } else {
        delete newErrors[fieldKey];
      }

      if (section === "jobHistory" && index !== null && !formData.isFresher) {
        const job = formData.jobHistory[index];
        if (field === "endDate" && job.startDate && value && new Date(job.startDate) > new Date(value)) {
          newErrors[fieldKey] = "End date must be after start date";
        }
      }
    }
    setErrors(newErrors);
    return !newErrors[fieldKey];
  };

  const validateStep = (currentStep) => {
    const section = Object.keys(formData)[currentStep];
    const currentData = formData[section];
    const newErrors = {};
    let isValid = true;

    if (section === "isFresher") return true;

    if (Array.isArray(currentData)) {
      if (section === "jobHistory" && !formData.isFresher) {
        if (currentData.length === 0) {
          newErrors.jobHistory = "At least one job entry is required for non-freshers";
          isValid = false;
        } else {
          currentData.forEach((item, index) => {
            ["company", "position", "startDate"].forEach((key) => {
              if (!validateField(section, key, item[key], index)) {
                newErrors[`${key}${index}`] = "This field is required";
                isValid = false;
              }
            });
          });
        }
      } else if (section === "educationHistory") {
        if (currentData.length === 0) {
          newErrors.educationHistory = "At least one education entry is required";
          isValid = false;
        } else {
          currentData.forEach((item, index) => {
            ["degree", "institution"].forEach((key) => {
              if (!validateField(section, key, item[key], index)) {
                newErrors[`${key}${index}`] = "This field is required";
                isValid = false;
              }
            });
          });
        }
      }
    } else {
      Object.entries(currentData).forEach(([key, value]) => {
        const optionalFields = [
          "profilePicture", "email", "fullName", "resumeUrl", "videoResumeUrl",
          "salary", "employmentType", "experience", "field", "graduationYear",
          "remoteOnly", "categories", "skills", "experienceLevel",
        ];
        if (!optionalFields.includes(key) && !validateField(section, key, value)) {
          newErrors[key] = key === "skills" || key === "roles" || key === "locations"
            ? `At least one ${key} is required`
            : "This field is required";
          isValid = false;
        }
      });
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setErrorMessage("Please upload a valid PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("File size must be less than 10MB");
        return;
      }
      setResumeFile(file);
      setErrorMessage(null);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["video/mp4", "video/webm"].includes(file.type)) {
        setErrorMessage("Please upload a valid MP4 or WebM video");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setErrorMessage("Video size must be less than 50MB");
        return;
      }
      setVideoFile(file);
      setErrorMessage(null);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setErrorMessage("Please select a file to upload");
      return;
    }

    setIsUploadingResume(true);
    const formDataUpload = new FormData();
    formDataUpload.append("resume", resumeFile);

    try {
      const response = await api.post("/api/upload/resume", formDataUpload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const resumeUrl = response.data.url;
      setFormData((prev) => ({
        ...prev,
        personal: { ...prev.personal, resumeUrl },
      }));
      setResumeFile(null);
      setSuccessMessage("Resume uploaded successfully!");
    } catch (error) {
      console.error("Resume upload failed:", error);
      setErrorMessage(error.response?.data?.message || "Failed to upload resume");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile) {
      setErrorMessage("Please select a video file to upload");
      return;
    }

    setIsUploadingVideo(true);
    const formDataUpload = new FormData();
    formDataUpload.append("videoResume", videoFile);

    try {
      const response = await api.post("/api/upload/video-resume", formDataUpload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const videoResumeUrl = response.data.url;
      setFormData((prev) => ({
        ...prev,
        personal: { ...prev.personal, videoResumeUrl },
      }));
      setVideoFile(null);
      setSuccessMessage("Video resume uploaded successfully!");
    } catch (error) {
      console.error("Video upload failed:", error);
      setErrorMessage(error.response?.data?.message || "Failed to upload video resume");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        profilePicture: "Only JPG or PNG files are allowed",
      }));
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        profilePicture: "File size must be less than 5MB",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, profilePicture: "" }));

    const formDataUpload = new FormData();
    formDataUpload.append("profilePicture", file);
    formDataUpload.append("isCompanyLogo", "false"); // Added to indicate profile picture

    try {
      const response = await api.post("/api/upload", formDataUpload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageUrl = response.data.url;
      setFormData((prev) => ({
        ...prev,
        personal: { ...prev.personal, profilePicture: imageUrl },
      }));
      setSuccessMessage("Profile picture uploaded successfully!");
    } catch (error) {
      console.error("Image upload failed:", error);
      setErrors((prev) => ({
        ...prev,
        profilePicture: error.response?.data?.message || "Failed to upload image",
      }));
      setErrorMessage(error.response?.data?.message || "Failed to upload profile picture");
    }
  };

  const handleChange = (section, field, value, index = null) => {
    setFormData((prev) => {
      if (section === "isFresher") {
        return { ...prev, isFresher: value };
      }
      if (index !== null) {
        const updatedArray = [...prev[section]];
        updatedArray[index] = { ...updatedArray[index], [field]: value };
        return { ...prev, [section]: updatedArray };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
    });

    const fieldKey = index !== null ? `${field}${index}` : field;
    if (section !== "isFresher" && field !== "email" && field !== "fullName") {
      setTouched((prev) => ({
        ...prev,
        [fieldKey]: true,
      }));
      validateField(section, field, value, index);
    }
  };

  const handleBlur = (section, field, value, index = null) => {
    const fieldKey = index !== null ? `${field}${index}` : field;
    if (field !== "email" && field !== "fullName") {
      setTouched((prev) => ({
        ...prev,
        [fieldKey]: true,
      }));
      validateField(section, field, value, index);
    }
  };

  const addSkill = (e, section = "professional") => {
    const input = section === "professional" ? skillInput : categoryInput;
    if (e.key === "Enter" && input.trim()) {
      const newItems = [...formData[section][section === "professional" ? "skills" : "categories"], input.trim()];
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [section === "professional" ? "skills" : "categories"]: newItems,
        },
      }));
      section === "professional" ? setSkillInput("") : setCategoryInput("");
      validateField(section, section === "professional" ? "skills" : "categories", newItems);
    }
  };

  const removeSkill = (itemToRemove, section = "professional") => {
    const newItems = formData[section][section === "professional" ? "skills" : "categories"].filter(
      (item) => item !== itemToRemove
    );
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [section === "professional" ? "skills" : "categories"]: newItems,
      },
    }));
    validateField(section, section === "professional" ? "skills" : "categories", newItems);
  };

  const addRole = (e) => {
    if (e.key === "Enter" && roleInput.trim()) {
      const newRoles = [...formData.jobPrefs.roles, roleInput.trim()];
      setFormData((prev) => ({
        ...prev,
        jobPrefs: { ...prev.jobPrefs, roles: newRoles },
      }));
      setRoleInput("");
      validateField("jobPrefs", "roles", newRoles);
    }
  };

  const removeRole = (roleToRemove) => {
    const newRoles = formData.jobPrefs.roles.filter((role) => role !== roleToRemove);
    setFormData((prev) => ({
      ...prev,
      jobPrefs: { ...prev.jobPrefs, roles: newRoles },
    }));
    validateField("jobPrefs", "roles", newRoles);
  };

  const addLocation = (e) => {
    if (e.key === "Enter" && locationInput.trim()) {
      const newLocations = [...formData.jobPrefs.locations, locationInput.trim()];
      setFormData((prev) => ({
        ...prev,
        jobPrefs: { ...prev.jobPrefs, locations: newLocations },
      }));
      setLocationInput("");
      validateField("jobPrefs", "locations", newLocations);
    }
  };

  const removeLocation = (locationToRemove) => {
    const newLocations = formData.jobPrefs.locations.filter((location) => location !== locationToRemove);
    setFormData((prev) => ({
      ...prev,
      jobPrefs: { ...prev.jobPrefs, locations: newLocations },
    }));
    validateField("jobPrefs", "locations", newLocations);
  };

  const addEntry = (section) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [
        ...prev[section],
        section === "jobHistory"
          ? { company: "", position: "", startDate: "", endDate: "", description: "" }
          : { degree: "", institution: "", field: "", graduationYear: "" },
      ],
    }));
  };

  const removeEntry = (section, index) => {
    if (window.confirm("Are you sure you want to remove this entry?")) {
      setFormData((prev) => ({
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index),
      }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(prev).forEach((key) => {
          if (key.endsWith(index)) delete newErrors[key];
        });
        return newErrors;
      });
      setTouched((prev) => {
        const newTouched = { ...prev };
        Object.keys(prev).forEach((key) => {
          if (key.endsWith(index)) delete newTouched[key];
        });
        return newTouched;
      });
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setTouched({});
    } else {
      const section = Object.keys(formData)[step];
      const currentData = formData[section];
      const newTouched = { ...touched };

      if (Array.isArray(currentData) && section !== "isFresher") {
        currentData.forEach((_, index) => {
          Object.keys(currentData[0]).forEach((key) => {
            newTouched[`${key}${index}`] = true;
          });
        });
      } else if (section !== "isFresher") {
        Object.keys(currentData).forEach((key) => {
          if (key !== "email" && key !== "fullName" && key !== "resumeUrl" && key !== "videoResumeUrl") {
            newTouched[key] = true;
          }
        });
      }
      setTouched(newTouched);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setTouched({});
  };

  const skipStep = () => {
    setStep(step + 1);
    setTouched({});
  };

  const submitProfile = useCallback(
    debounce(async (data, hasProfile) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        console.log("Submitting formData:", data);
        const method = hasProfile ? api.put : api.post;
        const response = await method("/api/profile", data, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        console.log("Profile response:", response.data);
        setSuccessMessage(response.data.message || "Profile successfully created!");
        setTimeout(() => navigate("/profileComp"), 2000);
      } catch (error) {
        console.error("Profile submission failed:", {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status,
        });
        const validationErrors = error.response?.data?.errors;
        if (validationErrors) {
          const newErrors = {};
          validationErrors.forEach((err) => {
            newErrors[err.path] = err.message;
          });
          setErrors((prev) => ({ ...prev, ...newErrors }));
          setErrorMessage("Validation failed. Please check the highlighted fields.");
        } else {
          setErrorMessage(error.response?.data?.message || "Profile submission failed");
        }
      } finally {
        setIsSubmitting(false);
      }
    }, 1000),
    [isSubmitting, navigate]
  );

  const handleSubmit = () => {
    if (step === 6 && validateStep(5)) {
      submitProfile(formData, hasProfile);
    } else {
      setStep(6);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="form-section">
            <h3 className="pre-title">Personal Information</h3>
            {successMessage && (
              <div className="success-popup" onClick={() => setSuccessMessage(null)}>
                <div className="success-popup-content" onClick={(e) => e.stopPropagation()}>
                  <i className="fa-solid fa-check checkmark-icon"></i>
                  <h2>{successMessage}</h2>
                  <button
                    className="form-btn popup-btn"
                    onClick={() => setSuccessMessage(null)}
                  >
                    Okay
                  </button>
                </div>
              </div>
            )}
            {errorMessage && (
              <div className="success-popup" onClick={() => setErrorMessage(null)}>
                <div className="success-popup-content error-popup-content" onClick={(e) => e.stopPropagation()}>
                  <i className="fa-solid fa-exclamation-circle error-icon"></i>
                  <h2>{errorMessage}</h2>
                  <button
                    className="form-btn popup-btn"
                    onClick={() => setErrorMessage(null)}
                  >
                    Okay
                  </button>
                </div>
              </div>
            )}
            <div className="pre-form">
              <div className="form-group">
                <label>Full Name:</label>
                <input
                  type="text"
                  value={formData.personal.fullName}
                  readOnly
                  className={errors.fullName ? "error" : ""}
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={formData.personal.email}
                  readOnly
                  className={errors.email ? "error" : ""}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Profile Picture (optional, JPG/PNG, max 5MB):</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  className={errors.profilePicture ? "error" : ""}
                />
                {formData.personal.profilePicture ? (
                  <img
                    src={formData.personal.profilePicture}
                    alt="Profile Preview"
                    className="profile-preview"
                    onError={(e) => {
                      console.log("Preview failed to load:", e.target.src);
                      e.target.src =
                        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                    }}
                  />
                ) : (
                  <img
                    src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                    alt="Default Profile"
                    className="profile-preview"
                  />
                )}
                {errors.profilePicture && <span className="error-message">{errors.profilePicture}</span>}
              </div>
              <div className="form-group">
                <label>Resume (optional, PDF, max 10MB):</label>
                {formData.personal.resumeUrl ? (
                  <div className="resume-preview">
                    <a href={formData.personal.resumeUrl} target="_blank" rel="noopener noreferrer">
                      View Resume
                    </a>
                    <embed
                      src={formData.personal.resumeUrl}
                      type="application/pdf"
                      width="100%"
                      height="200px"
                      style={{ marginTop: "10px" }}
                    />
                  </div>
                ) : (
                  <p>No resume uploaded.</p>
                )}
                <div className="upload-resume">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleResumeChange}
                    className="resume-upload-input"
                    key={resumeFile ? resumeFile.name : "resume-input"}
                  />
                  <button
                    className={`form-btn ${isUploadingResume ? "loading-btn" : ""}`}
                    onClick={handleResumeUpload}
                    disabled={isUploadingResume || !resumeFile}
                  >
                    {isUploadingResume ? (
                      <>
                        <span className="loader"></span> Uploading...
                      </>
                    ) : formData.personal.resumeUrl ? (
                      "Change Resume"
                    ) : (
                      "Upload Resume"
                    )}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Video Resume (optional, MP4/WebM, max 50MB):</label>
                {formData.personal.videoResumeUrl ? (
                  <div className="video-resume-preview">
                    <video
                      controls
                      src={formData.personal.videoResumeUrl}
                      style={{ maxWidth: "100%", height: "auto", marginTop: "10px" }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <p>No video resume uploaded.</p>
                )}
                <div className="upload-video-resume">
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleVideoChange}
                    className="video-upload-input"
                    key={videoFile ? videoFile.name : "video-input"}
                  />
                  <button
                    className={`form-btn ${isUploadingVideo ? "loading-btn" : ""}`}
                    onClick={handleVideoUpload}
                    disabled={isUploadingVideo || !videoFile}
                  >
                    {isUploadingVideo ? (
                      <>
                        <span className="loader"></span> Uploading...
                      </>
                    ) : formData.personal.videoResumeUrl ? (
                      "Change Video Resume"
                    ) : (
                      "Upload Video Resume"
                    )}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Date of Birth:</label>
                <input
                  type="date"
                  value={formData.personal.dob}
                  onChange={(e) => handleChange("personal", "dob", e.target.value)}
                  onBlur={(e) => handleBlur("personal", "dob", e.target.value)}
                  className={errors.dob ? "error" : ""}
                />
                {errors.dob && <span className="error-message">{errors.dob}</span>}
              </div>
              <div className="form-group">
                <label>Gender:</label>
                <div className="radio-group">
                  {["male", "female", "other"].map((option) => (
                    <label key={option} className="radio-label">
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={formData.personal.gender === option}
                        onChange={(e) => handleChange("personal", "gender", e.target.value)}
                        onBlur={(e) => handleBlur("personal", "gender", e.target.value)}
                      />
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </label>
                  ))}
                </div>
                {errors.gender && <span className="error-message">{errors.gender}</span>}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="form-section">
            <h3 className="pre-title">Job History</h3>
            <div className="form-group">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={formData.isFresher}
                  onChange={(e) => handleChange("isFresher", "", e.target.checked)}
                />
                <span>I am a Fresher (No Job Experience)</span>
              </label>
            </div>
            {formData.isFresher ? (
              <div className="fresher-section">
                <p className="fresher-message">As a fresher, you don't need to provide job history.</p>
              </div>
            ) : (
              <div className="pre-form">
                {formData.jobHistory.map((job, index) => (
                  <div key={index} className="history-entry">
                    <div className="form-group">
                      <label>Company:</label>
                      <input
                        type="text"
                        value={job.company}
                        onChange={(e) => handleChange("jobHistory", "company", e.target.value, index)}
                        onBlur={(e) => handleBlur("jobHistory", "company", e.target.value, index)}
                        placeholder="Enter company name"
                        className={errors[`company${index}`] ? "error" : ""}
                      />
                      {errors[`company${index}`] && (
                        <span className="error-message">{errors[`company${index}`]}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Position:</label>
                      <input
                        type="text"
                        value={job.position}
                        onChange={(e) => handleChange("jobHistory", "position", e.target.value, index)}
                        onBlur={(e) => handleBlur("jobHistory", "position", e.target.value, index)}
                        placeholder="Enter position"
                        className={errors[`position${index}`] ? "error" : ""}
                      />
                      {errors[`position${index}`] && (
                        <span className="error-message">{errors[`position${index}`]}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Start Date:</label>
                      <input
                        type="date"
                        value={job.startDate}
                        onChange={(e) => handleChange("jobHistory", "startDate", e.target.value, index)}
                        onBlur={(e) => handleBlur("jobHistory", "startDate", e.target.value, index)}
                        className={errors[`startDate${index}`] ? "error" : ""}
                      />
                      {errors[`startDate${index}`] && (
                        <span className="error-message">{errors[`startDate${index}`]}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>End Date:</label>
                      <input
                        type="date"
                        value={job.endDate}
                        onChange={(e) => handleChange("jobHistory", "endDate", e.target.value, index)}
                        onBlur={(e) => handleBlur("jobHistory", "endDate", e.target.value, index)}
                        className={errors[`endDate${index}`] ? "error" : ""}
                      />
                      {errors[`endDate${index}`] && (
                        <span className="error-message">{errors[`endDate${index}`]}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Description:</label>
                      <textarea
                        value={job.description}
                        onChange={(e) => handleChange("jobHistory", "description", e.target.value, index)}
                        onBlur={(e) => handleBlur("jobHistory", "description", e.target.value, index)}
                        placeholder="Describe your responsibilities"
                        className={errors[`description${index}`] ? "error" : ""}
                      />
                      {errors[`description${index}`] && (
                        <span className="error-message">{errors[`description${index}`]}</span>
                      )}
                    </div>
                    {formData.jobHistory.length > 1 && (
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeEntry("jobHistory", index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-btn" onClick={() => addEntry("jobHistory")}>
                  Add Another Job
                </button>
                {errors.jobHistory && <span className="error-message">{errors.jobHistory}</span>}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="form-section">
            <h3 className="pre-title">Education History</h3>
            <div className="pre-form">
              {formData.educationHistory.map((edu, index) => (
                <div key={index} className="history-entry">
                  <div className="form-group">
                    <label>Degree:</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleChange("educationHistory", "degree", e.target.value, index)}
                      onBlur={(e) => handleBlur("educationHistory", "degree", e.target.value, index)}
                      placeholder="Enter degree"
                      className={errors[`degree${index}`] ? "error" : ""}
                    />
                    {errors[`degree${index}`] && (
                      <span className="error-message">{errors[`degree${index}`]}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Institution:</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) =>
                        handleChange("educationHistory", "institution", e.target.value, index)
                      }
                      onBlur={(e) => handleBlur("educationHistory", "institution", e.target.value, index)}
                      placeholder="Enter institution name"
                      className={errors[`institution${index}`] ? "error" : ""}
                    />
                    {errors[`institution${index}`] && (
                      <span className="error-message">{errors[`institution${index}`]}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Field of Study:</label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => handleChange("educationHistory", "field", e.target.value, index)}
                      onBlur={(e) => handleBlur("educationHistory", "field", e.target.value, index)}
                      placeholder="Enter field of study"
                      className={errors[`field${index}`] ? "error" : ""}
                    />
                    {errors[`field${index}`] && (
                      <span className="error-message">{errors[`field${index}`]}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Graduation Year:</label>
                    <input
                      type="number"
                      value={edu.graduationYear}
                      onChange={(e) =>
                        handleChange("educationHistory", "graduationYear", e.target.value, index)
                      }
                      onBlur={(e) =>
                        handleBlur("educationHistory", "graduationYear", e.target.value, index)
                      }
                      placeholder="Enter year"
                      min="1900"
                      max={new Date().getFullYear()}
                      className={errors[`graduationYear${index}`] ? "error" : ""}
                    />
                    {errors[`graduationYear${index}`] && (
                      <span className="error-message">{errors[`graduationYear${index}`]}</span>
                    )}
                  </div>
                  {formData.educationHistory.length > 1 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeEntry("educationHistory", index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="add-btn"
                onClick={() => addEntry("educationHistory")}
              >
                Add Another Education
              </button>
              {errors.educationHistory && <span className="error-message">{errors.educationHistory}</span>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-section">
            <h3 className="pre-title">Professional Details</h3>
            <div className="pre-form">
              <div className="form-group">
                <label>Current Job Title:</label>
                <input
                  type="text"
                  value={formData.professional.jobTitle}
                  onChange={(e) => handleChange("professional", "jobTitle", e.target.value)}
                  onBlur={(e) => handleBlur("professional", "jobTitle", e.target.value)}
                  placeholder="Enter your current job title"
                  className={errors.jobTitle ? "error" : ""}
                />
                {errors.jobTitle && <span className="error-message">{errors.jobTitle}</span>}
              </div>
              <div className="form-group">
                <label>Current Company:</label>
                <input
                  type="text"
                  value={formData.professional.company}
                  onChange={(e) => handleChange("professional", "company", e.target.value)}
                  onBlur={(e) => handleBlur("professional", "company", e.target.value)}
                  placeholder="Enter your current company"
                  className={errors.company ? "error" : ""}
                />
                {errors.company && <span className="error-message">{errors.company}</span>}
              </div>
              <div className="form-group">
                <label>Total Work Experience (Years):</label>
                <input
                  type="number"
                  value={formData.professional.experience}
                  onChange={(e) => handleChange("professional", "experience", e.target.value)}
                  onBlur={(e) => handleBlur("professional", "experience", e.target.value)}
                  placeholder="Enter total years of experience"
                  min="0"
                  step="0.1"
                  className={errors.experience ? "error" : ""}
                />
                {errors.experience && <span className="error-message">{errors.experience}</span>}
              </div>
              <div className="form-group">
                <label>Skills:</label>
                <div className="skills-container">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => addSkill(e, "professional")}
                    placeholder="Type a skill and press Enter"
                    className={errors.skills ? "error" : ""}
                  />
                  <div className="skills-tags">
                    {formData.professional.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                        <button
                          type="button"
                          className="remove-skill"
                          onClick={() => removeSkill(skill, "professional")}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                {errors.skills && <span className="error-message">{errors.skills}</span>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-section">
            <h3 className="pre-title">Job Preferences</h3>
            <div className="pre-form">
              <div className="form-group">
                <label>Preferred Job Roles:</label>
                <div className="skills-container">
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    onKeyDown={addRole}
                    placeholder="Type a job role and press Enter"
                    className={errors.roles ? "error" : ""}
                  />
                  <div className="skills-tags">
                    {formData.jobPrefs.roles.map((role, index) => (
                      <span key={index} className="skill-tag">
                        {role}
                        <button
                          type="button"
                          className="remove-skill"
                          onClick={() => removeRole(role)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                {errors.roles && <span className="error-message">{errors.roles}</span>}
              </div>
              <div className="form-group">
                <label>Preferred Locations:</label>
                <div className="skills-container">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={addLocation}
                    placeholder="Type a location and press Enter"
                    className={errors.locations ? "error" : ""}
                  />
                  <div className="skills-tags">
                    {formData.jobPrefs.locations.map((location, index) => (
                      <span key={index} className="skill-tag">
                        {location}
                        <button
                          type="button"
                          className="remove-skill"
                          onClick={() => removeLocation(location)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                {errors.locations && <span className="error-message">{errors.locations}</span>}
              </div>
              <div className="form-group">
                <label>Expected Salary Range:</label>
                <input
                  type="text"
                  value={formData.jobPrefs.salary}
                  onChange={(e) => handleChange("jobPrefs", "salary", e.target.value)}
                  onBlur={(e) => handleBlur("jobPrefs", "salary", e.target.value)}
                  placeholder="e.g., ₹5,00,000 - ₹7,00,000"
                  className={errors.salary ? "error" : ""}
                />
                {errors.salary && <span className="error-message">{errors.salary}</span>}
              </div>
              <div className="form-group">
                <label>Employment Type:</label>
                <div className="checkbox-group">
                  {["full-time", "part-time", "remote", "freelance"].map((type) => (
                    <label key={type} className="checkbox-label">
                      <input
                        type="checkbox"
                        value={type}
                        checked={formData.jobPrefs.employmentType.includes(type)}
                        onChange={(e) => {
                          const selectedTypes = formData.jobPrefs.employmentType;
                          const newTypes = e.target.checked
                            ? [...selectedTypes, type]
                            : selectedTypes.filter((t) => t !== type);
                          handleChange("jobPrefs", "employmentType", newTypes);
                        }}
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
                {errors.employmentType && <span className="error-message">{errors.employmentType}</span>}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="form-section">
            <h3 className="pre-title">Auto Job Preferences</h3>
            <div className="pre-form">
              <div className="form-group">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.autoJobPrefs.enabled}
                    onChange={(e) => handleChange("autoJobPrefs", "enabled", e.target.checked)}
                  />
                  <span>Enable Auto Job Applications</span>
                </label>
              </div>
              <div className="form-group">
                <label>Minimum Salary (LPA):</label>
                <input
                  type="number"
                  value={formData.autoJobPrefs.minSalary}
                  onChange={(e) => handleChange("autoJobPrefs", "minSalary", Number(e.target.value))}
                  onBlur={(e) => handleBlur("autoJobPrefs", "minSalary", Number(e.target.value))}
                  placeholder="Enter minimum salary in LPA"
                  min="0"
                  step="0.1"
                  className={errors.minSalary ? "error" : ""}
                />
                {errors.minSalary && <span className="error-message">{errors.minSalary}</span>}
              </div>
              <div className="form-group">
                <label>Experience Level:</label>
                <select
                  value={formData.autoJobPrefs.experienceLevel}
                  onChange={(e) => handleChange("autoJobPrefs", "experienceLevel", e.target.value)}
                  onBlur={(e) => handleBlur("autoJobPrefs", "experienceLevel", e.target.value)}
                  className={errors.experienceLevel ? "error" : ""}
                >
                  <option value="">Select Experience Level</option>
                  {["Entry", "Mid", "Senior"].map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                {errors.experienceLevel && <span className="error-message">{errors.experienceLevel}</span>}
              </div>
              <div className="form-group">
                <label>Job Categories:</label>
                <div className="skills-container">
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyDown={(e) => addSkill(e, "autoJobPrefs")}
                    placeholder="Type a category and press Enter"
                    className={errors.categories ? "error" : ""}
                  />
                  <div className="skills-tags">
                    {formData.autoJobPrefs.categories.map((category, index) => (
                      <span key={index} className="skill-tag">
                        {category}
                        <button
                          type="button"
                          className="remove-skill"
                          onClick={() => removeSkill(category, "autoJobPrefs")}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                {errors.categories && <span className="error-message">{errors.categories}</span>}
              </div>
              <div className="form-group">
                <label>Skills:</label>
                <div className="skills-container">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => addSkill(e, "autoJobPrefs")}
                    placeholder="Type a skill and press Enter"
                    className={errors.skills ? "error" : ""}
                  />
                  <div className="skills-tags">
                    {formData.autoJobPrefs.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                        <button
                          type="button"
                          className="remove-skill"
                          onClick={() => removeSkill(skill, "autoJobPrefs")}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                {errors.skills && <span className="error-message">{errors.skills}</span>}
              </div>
              <div className="form-group">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.autoJobPrefs.remoteOnly}
                    onChange={(e) => handleChange("autoJobPrefs", "remoteOnly", e.target.checked)}
                  />
                  <span>Remote Jobs Only</span>
                </label>
              </div>
              <div className="form-group">
                <label>Minimum Company Rating (0-5):</label>
                <input
                  type="number"
                  value={formData.autoJobPrefs.minCompanyRating}
                  onChange={(e) => handleChange("autoJobPrefs", "minCompanyRating", Number(e.target.value))}
                  onBlur={(e) => handleBlur("autoJobPrefs", "minCompanyRating", Number(e.target.value))}
                  placeholder="Enter minimum company rating"
                  min="0"
                  max="5"
                  step="0.1"
                  className={errors.minCompanyRating ? "error" : ""}
                />
                {errors.minCompanyRating && <span className="error-message">{errors.minCompanyRating}</span>}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="form-section summary-section">
            <h3 className="pre-title">Profile Summary</h3>
            <div className="summary-content">
              <SummarySection title="Personal Information" stepToEdit={0} setStep={setStep}>
                <p>
                  <strong>Name:</strong> {formData.personal.fullName || "Not provided"}
                </p>
                <p>
                  <strong>Email:</strong> {formData.personal.email || "Not provided"}
                </p>
                <p>
                  <strong>Profile Picture:</strong>
                  <img
                    src={
                      formData.personal.profilePicture ||
                      "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                    }
                    alt="Profile"
                    className="summary-profile-pic"
                    onError={(e) => {
                      console.log("Summary image failed to load:", e.target.src);
                      e.target.src =
                        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                    }}
                  />
                </p>
                <p>
                  <strong>Resume:</strong>
                  {formData.personal.resumeUrl ? (
                    <a href={formData.personal.resumeUrl} target="_blank" rel="noopener noreferrer">
                      View Resume
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </p>
                <p>
                  <strong>Video Resume:</strong>
                  {formData.personal.videoResumeUrl ? (
                    <a href={formData.personal.videoResumeUrl} target="_blank" rel="noopener noreferrer">
                      View Video Resume
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </p>
                <p>
                  <strong>Date of Birth:</strong> {formData.personal.dob || "Not provided"}
                </p>
                <p>
                  <strong>Gender:</strong> {formData.personal.gender || "Not provided"}
                </p>
              </SummarySection>

              <SummarySection title="Job History" stepToEdit={1} setStep={setStep}>
                {formData.isFresher ? (
                  <p className="no-data">Fresher - No job history provided</p>
                ) : formData.jobHistory.length > 0 ? (
                  formData.jobHistory.map((job, index) => (
                    <div key={index} className="summary-entry">
                      <p>
                        <strong>Company:</strong> {job.company || "Not provided"}
                      </p>
                      <p>
                        <strong>Position:</strong> {job.position || "Not provided"}
                      </p>
                      <p>
                        <strong>Period:</strong> {job.startDate || "N/A"} - {job.endDate || "Present"}
                      </p>
                      <p>
                        <strong>Description:</strong> {job.description || "Not provided"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No job history provided</p>
                )}
              </SummarySection>

              <SummarySection title="Education History" stepToEdit={2} setStep={setStep}>
                {formData.educationHistory.length > 0 ? (
                  formData.educationHistory.map((edu, index) => (
                    <div key={index} className="summary-entry">
                      <p>
                        <strong>Degree:</strong> {edu.degree || "Not provided"}
                      </p>
                      <p>
                        <strong>Institution:</strong> {edu.institution || "Not provided"}
                      </p>
                      <p>
                        <strong>Field:</strong> {edu.field || "Not provided"}
                      </p>
                      <p>
                        <strong>Year:</strong> {edu.graduationYear || "Not provided"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No education history provided</p>
                )}
              </SummarySection>

              <SummarySection title="Professional Details" stepToEdit={3} setStep={setStep}>
                <p>
                  <strong>Job Title:</strong> {formData.professional.jobTitle || "Not provided"}
                </p>
                <p>
                  <strong>Company:</strong> {formData.professional.company || "Not provided"}
                </p>
                <p>
                  <strong>Experience:</strong> {formData.professional.experience || "0"} years
                </p>
                <p>
                  <strong>Skills:</strong>
                  {formData.professional.skills.length > 0
                    ? formData.professional.skills.join(", ")
                    : "Not provided"}
                </p>
              </SummarySection>

              <SummarySection title="Job Preferences" stepToEdit={4} setStep={setStep}>
                <p>
                  <strong>Roles:</strong>
                  {formData.jobPrefs.roles.length > 0
                    ? formData.jobPrefs.roles.join(", ")
                    : "Not provided"}
                </p>
                <p>
                  <strong>Locations:</strong>
                  {formData.jobPrefs.locations.length > 0
                    ? formData.jobPrefs.locations.join(", ")
                    : "Not provided"}
                </p>
                <p>
                  <strong>Salary:</strong> {formData.jobPrefs.salary || "Not provided"}
                </p>
                <p>
                  <strong>Type:</strong>
                  {formData.jobPrefs.employmentType.length > 0
                    ? formData.jobPrefs.employmentType.join(", ")
                    : "Not provided"}
                </p>
              </SummarySection>

              <SummarySection title="Auto Job Preferences" stepToEdit={5} setStep={setStep}>
                <p>
                  <strong>Auto Apply:</strong> {formData.autoJobPrefs.enabled ? "Enabled" : "Disabled"}
                </p>
                <p>
                  <strong>Minimum Salary:</strong> {formData.autoJobPrefs.minSalary || "0"} LPA
                </p>
                <p>
                  <strong>Experience Level:</strong> {formData.autoJobPrefs.experienceLevel || "Not specified"}
                </p>
                <p>
                  <strong>Categories:</strong>
                  {formData.autoJobPrefs.categories.length > 0
                    ? formData.autoJobPrefs.categories.join(", ")
                    : "Not specified"}
                </p>
                <p>
                  <strong>Skills:</strong>
                  {formData.autoJobPrefs.skills.length > 0
                    ? formData.autoJobPrefs.skills.join(", ")
                    : "Not specified"}
                </p>
                <p>
                  <strong>Remote Only:</strong> {formData.autoJobPrefs.remoteOnly ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Minimum Company Rating:</strong> {formData.autoJobPrefs.minCompanyRating || "0"}
                </p>
              </SummarySection>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const SummarySection = ({ title, children, stepToEdit, setStep }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <div className="summary-group">
        <div className="summary-header" onClick={() => setIsOpen(!isOpen)}>
          <h4>{title}</h4>
          <div className="summary-actions">
            <button
              className="edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                setStep(stepToEdit);
              }}
            >
              Edit
            </button>
            <span className={`toggle-icon ${isOpen ? "open" : ""}`}>
              {isOpen ? "▼" : "▶"}
            </span>
          </div>
        </div>
        <div className={`summary-body ${isOpen ? "open" : ""}`}>{children}</div>
      </div>
    );
  };

  return (
    <div className="p-main">
      <div className="pre-holder">
        <div className="pre-card">
          {isLoading && <div className="loading-overlay">Loading profile...</div>}

          <div className="progress-bar">
            <div className="progress" style={{ width: `${(step / 6) * 100}%` }}></div>
          </div>

          {renderStep()}

          <div className="pre-buttons">
            {step > 0 && (
              <button
                onClick={prevStep}
                className="back-btn"
                disabled={isSubmitting || isLoading}
              >
                Back
              </button>
            )}
            {step < 6 && (
              <button
                onClick={skipStep}
                className="skip-btn"
                disabled={isSubmitting || isLoading}
              >
                Skip
              </button>
            )}
            {step < 5 ? (
              <button
                onClick={nextStep}
                className="next-btn"
                disabled={isSubmitting || isLoading}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="form-submit-btn"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? (
                  <span className="spinner"></span>
                ) : step === 6 ? (
                  "Confirm & Submit"
                ) : (
                  "Review"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileForm;