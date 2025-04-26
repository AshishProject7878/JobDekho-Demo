import React, { useState, useEffect } from 'react';
import "../styles/Navbar.css";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const API_URL = `${BASE_URL}/api/profile`;

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      setProfileData(response.data);
    } catch (error) {
      console.error('Failed to fetch profile data for navbar:', error);
      setProfileData({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      setIsLoggedIn(false);
      setIsLoading(false); // No need to fetch profile data
    } else {
      setIsLoggedIn(true);
      fetchProfileData();
    }
  }, [navigate]);

  return (
    <div className='Nv-main'>
      <div className='Nv-container'>
        <div className='Nv-logo'>
          <div className='Lg-left'>
            <p>J</p>
          </div>
          <div className='Lg-right'>
            <p>JobDekho</p>
            <p className='slogan'>Find Your Dream Jobs Now!</p>
          </div>
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={`Nv-links ${menuOpen ? "active" : ""}`}>
          <li className='NVL-tags'>
            <Link to="/">Home</Link>
          </li>
          <li className='NVL-tags'>
            <Link to="/dummyProfile">Search</Link>
          </li>
          <li className='NVL-tags'>
            <Link to="/profileList">Job Seekers</Link>
          </li>
          <li className='NVL-tags'>
            <Link to="/jobPostingForm">Post Job</Link>
          </li>
          <li className='NVL-tags'>
            <Link to="/postList">Post List</Link>
          </li>
          <li className='NVL-tags'>
            <Link to="/auto-job/prefs">Auto Job Prefs</Link>
          </li>
          {/* <li className='NVL-tags'><a href='#'>Dashboard</a></li> */}
          <li className='Lg-profile'>
            <Link to={isLoggedIn ? "/profileComp" : "/login"}>
              {isLoading && isLoggedIn ? (
                <span>Loading...</span>
              ) : (
                <img
                  src={
                    isLoggedIn && profileData?.personal?.profilePicture
                      ? profileData.personal.profilePicture
                      : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
                  }
                  alt="Profile"
                  className="navbar-profile-pic"
                  onError={(e) => {
                    console.error('Navbar profile picture failed to load:', profileData?.personal?.profilePicture);
                    e.target.src =
                      'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                  }}
                />
              )}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;