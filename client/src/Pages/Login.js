import React, { useEffect, useState } from "react";
import "../styles/Login.css";
import axios from "axios";
import LoginImg from "../Assests/Login.svg";
import { FaAt, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/profileComp");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/profileComp");
    } catch (error) {
      console.error("Error logging in:", error);
      alert(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="login-main-container">
      <div className="login-container">
        <div className="login-img-container">
          <img src={LoginImg} alt="Login Illustration" />
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h1 className="login-title">Welcome Back</h1>

          <div className="login-field">
            <FaAt className="login-icon" />
            <input
              type="email"
              name="login-email"
              placeholder="Email Address"
              className="login-input login-email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <span
              className="login-icon"
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            <input
              type={showPassword ? "text" : "password"}
              name="login-password"
              placeholder="Password"
              className="login-input login-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Log In
          </button>

          <button type="button" className="login-google-btn">
            Log In with Google
          </button>

          <p className="login-signup-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;