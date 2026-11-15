import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import {
  Users, Share2, MessageSquare, BookOpen, Briefcase, Calendar,
  ArrowRight, ShieldCheck, CheckCircle2, Award, Sparkles, Building,
  Compass, ExternalLink, MapPin, Zap, Code, Trophy, ChevronDown
} from 'lucide-react';
import ConnectedCommunityCanvas from '../components/3d/ConnectedCommunityCanvas';
import { TextEffect } from '@/components/core/text-effect';
import { TextLoop } from '@/components/core/text-loop';
import { TextShimmer } from '@/components/core/text-shimmer';
import { AnimatedNumber } from '@/components/core/animated-number';
import { Magnetic } from '@/components/core/magnetic';
import { AnimatedGroup } from '@/components/core/animated-group';
import { InView } from '@/components/core/in-view';
import { Spotlight } from '@/components/core/spotlight';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/core/accordion';
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
    { number: 1200, suffix: '+', label: 'Registered Students' },
    { number: 8, suffix: '', label: 'Engineering Departments' },
    { number: 150, suffix: '+', label: 'Collaborative Projects' },
    { number: 95, suffix: '%', label: 'Active Placement Drives' }
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
      {/* 3D Interactive Hero Section */}
      <section className="hero-section">
        {/* Three.js 3D Connected Community Canvas Background */}
        <ConnectedCommunityCanvas className="hero-canvas-background" />

        <div className="container hero-container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="hero-badge">
              <Sparkles size={16} />
              <TextShimmer duration={2.4} spread={2.5} className="hero-shimmer-badge">
                Official Ballari Institute of Technology &amp; Management Platform
              </TextShimmer>
            </div>
            <h1 className="hero-headline">
              <TextEffect per="word" preset="blur" delay={0.15}>
                Connect. Collaborate. Learn. Grow Together.
              </TextEffect>
            </h1>
            <div className="hero-subtitle">
              <div className="hero-loop-tagline">
                <strong>Your college community. </strong>
                <TextLoop interval={3} className="hero-dynamic-loop">
                  <span>Your professional network.</span>
                  <span>Your pathway to placement success.</span>
                  <span>Your future in engineering.</span>
                </TextLoop>
              </div>
              <p style={{ marginTop: 8 }}>
                A dedicated professional networking and knowledge-sharing platform for BITM students. Build your portfolio, collaborate on engineering projects, and accelerate your placement preparation.
              </p>
            </div>

            <div className="hero-cta-group">
              {isAuthenticated ? (
                <Magnetic intensity={0.4} range={80}>
                  <Link to="/dashboard" className="btn btn-primary btn-lg magnetic-cta">
                    <span>Go to Your Dashboard</span> <ArrowRight size={18} />
                  </Link>
                </Magnetic>
              ) : (
                <>
                  <Magnetic intensity={0.4} range={80}>
                    <Link to="/register" className="btn btn-primary btn-lg magnetic-cta">
                      <span>Join BITM Network</span> <ArrowRight size={18} />
                    </Link>
                  </Magnetic>
                  <Magnetic intensity={0.4} range={80}>
                    <Link to="/login" className="btn btn-outline btn-lg magnetic-cta">
                      <span>Student Login</span>
                    </Link>
                  </Magnetic>
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
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            {/* Campus Card with Floating Glassmorphic Profile Badges */}
            <div className="campus-image-card">
              <img
                src={bitmCampusImg}
                alt="BITM Campus Ballari - Admin & PG Block"
                className="campus-img"
              />

              {/* Floating Profile Card 1: Student Dev */}
              <motion.div
                className="floating-hero-card float-card-top-left"
                animate={{ y: [0, -7, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              >
                <div className="float-card-avatar">MS</div>
                <div className="float-card-text">
                  <div className="float-card-name">Mohammed Zaid</div>
                  <div className="float-card-role"><Code size={11} /> 7th Sem CSE • React &amp; Cloud</div>
                </div>
              </motion.div>

              {/* Floating Profile Card 2: Hackathon Winner */}
              <motion.div
                className="floating-hero-card float-card-bottom-right"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.8 }}
              >
                <div className="float-card-avatar highlight">PR</div>
                <div className="float-card-text">
                  <div className="float-card-name">Pooja Reddy</div>
                  <div className="float-card-role"><Trophy size={11} /> Smart India Hackathon Winner</div>
                </div>
              </motion.div>

              {/* Floating Profile Card 3: Placement Network */}
              <motion.div
                className="floating-hero-card float-card-top-right"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut', delay: 1.4 }}
              >
                <div className="float-card-badge-icon"><Zap size={14} /></div>
                <div className="float-card-text">
                  <div className="float-card-name">120+ Placement Drives</div>
                  <div className="float-card-role">Campus Recruitment Hub</div>
                </div>
              </motion.div>

              <div className="campus-caption">
                <div className="caption-badge">Jnana Gangotri Campus</div>
                <h4>Ballari Institute of Technology &amp; Management</h4>
                <p>Administrative &amp; PG Block • Hospet Road, Ballari - 583104 • NAAC 'A+'</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Community Statistics Section */}
      <section className="stats-section">
        <div className="container">
          <InView once={true}>
            <div className="stats-grid">
              {stats.map((stat, idx) => (
                <div key={idx} className="stat-card">
                  <h3 className="stat-num">
                    <AnimatedNumber value={stat.number} />
                    {stat.suffix}
                  </h3>
                  <p className="stat-label">{stat.label}</p>
                </div>
              ))}
            </div>
          </InView>
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

          <InView once={true}>
            <AnimatedGroup preset="blur-slide" className="features-grid">
              {features.map((feat, idx) => (
                <div key={idx} className="card card-hoverable feature-card relative overflow-hidden" style={{ position: 'relative', overflow: 'hidden' }}>
                  <Spotlight size={160} />
                  <div className="feature-icon-box">{feat.icon}</div>
                  <h3 className="feature-title">{feat.title}</h3>
                  <p className="feature-desc">{feat.desc}</p>
                </div>
              ))}
            </AnimatedGroup>
          </InView>
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
                <Magnetic intensity={0.4} range={90}>
                  <Link to="/register" className="btn btn-primary btn-lg magnetic-cta">
                    <span>Create Your Free Student Profile</span> <ArrowRight size={18} />
                  </Link>
                </Magnetic>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Section */}
      <section className="faq-section" style={{ padding: '80px 0', background: 'var(--bg-subtle)' }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="section-tag">Frequently Asked Questions</span>
            <h2>Common Queries About BITM Student Network</h2>
            <p className="section-subtitle">
              Everything you need to know about student accounts, project teams, and campus placements.
            </p>
          </div>

          <Accordion className="demo-accordion-wrap">
            <AccordionItem value="faq-1" className="demo-accordion-item">
              <AccordionTrigger className="demo-accordion-trigger">
                <span>Who is eligible to register on BITM Student Network?</span>
                <ChevronDown size={16} />
              </AccordionTrigger>
              <AccordionContent className="demo-accordion-content">
                Any currently enrolled undergraduate or postgraduate engineering or MBA student at Ballari Institute of Technology and Management (BITM) with a valid USN. Faculty mentors and alumni can also request account access.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2" className="demo-accordion-item">
              <AccordionTrigger className="demo-accordion-trigger">
                <span>How can I find teammates for hackathons and mini-projects?</span>
                <ChevronDown size={16} />
              </AccordionTrigger>
              <AccordionContent className="demo-accordion-content">
                Navigate to the Projects section to publish your project concept and specify open roles (e.g., Frontend, Python, IoT, ML). Other students can submit collaboration requests which you can accept with one click.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3" className="demo-accordion-item">
              <AccordionTrigger className="demo-accordion-trigger">
                <span>How are placement and internship drives updated?</span>
                <ChevronDown size={16} />
              </AccordionTrigger>
              <AccordionContent className="demo-accordion-content">
                Verified training and placement officers update campus drives with eligibility criteria, application links, and deadlines in real-time. Students receive immediate notification badges when a new drive opens.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-4" className="demo-accordion-item">
              <AccordionTrigger className="demo-accordion-trigger">
                <span>Is my student data and password secure?</span>
                <ChevronDown size={16} />
              </AccordionTrigger>
              <AccordionContent className="demo-accordion-content">
                Yes. All passwords are encrypted with industry-standard bcrypt hashing. Sessions are protected with JSON Web Tokens (JWT) and role-based access control, ensuring zero data leakage.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
