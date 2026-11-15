import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, ExternalLink, ShieldCheck } from 'lucide-react';
import '../styles/footer.css';

const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="container footer-container">
        <div className="footer-grid">
          {/* Col 1: BITM Overview */}
          <div className="footer-col brand-col">
            <h3 className="footer-title">BITM Student Network</h3>
            <p className="footer-desc">
              The official professional networking, academic collaboration, and career development hub for students and faculty of Ballari Institute of Technology and Management.
            </p>
            <div className="footer-accreditations">
              <span className="accred-badge"><ShieldCheck size={14} /> NAAC 'A+' Grade</span>
              <span className="accred-badge">NBA Accredited</span>
              <span className="accred-badge">VTU Belagavi</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Platform Hub</h4>
            <ul className="footer-links">
              <li><Link to="/feed">Community Feed</Link></li>
              <li><Link to="/explore">Explore Students</Link></li>
              <li><Link to="/discussions">Technical Discussions</Link></li>
              <li><Link to="/projects">Project Collaboration</Link></li>
              <li><Link to="/opportunities">Internships &amp; Careers</Link></li>
              <li><Link to="/events">Campus Events &amp; Workshops</Link></li>
            </ul>
          </div>

          {/* Col 3: Academic & VTU Links */}
          <div className="footer-col">
            <h4 className="footer-heading">College Resources</h4>
            <ul className="footer-links">
              <li>
                <a href="https://bitm.edu.in" target="_blank" rel="noreferrer">
                  BITM Official Website <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://vtu.ac.in" target="_blank" rel="noreferrer">
                  VTU Belagavi Portal <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://results.vtu.ac.in" target="_blank" rel="noreferrer">
                  VTU Exam Results <ExternalLink size={12} />
                </a>
              </li>
              <li><Link to="/announcements">College Announcements</Link></li>
              <li><Link to="/login">Student Portal Login</Link></li>
            </ul>
          </div>

          {/* Col 4: Campus Contact */}
          <div className="footer-col">
            <h4 className="footer-heading">Jnana Gangotri Campus</h4>
            <div className="footer-contact-item">
              <MapPin size={16} className="contact-icon" />
              <span>Ballari Institute of Technology &amp; Management, Hospet Road, Ballari - 583104, Karnataka</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={16} className="contact-icon" />
              <span>+91 8392 237160 / 237150</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={16} className="contact-icon" />
              <span>info@bitm.edu.in</span>
            </div>
            <div className="footer-contact-item">
              <Globe size={16} className="contact-icon" />
              <span>www.bitm.edu.in</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Ballari Institute of Technology &amp; Management (BITM). All rights reserved.</p>
          <p className="footer-mini-tag">BITM Mini Project | Built with React, Node.js &amp; MongoDB</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
