import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "" });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      navigate("/login");
    } else {
      setUser(userData);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div className="profile-info">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      <div className="profile-actions">
        <button className="btn logout" onClick={handleLogout}>
          Logout
        </button>
        <Link to="/jobPostingForm">
          <button className='btn'>Post Job</button>
        </Link>
        <Link to="/postList">
          <button className='btn'>Post List</button>
        </Link>
        <Link to='/jobDetail'>
          <button className='btn'>Job Detail</button>
        </Link>
        <Link to="/profileComp">
        <button className='btn'>Profile Component</button>
        </Link>
      </div>
    </div>
  );
}

export default ProfilePage;