import React, { useState } from 'react';
import { BorderTrail } from '@/components/core/border-trail';
import { TextEffect } from '@/components/core/text-effect';
import { TextLoop } from '@/components/core/text-loop';
import { TextShimmer } from '@/components/core/text-shimmer';
import { AnimatedNumber } from '@/components/core/animated-number';
import { Spotlight } from '@/components/core/spotlight';
import { Tilt } from '@/components/core/tilt';
import { Magnetic } from '@/components/core/magnetic';
import { AnimatedGroup } from '@/components/core/animated-group';
import { InView } from '@/components/core/in-view';
import { ScrollProgress } from '@/components/core/scroll-progress';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/core/accordion';
import { Dock, DockItem, DockIcon, DockLabel } from '@/components/core/dock';
import {
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  CheckCircle2,
  Users,
  Code,
  Flame,
  Briefcase,
  HelpCircle,
  Home,
  MessageSquare,
  User,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import '../styles/demo.css';

export const MotionPrimitivesDemoPage = () => {
  const [studentCount, setStudentCount] = useState(1248);
  const [placementCount, setPlacementCount] = useState(95);

  return (
    <div className="motion-demo-page">
      {/* 1. Scroll Progress Bar at the Top */}
      <ScrollProgress className="demo-scroll-progress-bar" />

      <header className="demo-header container">
        <div className="demo-badge">
          <Sparkles size={16} />
          {/* 2. Text Shimmer Component */}
          <TextShimmer duration={2.5} spread={3} className="demo-shimmer-text">
            Motion Primitives • Complete Component Verification
          </TextShimmer>
        </div>

        {/* 3. Text Effect Component */}
        <h1 className="demo-main-title">
          <TextEffect per="word" preset="blur" delay={0.1}>
            BITM Student Network Motion Lab
          </TextEffect>
        </h1>

        {/* 4. Text Loop Component */}
        <div className="demo-subtitle-loop">
          <span>Transforming student networking with </span>
          <TextLoop
            interval={2.8}
            className="demo-loop-highlight"
            variants={{
              initial: { y: 15, opacity: 0 },
              animate: { y: 0, opacity: 1 },
              exit: { y: -15, opacity: 0 },
            }}
          >
            <span>Apple-Style Docks</span>
            <span>Interactive 3D Tilt</span>
            <span>Border Trail Beams</span>
            <span>Magnetic Button Snaps</span>
            <span>Dynamic Typography</span>
          </TextLoop>
        </div>
      </header>

      <main className="container demo-grid-sections">
        {/* SECTION A: Border Trail (User requested feature) */}
        <section className="demo-section card">
          <div className="demo-section-head">
            <span className="demo-tag">01. Border Trail</span>
            <h3>Luminous Moving Border Trails</h3>
            <p>Creates an animated light beam travelling smoothly along element borders.</p>
          </div>

          <div className="demo-cards-row">
            {/* User exact snippet adaptation */}
            <div className="relative border-trail-card">
              <BorderTrail
                size={80}
                style={{
                  boxShadow:
                    '0px 0px 40px 20px rgba(37, 99, 235, 0.45), 0 0 70px 40px rgba(59, 130, 246, 0.3)',
                  background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                }}
              />
              <div className="trail-card-content">
                <div className="trail-badge">Featured Announcement</div>
                <h4>Smart India Hackathon 2024</h4>
                <p>Congratulations to Team Innovators from BITM CSE on securing 1st place in National Grand Finale.</p>
              </div>
            </div>

            <div className="relative border-trail-card gold">
              <BorderTrail
                size={100}
                style={{
                  boxShadow:
                    '0px 0px 50px 25px rgba(245, 158, 11, 0.4), 0 0 90px 45px rgba(217, 119, 6, 0.25)',
                  background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                }}
              />
              <div className="trail-card-content">
                <div className="trail-badge gold">Campus Placement Alert</div>
                <h4>Infosys & TCS Digital Drive</h4>
                <p>Final registration window open for 7th semester students. Verify your profile to qualify.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION B: Animated Number */}
        <section className="demo-section card">
          <div className="demo-section-head">
            <span className="demo-tag">02. Animated Number</span>
            <h3>Spring-Driven Numerical Counters</h3>
            <p>Live animated state changes without layout shift.</p>
          </div>

          <div className="demo-numbers-row">
            <div className="demo-stat-box">
              <span className="stat-value">
                <AnimatedNumber value={studentCount} />+
              </span>
              <span className="stat-label">Active Verified Students</span>
              <div className="stat-ctrls">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setStudentCount((c) => Math.max(100, c - 50))}
                >
                  <Minus size={13} /> 50
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setStudentCount((c) => c + 50)}
                >
                  <Plus size={13} /> 50
                </button>
              </div>
            </div>

            <div className="demo-stat-box">
              <span className="stat-value">
                <AnimatedNumber value={placementCount} />%
              </span>
              <span className="stat-label">Placement Clearance Rate</span>
              <div className="stat-ctrls">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setPlacementCount((p) => Math.max(0, p - 5))}
                >
                  <Minus size={13} /> 5%
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setPlacementCount((p) => Math.min(100, p + 5))}
                >
                  <Plus size={13} /> 5%
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION C: 3D Tilt & Cursor Spotlight */}
        <section className="demo-section card">
          <div className="demo-section-head">
            <span className="demo-tag">03. 3D Tilt & Spotlight</span>
            <h3>Interactive Perspective & Cursor Illumination</h3>
            <p>Cards respond organically to cursor coordinates with depth perspective.</p>
          </div>

          <div className="demo-cards-row">
            {/* Tilt Card with Spotlight */}
            <Tilt rotationFactor={14} isRevese={false} className="demo-tilt-wrapper">
              <div className="card demo-interactive-card">
                <Spotlight size={180} />
                <div className="interactive-card-inner">
                  <div className="avatar-pill">RA</div>
                  <h4>Rahul Sharma</h4>
                  <span className="dept-tag">Computer Science &amp; Eng</span>
                  <p>Full-Stack Developer • React, Node.js &amp; Cloud Architecture • 8th Sem</p>
                  <div className="card-skills">
                    <span className="skill-chip">React</span>
                    <span className="skill-chip">Node.js</span>
                    <span className="skill-chip">MongoDB</span>
                  </div>
                </div>
              </div>
            </Tilt>

            <Tilt rotationFactor={14} isRevese={false} className="demo-tilt-wrapper">
              <div className="card demo-interactive-card">
                <Spotlight size={180} />
                <div className="interactive-card-inner">
                  <div className="avatar-pill purple">PR</div>
                  <h4>Pooja Reddy</h4>
                  <span className="dept-tag">Artificial Intelligence</span>
                  <p>AI/ML Researcher • Computer Vision &amp; Neural Networks • 6th Sem</p>
                  <div className="card-skills">
                    <span className="skill-chip">PyTorch</span>
                    <span className="skill-chip">OpenCV</span>
                    <span className="skill-chip">Python</span>
                  </div>
                </div>
              </div>
            </Tilt>
          </div>
        </section>

        {/* SECTION D: Magnetic Buttons */}
        <section className="demo-section card">
          <div className="demo-section-head">
            <span className="demo-tag">04. Magnetic Buttons</span>
            <h3>Magnetic Cursor Snapping</h3>
            <p>Hover near the buttons to feel the magnetic attraction pull.</p>
          </div>

          <div className="demo-magnetic-row">
            <Magnetic intensity={0.5} range={90}>
              <button className="btn btn-primary btn-lg magnetic-btn">
                <span>Join BITM Network</span> <ArrowRight size={16} />
              </button>
            </Magnetic>

            <Magnetic intensity={0.5} range={90}>
              <button className="btn btn-secondary btn-lg magnetic-btn">
                <span><Plus size={15} /> Create Campus Post</span>
              </button>
            </Magnetic>

            <Magnetic intensity={0.5} range={90}>
              <button className="btn btn-outline btn-lg magnetic-btn">
                <span>Explore Students Directory</span>
              </button>
            </Magnetic>
          </div>
        </section>

        {/* SECTION E: Animated Group & InView */}
        <section className="demo-section card">
          <div className="demo-section-head">
            <span className="demo-tag">05. Animated Group & InView</span>
            <h3>Coordinated Staggered Cascades</h3>
            <p>Child elements enter in coordinated timing sequences when scrolled into view.</p>
          </div>

          <InView once={true}>
            <AnimatedGroup preset="blur-slide" className="demo-stagger-grid">
              <div className="stagger-card">
                <div className="stagger-icon blue"><Code size={20} /></div>
                <h4>Engineering Projects</h4>
                <p>Publish and discover collaborative academic hardware and software projects.</p>
              </div>
              <div className="stagger-card">
                <div className="stagger-icon green"><CheckCircle2 size={20} /></div>
                <h4>Verified BITM USNs</h4>
                <p>Authentic college email validation ensuring genuine peer collaboration.</p>
              </div>
              <div className="stagger-card">
                <div className="stagger-icon purple"><HelpCircle size={20} /></div>
                <h4>Technical Forum</h4>
                <p>Ask complex engineering questions and receive verified peer answers.</p>
              </div>
            </AnimatedGroup>
          </InView>
        </section>

        {/* SECTION F: Accordion */}
        <section className="demo-section card">
          <div className="demo-section-head">
            <span className="demo-tag">06. Accordion</span>
            <h3>Smooth Content Disclosure</h3>
            <p>Collapsible panels with spring-based height transitions.</p>
          </div>

          <Accordion className="demo-accordion-wrap">
            <AccordionItem value="faq-1" className="demo-accordion-item">
              <AccordionTrigger className="demo-accordion-trigger">
                <span>Who can register on the BITM Student Network?</span>
                <ChevronDown size={16} className="accordion-chevron" />
              </AccordionTrigger>
              <AccordionContent className="demo-accordion-content">
                Registration is exclusive to verified students, faculty, and alumni of Ballari Institute of Technology and Management (BITM). Valid USN and college email domain are verified upon sign-up.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2" className="demo-accordion-item">
              <AccordionTrigger className="demo-accordion-trigger">
                <span>How does the Project Collaboration system work?</span>
                <ChevronDown size={16} className="accordion-chevron" />
              </AccordionTrigger>
              <AccordionContent className="demo-accordion-content">
                Students can showcase mini and final year projects, list required teammate roles (e.g. Frontend, IoT, Backend, ML), and send or accept collaboration requests with one click.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3" className="demo-accordion-item">
              <AccordionTrigger className="demo-accordion-trigger">
                <span>Are internship and placement drives verified?</span>
                <ChevronDown size={16} className="accordion-chevron" />
              </AccordionTrigger>
              <AccordionContent className="demo-accordion-content">
                Yes, opportunities are curated and published directly by the BITM Training &amp; Placement Cell or verified campus recruiting ambassadors.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* SECTION G: Dock Component Preview */}
        <section className="demo-section card">
          <div className="demo-section-head">
            <span className="demo-tag">07. Apple-Style Dock</span>
            <h3>macOS Magnification Navigation Preview</h3>
            <p>Hover over the icons below to experience real-time cursor distance scaling.</p>
          </div>

          <div className="demo-dock-showcase">
            <Dock magnification={68} distance={130} baseSize={46}>
              <DockItem onClick={() => {}} ariaLabel="Home">
                <DockLabel>Home</DockLabel>
                <DockIcon><Home /></DockIcon>
              </DockItem>
              <DockItem onClick={() => {}} ariaLabel="Explore">
                <DockLabel>Explore</DockLabel>
                <DockIcon><Users /></DockIcon>
              </DockItem>
              <DockItem onClick={() => {}} ariaLabel="Community" isActive={true}>
                <DockLabel>Community</DockLabel>
                <DockIcon><Flame /></DockIcon>
              </DockItem>
              <DockItem onClick={() => {}} ariaLabel="Discussions">
                <DockLabel>Discussions</DockLabel>
                <DockIcon><HelpCircle /></DockIcon>
              </DockItem>
              <DockItem onClick={() => {}} ariaLabel="Projects">
                <DockLabel>Projects</DockLabel>
                <DockIcon><Briefcase /></DockIcon>
              </DockItem>
              <DockItem onClick={() => {}} ariaLabel="Messages" badge={2}>
                <DockLabel>Messages</DockLabel>
                <DockIcon><MessageSquare /></DockIcon>
              </DockItem>
              <DockItem onClick={() => {}} ariaLabel="Profile">
                <DockLabel>Profile</DockLabel>
                <DockIcon><User /></DockIcon>
              </DockItem>
            </Dock>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MotionPrimitivesDemoPage;
