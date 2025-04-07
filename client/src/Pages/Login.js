import React, { useEffect, useState } from "react";
import "../styles/Login.css";
import axios from "axios";
import LoginImg from "../Assests/Login.svg";
import { Link, useNavigate } from "react-router-dom";

function Login () {
    const navigate = useNavigate(); // ✅ correct hook
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
          navigate("/profile"); // use navigate instead of Navigate()
        }
      }, [navigate]);

      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const res = await axios.post(
            'http://localhost:5000/api/auth/login',
            { email, password },
            { withCredentials: true }
          );
      
          localStorage.setItem("user", JSON.stringify(res.data));
      
          // ✅ Redirect to profile page after successful login
          navigate("/profile");
        } catch (error) {
          console.error("Error logging in:", error);
          alert(error.response?.data?.message || "Login Failed");
        }
      };

  return (
    <div className="main-container">
      <div className="login-container">
        <form className="loginForm" onSubmit={handleSubmit}>
          <p className="login-txt">Login</p>

          <span className="email-field">
            <i className="fa-solid fa-at"></i>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </span>

          <span className="email-field">
            <i className="fa-solid fa-eye"></i>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </span>

          <button type="submit" className="btn">Submit</button>
          <button type="button" className="g-btn">Google</button>

          <p className="acc">
            Don't have an account? <Link to="/signup">SignUp</Link>
          </p>
        </form>

        <div className="img-container">
          <img src={LoginImg} alt="Programmer Illustration" />
        </div>
      </div>
    </div>
  );
};

export default Login;
