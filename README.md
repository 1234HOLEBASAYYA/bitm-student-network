# BITM Student Network 🎓
### Professional Networking & Knowledge-Sharing Platform for Ballari Institute of Technology and Management (BITM)

> **Mini-Project for Ballari Institute of Technology & Management (BITM)**  
> Built with **React.js, Node.js, Express.js, and MongoDB** (MERN Architecture).  
> Designed with a professional **LinkedIn / modern university portal** UI/UX in custom CSS (no Tailwind CSS).

---

## 🌟 Overview

The **BITM Student Network** is a dedicated collegiate social and professional networking platform designed specifically for the students, faculty, and administration of **Ballari Institute of Technology and Management (BITM)**.

Unlike generic social networks, this platform directly addresses academic and career needs:
- Connecting students across **all 8 engineering and management departments**.
- Eliminating knowledge silos across semesters.
- Fostering peer-to-peer collaboration on engineering mini-projects and national hackathons.
- Bridging students directly with campus placement preparation, mock drives, and verified internships.
- Empowering college administration with a dedicated, role-protected oversight dashboard.

---

## 💻 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router DOM v7, Axios, Lucide Icons, Plain Custom CSS (CSS Variables) |
| **Backend** | Node.js, Express.js (RESTful Architecture), CORS, Dotenv, Multer |
| **Database** | MongoDB, Mongoose ODM with Schema Validation, References & Virtuals |
| **Security & Auth** | JSON Web Tokens (JWT), bcrypt.js (salted password hashing), Role-Based Access Control (RBAC), Protected Routes |

---

## 🚀 Key Modules & Features

### 1. Landing Page
- Official BITM branding, college logo, and motto: *"Connect. Collaborate. Learn. Grow Together."*
- Hero section with high-res campus visual and dedicated image replacement folder (`client/src/assets/images/`).
- Platform statistics: 1,200+ students, 8 engineering departments, 150+ collaborative projects.
- Core capability highlights, department overview, and college footer with VTU Belagavi & NAAC 'A+' credentials.

### 2. Student Authentication & Security
- Secure registration capturing: **Full Name, VTU USN, College Email, Password, Confirm Password, Department, Semester, Section, Technical Skills, and Areas of Interest**.
- Case-insensitive duplicate prevention for USN and Email.
- Passwords salted and hashed with **bcryptjs** (never stored in plain text).
- Flexible login supporting either **Email** or **USN**.
- Password recovery simulation workflow (`/forgot-password`).

### 3. Student Dashboard & 12-Item Sidebar
- Personalized welcome banner highlighting department, semester, and section.
- **Dynamic Profile Completion Meter** with actionable recommendations.
- Interactive widgets: Recent Campus Posts, Recommended Technical Discussions, Suggested Peers to Connect With, Upcoming Events, and Career Opportunities.
- Professional 12-item navigation sidebar:
  1. *Home* (`/dashboard`)
  2. *My Profile* (`/profile`)
  3. *Explore Students* (`/explore`)
  4. *Community Feed* (`/feed`)
  5. *Discussions* (`/discussions`)
  6. *Projects* (`/projects`)
  7. *Opportunities* (`/opportunities`)
  8. *Events* (`/events`)
  9. *Messages* (`/messages`)
  10. *Notifications* (`/notifications`)
  11. *Settings* (`/settings`)
  12. *Logout*

### 4. Student Profile Management
- Professional profile header with avatar upload/link, student USN badge, and academic credentials.
- Contact visibility controls: toggle public email display or phone visibility to connected peers.
- Social links: GitHub and LinkedIn integration.
- Dynamic tabbed portfolio:
  - **About & Skills:** Bio summary, skill tags, and areas of interest.
  - **Projects:** Academic and capstone projects with repository and live demo links.
  - **Achievements:** Hackathon prizes, symposium awards, and club leadership.
  - **Certifications:** Verified licenses, NPTEL/Swayam credentials, and cloud certificates.
- Student profile view support (`/profile/:id`) to inspect peer portfolios.

### 5. Explore Students & Networking
- Real-time directory search by student name, USN, and keywords.
- Multi-criteria filtering by **Department**, **Semester**, and **Specific Technical Skills**.
- Clean student card layout with Connect / Request Pending / Connected status chips.
- Dedicated **My Network** portal (`/connections`) to accept or decline incoming requests and manage active peers.

### 6. LinkedIn-Style Community Feed
- Rich post creation with text, category selector, and optional image attachments.
- Category filters: *General, Technical Knowledge, Project Update, Achievement, Campus News, Career*.
- Interactive feed options: Like toggling, multi-threaded comment streams, post sharing, and owner post deletion/editing.
- Filter between *All Campus Posts* and *Connected Students Only*.

### 7. Technical Discussion Forum
- Categorized engineering forum: *Programming, DSA, Web Dev, AI/ML, DBMS, Computer Networks, Cybersecurity, Projects*.
- Search and filter questions by status (*Solved* vs. *Unsolved*).
- Answer upvoting mechanism.
- **Accepted Answer feature:** Discussion authors can mark solutions as the definitive answer.

### 8. Project Collaboration Module
- Showcase engineering projects with tech stack badges, GitHub repositories, and live demos.
- Define specific collaboration roles needed (e.g. *UI/UX Designer, Backend Developer, Flutter Developer*).
- Send and review formal join requests with personalized contribution pitches.

### 9. Internships & Career Opportunities
- Discover verified campus recruitment notices, off-campus drives, internships, and hackathons.
- Comprehensive opportunity cards highlighting organization, eligibility criteria, compensation/stipend, and deadline counters.
- Ability for students and administrators to publish vetted career listings.

### 10. Campus Events & Workshops
- Schedule of upcoming BITM workshops, coding bootcamps, departmental symposiums, and the flagship **BITM INVENTO** fest.
- One-click **RSVP / Interested** button tracking student interest.
- External registration links and admin event management.

### 11. Private Student Messaging
- 1-on-1 private messaging exclusively between mutually connected students.
- Conversation sidebar displaying unread counts and recent messages.
- Clean chat thread layout with sender/receiver message bubbles and timestamps.

### 12. Notification Center
- Real-time badge indicators for new connection requests, accepted invitations, post likes/comments, collaboration requests, and official circulars.
- One-click *Mark All as Read* and instant deep-linking.

### 13. Role-Protected Admin Dashboard (`/admin`)
- Accessible only by verified users with `role: 'admin'`.
- Real-time analytics overview: Total Students, Active Users, Posts, Discussions, Projects, Opportunities, Events, and Departmental enrollment charts.
- **Student Management:** View full student roster, search, filter, approve registrations, activate/deactivate accounts, or remove accounts.
- **Content Moderation:** Review flagged posts and reported content to maintain campus guidelines.
- **Official Announcements:** Broadcast college-wide or branch-specific circulars directly into student inboxes.

---

## 📂 Project Structure

```
miniproject/
├── client/                      # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/          # Campus photos & logos
│   │   │       ├── bitm-logo.svg
│   │   │       ├── campus-placeholder.svg
│   │   │       └── README.txt   # Instructions for replacing campus images
│   │   ├── components/          # Reusable UI Components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── SocialIcons.jsx
│   │   ├── context/             # Global React State
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── pages/               # Application Pages
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ExploreStudentsPage.jsx
│   │   │   ├── ConnectionsPage.jsx
│   │   │   ├── CommunityFeedPage.jsx
│   │   │   ├── DiscussionsPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── OpportunitiesPage.jsx
│   │   │   ├── EventsPage.jsx
│   │   │   ├── MessagesPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── AnnouncementsPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── AdminDashboardPage.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios configuration & interceptors
│   │   ├── styles/              # Plain CSS & CSS Modules (No Tailwind)
│   │   │   ├── variables.css
│   │   │   ├── global.css
│   │   │   ├── navbar.css
│   │   │   ├── sidebar.css
│   │   │   ├── footer.css
│   │   │   ├── landing.css
│   │   │   ├── auth.css
│   │   │   ├── dashboard.css
│   │   │   ├── profile.css
│   │   │   ├── network.css
│   │   │   ├── feed.css
│   │   │   ├── discussions.css
│   │   │   ├── projects.css
│   │   │   ├── opportunities.css
│   │   │   ├── events.css
│   │   │   ├── messages.css
│   │   │   └── admin.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── server/                      # Express & Node.js Backend
│   ├── config/
│   │   └── db.js                # MongoDB connection handler
│   ├── controllers/             # REST API business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── postController.js
│   │   ├── connectionController.js
│   │   ├── discussionController.js
│   │   ├── projectController.js
│   │   ├── opportunityController.js
│   │   ├── eventController.js
│   │   ├── messageController.js
│   │   ├── notificationController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT & role authorization
│   │   └── upload.js            # Multer image storage
│   ├── models/                  # Mongoose Schemas (13 Models)
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   ├── Connection.js
│   │   ├── ConnectionRequest.js
│   │   ├── Discussion.js
│   │   ├── Project.js
│   │   ├── CollaborationRequest.js
│   │   ├── Opportunity.js
│   │   ├── Event.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── Announcement.js
│   │   └── Report.js
│   ├── routes/                  # Express API Routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── postRoutes.js
│   │   ├── connectionRoutes.js
│   │   ├── discussionRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── opportunityRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── adminRoutes.js
│   ├── scripts/
│   │   └── seed.js              # Database seed script with sample BITM data
│   ├── uploads/                 # Static uploads directory
│   ├── .env                     # Server environment variables
│   ├── server.js                # Express app entry point
│   └── package.json
│
├── .gitignore
├── package.json                 # Root script runner
└── README.md
```

---

## ⚡ Setup & Execution Instructions

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally on port `27017` or a MongoDB Atlas connection string.

### Step 1: Install Dependencies
From the root directory:
```bash
npm run install:all
```
*(Or navigate into `server/` and `client/` individually and run `npm install`)*

### Step 2: Configure Environment Variables
Verify or adjust `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bitm_student_network
JWT_SECRET=bitm_secure_jwt_secret_token_ballari_2024_key_99
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Step 3: Seed Database with Realistic BITM Data
Populate students, connections, discussions, events, opportunities, and the administrator account:
```bash
npm run seed
```
*(Or `cd server && node scripts/seed.js`)*

### Step 4: Run the Application
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd server
npm start
```
*Backend runs at:* `http://localhost:5000/api`

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
*Frontend runs at:* `http://localhost:5173`

---

## 🔑 Pre-Configured Demo Credentials

Use any of these pre-seeded accounts to evaluate features immediately:

### 🛡️ Administrator Account
- **Email:** `admin@bitm.edu.in`
- **Password:** `Admin@BITM2024`
- **Capabilities:** Access to the `/admin` portal, student account status moderation, broadcast circulars, event creation.

### 🎓 Sample Student Accounts
All student accounts use password: `Password@123`

| Name | USN | Email | Department |
|---|---|---|---|
| **Rahul Sharma** | `3BR21CS045` | `rahul.cs@bitm.edu.in` | Computer Science & Engineering (7th Sem) |
| **Pooja Reddy** | `3BR21AI015` | `pooja.aiml@bitm.edu.in` | Artificial Intelligence & ML (7th Sem) |
| **Karthik Kumar** | `3BR22IS023` | `karthik.is@bitm.edu.in` | Information Science & Engineering (5th Sem) |
| **Ananya Deshmukh** | `3BR22EC052` | `ananya.ec@bitm.edu.in` | Electronics & Communication (5th Sem) |
| **Mohammed Zaid** | `3BR23CS089` | `zaid.cs@bitm.edu.in` | Computer Science & Engineering (3rd Sem) |

*(Quick-login buttons are also provided directly on the Login page for one-click testing).*

---

## 📷 Customizing Campus Images

To replace the placeholder hero image with official BITM campus photographs:
1. Copy your photograph into `client/src/assets/images/`.
2. Name it `bitm-campus.jpg` or `bitm-campus.png`.
3. The platform is configured to display this image seamlessly in the Landing Page and Hero sections.

---

## 🏛️ Ballari Institute of Technology and Management (BITM)
- **Campus:** Jnana Gangotri Campus, Hospet Road, Ballari - 583104, Karnataka, India
- **Affiliation:** Affiliated to Visvesvaraya Technological University (VTU), Belagavi
- **Accreditation:** NAAC 'A+' Grade | NBA Accredited | Approved by AICTE, New Delhi

---
*Developed for BITM Mini Project | Complete Full-Stack Implementation*
