import React, { useState } from "react";
import SignUpImg from "../Assests/SignUp.svg";
import "../styles/Signup.css";
import axios from "axios";
import { FaAt, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

      alert("Signup successful!");
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed.");
    }
  };
  return (
    <div className="main-container">
      <div className="login-container">
        <div className="img-container">
          <img src={SignUpImg} alt="Signup Illustration" />
        </div>

        <form className="loginForm" onSubmit={handleSignUp}>
          <p className="login-txt">SignUp</p>

          <span className="email-field">
            {/* <FaAt /> */}
            <input
              type="text"
              name="Name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your Name"
              className="login-input"
              required
            />
          </span>
          <span className="email-field">
            <FaAt />
            <input
              type="text"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="login-input"
              required
            />
          </span>

          <span className="email-field">
            <FaEye />
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
          </span>

          <span className="email-field">
            <FaEyeSlash />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="login-input"
            />
          </span>

          <button type="submit" className="btn">
            SignUp
          </button>
          <p className="g-btn">Google</p>
          <p className="acc">
            Have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
