import React, { useState, useEffect } from "react";
import SignUpImg from "../Assests/SignUp.svg";
import "../styles/Signup.css";
import axios from "axios";
import { FaAt, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      // Redirect to user dashboard if logged in
      navigate("/profileComp");
    }
  }, [navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        { name, email, password },
        { withCredentials: true }
      );
      localStorage.setItem("user", JSON.stringify(res.data));
      alert("Signup successful! Let’s complete your profile.");
      navigate("/profileForm");
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className="signup-main-container">
      <div className="signup-container">
        <div className="signup-img-container">
          <img src={SignUpImg} alt="Signup Illustration" />
        </div>

        <form className="signup-form" onSubmit={handleSignUp}>
          <h1 className="signup-title">Create Your Account</h1>

          <div className="signup-field">
            <FaAt className="signup-icon" />
            <input
              type="text"
              name="signup-name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="signup-input signup-name-input"
              required
            />
          </div>

          <div className="signup-field">
            <FaAt className="signup-icon" />
            <input
              type="email"
              name="signup-email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="signup-input signup-email-input"
              required
            />
          </div>

          <div className="signup-field">
            <span
              className="signup-icon"
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            <input
              type={showPassword ? "text" : "password"}
              name="signup-password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              className="signup-input signup-password-input"
              required
            />
          </div>

          <div className="signup-field">
            <span
              className="signup-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ cursor: "pointer" }}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="signup-confirm-password"
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="signup-input signup-confirm-password-input"
              required
            />
          </div>

          <button type="submit" className="signup-btn">
            Sign Up
          </button>

          {/* <button type="button" className="signup-google-btn">
            Sign Up with Google
          </button> */}

          <p className="signup-login-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;