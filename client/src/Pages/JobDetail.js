import React, { useState } from "react";
import "../styles/JobDetail.css";
import CompImg from "../Assests/CompLogo.png"
function JobDetail() {
  const [sectionOrder, setSectionOrder] = useState([
    "Description",
    "Key Responsibilities",
    "Role & Experience",
  ]);

  const sections = {
    "Description": (
      <>
        <h2>Description</h2>
        <p>
          I am a Full Stack Web Developer with 2+ years of experience in
          building high-performance web applications. My expertise lies in HTML,
          CSS, JavaScript, and React.js, and I have a strong understanding of
          both frontend and backend development. Over the years, I have worked
          on a variety of projects, ranging from dynamic web applications to
          e-commerce platforms and interactive user interfaces. My primary focus
          has always been on creating seamless, responsive, and visually
          appealing websites that enhance user experience and functionality.
        </p>
      </>
    ),
    "Key Responsibilities": (
      <>
        <h2>Key Responsibilities</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="content">
              <h3>
                Bachelors in Fine Arts <span className="year">2012 - 2014</span>
              </h3>
              <p className="college">Modern College</p>
              <p className="description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a
                ipsum tellus. Interdum et malesuada fames ac ante ipsum primis
                in faucibus.
              </p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="content">
              <h3>
                Computer Science <span className="year">2008 - 2012</span>
              </h3>
              <p className="college">Harvard University</p>
              <p className="description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a
                ipsum tellus. Interdum et malesuada fames ac ante ipsum primis
                in faucibus.
              </p>
            </div>
          </div>
        </div>
      </>
    ),
    "Role & Experience": (
      <>
        <h2>Role & Experience</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="content">
              <h3>
                Bachelors in Fine Arts <span className="year">2012 - 2014</span>
              </h3>
              <p className="college">Modern College</p>
              <p className="description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a
                ipsum tellus. Interdum et malesuada fames ac ante ipsum primis
                in faucibus.
              </p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="content">
              <h3>
                Computer Science <span className="year">2008 - 2012</span>
              </h3>
              <p className="college">Harvard University</p>
              <p className="description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a
                ipsum tellus. Interdum et malesuada fames ac ante ipsum primis
                in faucibus.
              </p>
            </div>
          </div>
        </div>
      </>
    ),
  };

  const handleTabClick = (tab) => {
    setSectionOrder((prevOrder) => {
      const newOrder = [...prevOrder];
      const index = newOrder.indexOf(tab);
      if (index > -1) {
        newOrder.splice(index, 1);
        newOrder.unshift(tab);
      }
      return newOrder;
    });
  };

  return (
    <div className="main-container">
      <div className="jobDetail-container">
        <div className="jobDetail-holder">
          <div className="img-container1">
            <img src={CompImg} alt="" />
          </div>
          <div className="jobDetail-dets">
            <h3>Full Stack Web Developer</h3>
            <p>Wrogan Tech Support</p>
            <h3>⭐⭐⭐⭐⭐</h3>
            <div className="jobLocation">
            <p><span><i class="fa-solid fa-location-dot"></i></span></p>
            <p>John Doe resides at 123 Maplewood Drive, Springfield, Illinois, 62704, in the United States</p>
            </div>
          </div>
          <div className="editJobDetail">
            <button className="Jobbtn1">Apply</button>
            <button className="Jobbtn1 btn-cv">Share</button>
          </div>
        </div>

        <div className="section2">
          <div className="list-first">
            <div className="section-buttons" style={{ marginBottom: "20px" }}>
              {["Description", "Key Responsibilities", "Role & Experience"].map(
                (tab) => {
                  const isActive = tab === sectionOrder[0];
                  return (
                    <button
                      key={tab}
                      onClick={() => handleTabClick(tab)}
                      className={isActive ? "Jobbtn active-tab" : "Jobbtn inactive-tab"}
                    >
                      {tab}
                    </button>

                  );
                }
              )}
            </div>

            <hr style={{ marginBottom: "25px" }} />

            <div className="about-me">
              <div className="about-holder">
                {sectionOrder.map((tab) => (
                  <div
                    key={tab}
                    className="section-block"
                    style={{ marginBottom: "30px" }}
                  >
                    {sections[tab]}
                  </div>
                ))}
              </div>

              {/* Right Panel - DO NOT TOUCH */}
              <div className="adv">
                <div className="overview">
                  <h3 className="title">Overview</h3>
                  <hr />
                  <p className="short-dets">
                    <i className="fa-solid fa-briefcase"></i>
                    <span style={{ marginLeft: "20px" }}>Experience</span>
                  </p>
                  <p className="dets">2-4 years</p>

                  <p className="short-dets">
                    <i className="fa-solid fa-sack-dollar"></i>
                    <span style={{ marginLeft: "20px" }}>Expected Salary</span>
                  </p>
                  <p className="dets">3 LPA to 6 LPA</p>

                  <p className="short-dets">
                    <i className="fa-solid fa-graduation-cap"></i>
                    <span style={{ marginLeft: "20px" }}>Education Level</span>
                  </p>
                  <p className="dets grad">Graduate</p>

                  <p className="short-dets">
                    <i className="fa-solid fa-microphone"></i>
                    <span style={{ marginLeft: "20px" }}>Language</span>
                  </p>
                  <p className="dets lang">English, Hindi, Gujarati</p>

                  <p className="short-dets">
                    <i className="fa-solid fa-envelope"></i>
                    <span style={{ marginLeft: "20px" }}>Email</span>
                  </p>
                  <p className="dets lang">johndoe787@gmail.com</p>

                  <button className="Jobbtn1 SM" style={{ marginTop: "20px" }}>
                    Send Message
                  </button>
                </div>

                <div className="overview">
                  <h3 className="title">Skills</h3>
                  <hr />
                  <div className="skills-list">
                    <div className="skillColor">FrontEnd</div>
                    <div className="skillColor">FrontEnd</div>
                    <div className="skillColor">FrontEnd</div>
                    <div className="skillColor">FrontEnd</div>
                    <div className="skillColor">FrontEnd</div>
                  </div>
                </div>
              </div>
              {/* End Right Panel */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;
