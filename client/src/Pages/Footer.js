import React from 'react';
import '../styles/Footer.css';

function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-wrapper">
                <div className="footer-block">
                    <h3 className="footer-heading">About Us</h3>
                    <p className="footer-text">Your trusted platform for job opportunities.</p>
                </div>
                <div className="footer-block">
                    <h3 className="footer-heading">Quick Links</h3>
                    <ul className="footer-links">
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Jobs</a></li>
                        <li><a href="#">Companies</a></li>
                        <li><a href="#">Contact</a></li>
                    </ul>
                </div>
                <div className="footer-block">
                    <h3 className="footer-heading">Contact Us</h3>
                    <p className="footer-text">Email: support@jobportal.com</p>
                    <p className="footer-text">Phone: +1 234 567 890</p>
                    <p className="footer-text">Address: 123 Job Street, City</p>
                </div>
            </div>
            <div className="footer-socials">
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-linkedin-in"></i></a>
            </div>
            <div className="footer-bottom">
                © 2025 JobDekho. All Rights Reserved.
            </div>
        </footer>
    );
}

export default Footer;