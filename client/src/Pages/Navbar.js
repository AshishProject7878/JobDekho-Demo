import React, { useState } from 'react';
import "../styles/Navbar.css";
import { FaBars, FaTimes } from "react-icons/fa"; // Importing icons

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <li className='NVL-tags'><a href='#'>Home</a></li>
          <li className='NVL-tags'><a href='#'>Search</a></li>
          <li className='NVL-tags'><a href='#'>Trending-Jobs</a></li>
          <li className='NVL-tags'><a href='#'>Dashboard</a></li>
          <li className='Lg-profile'><a href='#'>P</a></li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
