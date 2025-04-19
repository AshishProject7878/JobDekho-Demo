import React, { useEffect, useRef, useState } from 'react';
import "../styles/HomePage.css";
import Hero from "../Assests/Enthusiastic-bro.svg";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import GoogleLogo from "../Assests/Google.png";
import AmazonLogo from "../Assests/Amazon.png";
import FaceLogo from "../Assests/Facebook.png";
import NetflixLogo from "../Assests/Netflix.png";
import CompLogo from "../Assests/CompLogo.png"; 
import api from '../api'; 

// Company logos 
const companies = [
    { id: 1, name: "Google", logo: GoogleLogo },
    { id: 2, name: "Amazon", logo: AmazonLogo },
    { id: 3, name: "Microsoft", logo: GoogleLogo },
    { id: 4, name: "Netflix", logo: NetflixLogo },
    { id: 5, name: "Facebook", logo: FaceLogo }
];

function HomePage() {
    const swiperRef = useRef(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to format salary object into a string
    const formatSalary = (salary) => {
        if (!salary || typeof salary !== 'object' || !salary.min || !salary.max) {
            return 'Not disclosed';
        }
        const { min, max, currency } = salary;
        const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '';
        return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()} / Year`;
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setScrollPosition(scrollY);

            if (swiperRef.current) {
                const swiperInstance = swiperRef.current.swiper;
                swiperInstance.slideTo(Math.floor(scrollY / 100));
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const fetchJobs = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/api/posts', { withCredentials: true });
                const allJobs = response.data;
                // Select 8 random jobs
                const shuffled = allJobs.sort(() => 0.5 - Math.random());
                const selectedJobs = shuffled.slice(0, 8);
                setJobs(selectedJobs);
            } catch (err) {
                console.error('Error fetching jobs:', err);
                setError('Failed to load job postings. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, []);

    return (
        <div className='Home-main'>
            <div className='Home-header'>
                <div className='Home-Section-1'>
                    <p className='hero-title'>
                        Find Your Next Career <br /> Opportunity with Ease!
                    </p>
                    <form>
                        <input type="text" placeholder="Search jobs" className='hero-search'/>
                        <select className='hero-search'>
                            <option>Industry</option>
                            <option>IT</option>
                            <option>Finance</option>
                            <option>Healthcare</option>
                        </select>
                        <select className='hero-search'>
                            <option>Location</option>
                            <option>New York</option>
                            <option>San Francisco</option>
                            <option>Los Angeles</option>
                        </select>
                        <p className='hero-search HS-right'>Search</p>
                    </form>
                </div>
                <div className='Home-Section-2'>
                    <img src={Hero} alt="Hero Section"/>
                </div>
            </div>

            {/* ----------------------- Mid Section (Company Carousel) --------------------- */}
            <div className='Mid-Section'>
                <h2 className="carousel-title">Top Hiring Companies</h2>
                
                {/* Blur Effect Wrapper */}
                <div className="carousel-wrapper">
                    <Swiper
                        ref={swiperRef}
                        slidesPerView={4}
                        spaceBetween={20}
                        loop={true}
                        className="company-carousel"
                    >
                        {companies.map((company) => (
                            <SwiperSlide key={company.id}>
                                <div className="company-card">
                                    <img src={company.logo} alt={company.name} />
                                    <p>{company.name}</p>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>

            {/* ----------------------- Trending Jobs Section --------------------- */}
            <div className="hp-trending-jobs-section">
                <h2 className="hp-trending-jobs-title">Trending Jobs</h2>
                {isLoading ? (
                    <div className="hp-loading">Loading jobs...</div>
                ) : error ? (
                    <div className="hp-error">{error}</div>
                ) : (
                    <div className="hp-trending-jobs-container">
                        {jobs.map((job) => (
                            <div key={job._id} className="hp-job-card">
                                <div className="hp-job-card-header">
                                    <span className="hp-job-badge">Featured</span>
                                    <i className="fa-solid fa-bookmark hp-job-bookmark-icon"></i>
                                </div>
                                <div className="hp-job-card-body">
                                    <div className="hp-company-info">
                                        <img src={CompLogo} alt="Company Logo" className="hp-company-logo" />
                                        <div className="hp-company-details">
                                            <h3 className="hp-job-title">{job.title || 'Untitled Job'}</h3>
                                            <p className="hp-company-name">{job.company || 'Unknown Company'}</p>
                                            <div className="hp-job-location">
                                                <i className="fa-solid fa-location-dot"></i> {job.location || 'Remote'}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="hp-job-description">
                                        {job.description?.substring(0, 30) || 'No description available'}...
                                    </p>
                                    <div className="hp-job-tags">
                                        {(job.skills || []).map((skill, index) => (
                                            <span key={index} className="hp-job-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="hp-job-card-footer">
                                    <span className="hp-job-salary">{formatSalary(job.salary)}</span>
                                    <button className="hp-apply-button">Quick Apply</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ----------------------- Why Us Section --------------------- */}
            <div className="why-us-section">
                <h2 className="why-us-title">Why Choose Us?</h2>
                <p className="why-us-subtitle">
                    Elevate your job search experience with our cutting-edge features!
                </p>
                <div className="why-us-container">
                    <div className="why-us-card">
                        <div className="icon-wrapper">
                            <i className="fa-solid fa-robot feature-icon"></i>
                        </div>
                        <h3>Auto Job Application</h3>
                        <p>Automate your job applications and increase your chances effortlessly.</p>
                    </div>
                    <div className="why-us-card">
                        <div className="icon-wrapper">
                            <i className="fa-solid fa-video feature-icon"></i>
                        </div>
                        <h3>Short Video Resume</h3>
                        <p>Make a strong first impression with a quick and engaging video resume.</p>
                    </div>
                    <div className="why-us-card">
                        <div className="icon-wrapper">
                            <i className="fa-solid fa-bolt feature-icon"></i>
                        </div>
                        <h3>Quick Apply</h3>
                        <p>Apply for jobs instantly with one click and get hired faster!</p>
                    </div>
                </div>
            </div>

            {/* ----------------------- Subscription Section --------------------- */}
            <div className="subscription-section">
                <h2 className="subscription-title">Stay Updated!</h2>
                <p className="subscription-subtitle">
                    Subscribe to get the latest job updates and career insights straight to your inbox.
                </p>
                <div className="subscription-form">
                    <input type="email" placeholder="Enter your email" className="subscription-input" required />
                    <button type="submit" className="subscription-button">Subscribe</button>
                </div>
            </div>

            {/* ----------------------- Footer Section --------------------- */}
            <footer className="site-footer">
                <div className="footer-wrapper">
                    {/* About Section */}
                    <div className="footer-block">
                        <h3 className="footer-heading">About Us</h3>
                        <p className="footer-text">Your trusted platform for job opportunities. Find your dream job effortlessly.</p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-block">
                        <h3 className="footer-heading">Quick Links</h3>
                        <ul className="footer-links">
                            <li><a href="#">Home</a></li>
                            <li><a href="#">Jobs</a></li>
                            <li><a href="#">Companies</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div className="footer-block">
                        <h3 className="footer-heading">Contact Us</h3>
                        <p className="footer-text">Email: support@jobportal.com</p>
                        <p className="footer-text">Phone: +1 234 567 890</p>
                        <p className="footer-text">Address: 123 Job Street, City, Country</p>
                    </div>
                </div>

                {/* Social Media Icons */}
                <div className="footer-socials">
                    <a href="#"><i className="fab fa-facebook-f"></i></a>
                    <a href="#"><i className="fab fa-twitter"></i></a>
                    <a href="#"><i className="fab fa-instagram"></i></a>
                    <a href="#"><i className="fab fa-linkedin-in"></i></a>
                </div>

                {/* Copyright */}
                <div className="footer-bottom">
                    © 2025 JobDekho. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
}

export default HomePage;