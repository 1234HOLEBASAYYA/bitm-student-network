import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users, Share2, MessageSquare, BookOpen, Briefcase, Calendar,
  ArrowRight, ShieldCheck, CheckCircle2, Award, Sparkles, Building,
  Compass, ExternalLink, MapPin
} from 'lucide-react';
import bitmCampusImg from '../assets/images/bitm-campus.jpg';
import bitmCampusTheatre from '../assets/images/bitm-campus-theatre.jpg';
import bitmLogo from '../assets/images/bitm-logo.png';
import '../styles/landing.css';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Users size={28} className="feat-icon" />,
      title: 'Peer Networking & Mentorship',
      desc: 'Connect with peers, seniors, and alumni across 8 BITM engineering departments. Share guidance on coursework and career paths.'
    },
    {
      icon: <Share2 size={28} className="feat-icon" />,
      title: 'Campus Community Feed',
      desc: 'Stay informed with real-time academic updates, technical breakthroughs, hackathon victories, and college announcements.'
    },
    {
      icon: <BookOpen size={28} className="feat-icon" />,
      title: 'Technical Discussion Forum',
      desc: 'Ask complex programming, DSA, and engineering questions. Get answers from knowledgeable students and mark accepted solutions.'
    },
    {
      icon: <Briefcase size={28} className="feat-icon" />,
      title: 'Project Collaboration',
      desc: 'Publish your software and hardware projects. Discover teammates with complementary skills for mini projects and national hackathons.'
    },
    {
      icon: <Award size={28} className="feat-icon" />,
      title: 'Internships & Placements',
      desc: 'Access verified internships, off-campus hiring drives, hackathon registrations, and official campus recruitment notifications.'
    },
    {
      icon: <Calendar size={28} className="feat-icon" />,
      title: 'Workshops & Events',
      desc: 'RSVP to technical workshops, coding bootcamps, guest lectures, and the flagship annual fest BITM INVENTO.'
    }
  ];

  const stats = [
    { number: '1,200+', label: 'Registered Students' },
    { number: '8', label: 'Engineering Departments' },
    { number: '150+', label: 'Collaborative Projects' },
    { number: '95%', label: 'Active Placement Drives' }
  ];

  const departments = [
    'Computer Science & Engineering',
    'Artificial Intelligence & Machine Learning',
    'Information Science & Engineering',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Management Studies (MBA)'
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} /> Official Ballari Institute of Technology &amp; Management Platform
            </div>
            <h1 className="hero-headline">
              Connect. Collaborate. <br />
              <span className="hero-highlight">Learn. Grow Together.</span>
            </h1>
            <p className="hero-subtitle">
              A dedicated professional networking and knowledge-sharing platform for BITM students. Build your professional portfolio, collaborate on engineering projects, and accelerate your placement preparation.
            </p>

            <div className="hero-cta-group">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Go to Your Dashboard <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Join BITM Network <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg">
                    Student Login
                  </Link>
                </>
              )}
            </div>

            <div className="hero-trust">
              <div className="trust-item">
                <CheckCircle2 size={16} className="trust-icon" />
                <span>Verified BITM Students</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={16} className="trust-icon" />
                <span>VTU Curriculum Aligned</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={16} className="trust-icon" />
                <span>Safe Campus Community</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="campus-image-card">
              <img
                src={bitmCampusImg}
                alt="BITM Campus Ballari - Admin & PG Block"
                className="campus-img"
              />
              <div className="campus-caption">
                <div className="caption-badge">Jnana Gangotri Campus</div>
                <h4>Ballari Institute of Technology &amp; Management</h4>
                <p>Administrative &amp; PG Block • Hospet Road, Ballari - 583104 • NAAC 'A+'</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Statistics Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <h3 className="stat-num">{stat.number}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About The Platform Section */}
      <section className="about-section">
        <div className="container about-container">
          <div className="about-header">
            <span className="section-tag">About The Platform</span>
            <h2>Bridging Classrooms, Labs, and Career Opportunities</h2>
            <p className="section-subtitle">
              The BITM Student Network was designed specifically to eliminate knowledge silos across semesters and departments, providing every Ballari engineering student with an interactive LinkedIn-style portal tailored to our college ecosystem.
            </p>
          </div>

          <div className="about-cards-grid">
            <div className="card about-card">
              <div className="card-accent-bar"></div>
              <h3>Empowering Student Innovation</h3>
              <p>
                From final-year capstone projects to smart campus ideas, find like-minded collaborators skilled in AI, Cloud, Embedded Systems, and Web Technologies.
              </p>
            </div>
            <div className="card about-card">
              <div className="card-accent-bar"></div>
              <h3>Placement &amp; Career Acceleration</h3>
              <p>
                Direct access to on-campus recruitment alerts, mock test preparations, technical interview experiences, and off-campus internships.
              </p>
            </div>
            <div className="card about-card">
              <div className="card-accent-bar"></div>
              <h3>Faculty &amp; Club Integration</h3>
              <p>
                Stay updated with official college notices, Departmental symposiums, IEEE/CSI club activities, and the annual BITM INVENTO fest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Core Features</span>
            <h2>Everything You Need to Excel at BITM</h2>
            <p className="section-subtitle">
              Comprehensive tools designed to support your entire academic journey from 1st semester induction through graduation.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feat, idx) => (
              <div key={idx} className="card card-hoverable feature-card">
                <div className="feature-icon-box">{feat.icon}</div>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="departments-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Academic Disciplines</span>
            <h2>Connecting Students Across All BITM Departments</h2>
            <p className="section-subtitle">
              Network with fellow engineers and scholars from across our diverse academic branches.
            </p>
          </div>

          <div className="dept-grid">
            {departments.map((dept, idx) => (
              <div key={idx} className="dept-chip">
                <Building size={16} className="dept-icon" />
                <span>{dept}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Infrastructure & Campus Life Section */}
      <section className="campus-showcase-section">
        <div className="container">
          <div className="campus-showcase-grid">
            <div className="campus-showcase-img-box card">
              <img
                src={bitmCampusTheatre}
                alt="BITM Open Air Theatre & Academic Blocks"
                className="campus-theatre-img"
              />
              <div className="theatre-caption">
                <strong>BITM Open Air Theatre &amp; Academic Quadrangle</strong>
                <span>Jnana Gangotri Campus, Ballari</span>
              </div>
            </div>

            <div className="campus-showcase-content">
              <span className="section-tag">Campus Infrastructure</span>
              <h2>A Vibrant Environment Designed for Student Innovation</h2>
              <p className="campus-showcase-desc">
                Spread across lush green acres on Hospet Road, Ballari, BITM features state-of-the-art computing centers, specialized AI &amp; IoT labs, modern lecture halls, and the open-air theatre where campus fests, hackathon pitches, and cultural events come alive.
              </p>

              <div className="showcase-highlights-list">
                <div className="showcase-highlight-item">
                  <div className="highlight-dot"></div>
                  <div>
                    <strong>Advanced Computing Centers:</strong> High-performance workstations with cloud and GPU access for Machine Learning research.
                  </div>
                </div>
                <div className="showcase-highlight-item">
                  <div className="highlight-dot"></div>
                  <div>
                    <strong>Innovation &amp; Incubation Center:</strong> Dedicated mentoring for student startups, patents, and Smart India Hackathon prototypes.
                  </div>
                </div>
                <div className="showcase-highlight-item">
                  <div className="highlight-dot"></div>
                  <div>
                    <strong>Training &amp; Placement Cell:</strong> Year-round campus placement training with leading IT and core engineering companies.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why BITM Network Section */}
      <section className="why-section">
        <div className="container why-container">
          <div className="why-card card">
            <div className="why-content">
              <span className="section-tag">Why Join?</span>
              <h2>Your Gateway to Engineering Excellence in Ballari</h2>
              <ul className="why-list">
                <li>
                  <CheckCircle2 size={20} className="check-icon" />
                  <div>
                    <strong>Exclusive to BITM Ballari:</strong> Connect with students who attend the exact same lectures, labs, and VTU curriculum.
                  </div>
                </li>
                <li>
                  <CheckCircle2 size={20} className="check-icon" />
                  <div>
                    <strong>Showcase Your Projects:</strong> Build a persistent portfolio highlighting your GitHub repositories, certifications, and awards.
                  </div>
                </li>
                <li>
                  <CheckCircle2 size={20} className="check-icon" />
                  <div>
                    <strong>Verified Campus Placements:</strong> Direct alerts on TCS, Infosys, Tech Mahindra, and startup recruitment drives.
                  </div>
                </li>
                <li>
                  <CheckCircle2 size={20} className="check-icon" />
                  <div>
                    <strong>Safe &amp; Moderated:</strong> Full-time administrative oversight ensuring a respectful, focused academic atmosphere.
                  </div>
                </li>
              </ul>
              <div className="why-cta">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Create Your Free Student Profile <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
