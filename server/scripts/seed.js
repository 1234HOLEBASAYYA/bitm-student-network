const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: '../.env' });

const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Connection = require('../models/Connection');
const ConnectionRequest = require('../models/ConnectionRequest');
const Discussion = require('../models/Discussion');
const Project = require('../models/Project');
const Opportunity = require('../models/Opportunity');
const Event = require('../models/Event');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bitm_student_network';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to MongoDB at: ${mongoUri}`);

    // Clear existing collections
    await User.deleteMany();
    await Post.deleteMany();
    await Comment.deleteMany();
    await Connection.deleteMany();
    await ConnectionRequest.deleteMany();
    await Discussion.deleteMany();
    await Project.deleteMany();
    await Opportunity.deleteMany();
    await Event.deleteMany();
    await Message.deleteMany();
    await Notification.deleteMany();
    await Announcement.deleteMany();

    console.log('[Seed] Cleared existing data.');

    // 1. Create Admin Account
    const admin = await User.create({
      fullName: 'BITM Administration',
      usn: 'ADMIN001',
      email: 'admin@bitm.edu.in',
      password: 'Admin@BITM2024',
      role: 'admin',
      status: 'active',
      department: 'Computer Science & Engineering',
      semester: 8,
      section: 'A',
      headline: 'BITM System Administrator & Academic Coordinator',
      aboutMe: 'Official administrator account for Ballari Institute of Technology & Management (BITM) Student Network portal.',
      skills: ['Campus Management', 'Curriculum Coordination', 'Placement Cell Support'],
      interests: ['Higher Education', 'Student Innovation', 'Campus Placements'],
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    console.log('[Seed] Admin account created: admin@bitm.edu.in / Admin@BITM2024');

    // 2. Create Students
    const studentData = [
      {
        fullName: 'Rahul Sharma',
        usn: '3BR21CS045',
        email: 'rahul.cs@bitm.edu.in',
        password: 'Password@123',
        department: 'Computer Science & Engineering',
        semester: 7,
        section: 'A',
        headline: 'Full-Stack Developer | MERN Stack Enthusiast | 7th Sem CSE',
        aboutMe: 'Passionate computer science student at BITM specializing in React, Node.js, and cloud deployments. Leading the BITM Coding Club and building open-source projects.',
        skills: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'Docker', 'Git'],
        interests: ['Web Development', 'System Design', 'Open Source', 'Competitive Programming'],
        profilePicture: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        projects: [
          {
            title: 'BITM Campus Navigation App',
            description: 'Interactive 3D campus navigation and classroom locator for freshers and visitors.',
            techStack: ['React', 'Three.js', 'Leaflet', 'Node.js'],
            githubUrl: 'https://github.com',
            liveUrl: 'https://bitm-nav.vercel.app',
            date: 'Oct 2024'
          }
        ],
        achievements: [
          { title: 'Winner - Smart Karnataka Hackathon 2024', description: 'First prize for AI Smart Farming system', year: '2024' },
          { title: 'President, BITM Developer Student Club', description: 'Organized 12 tech workshops across semesters', year: '2023' }
        ],
        certifications: [
          { name: 'AWS Certified Cloud Practitioner', organization: 'Amazon Web Services', issueDate: 'Jan 2024' }
        ]
      },
      {
        fullName: 'Pooja Reddy',
        usn: '3BR21AI015',
        email: 'pooja.aiml@bitm.edu.in',
        password: 'Password@123',
        department: 'Artificial Intelligence & Machine Learning',
        semester: 7,
        section: 'A',
        headline: 'AI/ML Researcher | PyTorch & NLP Enthusiast | Smart India Hackathon Finalist',
        aboutMe: '7th semester AIML undergraduate at BITM. Excited about Large Language Models, deep neural networks, and computer vision applications in medical diagnostics.',
        skills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'NLP', 'Computer Vision', 'FastAPI'],
        interests: ['Artificial Intelligence', 'Machine Learning', 'Data Science', 'Deep Learning'],
        profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        projects: [
          {
            title: 'Medical Image Segmentation using U-Net',
            description: 'Automated MRI brain tumor classification and segmentation with 94.2% test accuracy.',
            techStack: ['Python', 'PyTorch', 'OpenCV', 'Streamlit'],
            githubUrl: 'https://github.com',
            date: 'Aug 2024'
          }
        ],
        achievements: [
          { title: 'Finalist - Smart India Hackathon 2024', description: 'Selected among top 5 teams nationwide for AI problem statement', year: '2024' }
        ]
      },
      {
        fullName: 'Karthik Kumar',
        usn: '3BR22IS023',
        email: 'karthik.is@bitm.edu.in',
        password: 'Password@123',
        department: 'Information Science & Engineering',
        semester: 5,
        section: 'B',
        headline: 'Cybersecurity Enthusiast | CTF Player | Network Security Intern',
        aboutMe: '5th sem ISE student passionate about ethical hacking, reverse engineering, and threat analysis. Active participant in national CTF contests.',
        skills: ['Linux', 'Wireshark', 'Burp Suite', 'Python', 'Bash Scripting', 'Cryptography', 'Networking'],
        interests: ['Cybersecurity', 'Ethical Hacking', 'Cloud Security', 'Forensics'],
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        github: 'https://github.com',
        linkedin: 'https://linkedin.com'
      },
      {
        fullName: 'Ananya Deshmukh',
        usn: '3BR22EC052',
        email: 'ananya.ec@bitm.edu.in',
        password: 'Password@123',
        department: 'Electronics & Communication Engineering',
        semester: 5,
        section: 'A',
        headline: 'Embedded Systems & IoT Developer | Robotics Club Core Member',
        aboutMe: 'ECE student at BITM working on IoT sensor nodes and embedded firmware for smart city applications. Love building hardware prototypes with ESP32 and STM32.',
        skills: ['Embedded C', 'ESP32', 'Arduino', 'IoT', 'PCB Design', 'MATLAB', 'VLSI basics'],
        interests: ['Robotics', 'Internet of Things', 'Hardware Automation', 'VLSI Design'],
        profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        github: 'https://github.com',
        linkedin: 'https://linkedin.com'
      },
      {
        fullName: 'Mohammed Zaid',
        usn: '3BR23CS089',
        email: 'zaid.cs@bitm.edu.in',
        password: 'Password@123',
        department: 'Computer Science & Engineering',
        semester: 3,
        section: 'B',
        headline: 'Aspiring Web Developer & Competitive Programmer | 3rd Sem CSE',
        aboutMe: 'Second-year student learning Data Structures and modern frontend frameworks. Passionate about problem-solving on LeetCode and CodeChef.',
        skills: ['C++', 'Java', 'HTML5', 'CSS3', 'JavaScript', 'Data Structures', 'SQL'],
        interests: ['Algorithms', 'Web Development', 'Competitive Programming'],
        profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      }
    ];

    const createdStudents = await User.create(studentData);
    console.log(`[Seed] Created ${createdStudents.length} student profiles.`);

    const [rahul, pooja, karthik, ananya, zaid] = createdStudents;

    // 3. Create Connections between students
    await Connection.create([
      { user1: rahul._id, user2: pooja._id },
      { user1: rahul._id, user2: karthik._id },
      { user1: pooja._id, user2: ananya._id }
    ]);

    // Create a pending request
    await ConnectionRequest.create({
      sender: zaid._id,
      receiver: rahul._id,
      status: 'pending',
      message: 'Hi Rahul senior! I am a 3rd sem CSE student and would love to connect and learn about web development and your club activities.'
    });

    console.log('[Seed] Created connections and pending connection requests.');

    // 4. Create Community Posts
    const posts = await Post.create([
      {
        author: rahul._id,
        content: '🚀 Excited to announce that our team from BITM won 1st Place at the Smart Karnataka State Hackathon 2024! Huge thanks to our Computer Science faculty and mentors for supporting our project on IoT + AI for Precision Farming. Hard work and sleepless nights in the BITM lab truly paid off! 🏆💻',
        category: 'Achievement',
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
        likes: [pooja._id, karthik._id, ananya._id],
        commentsCount: 2
      },
      {
        author: pooja._id,
        content: '🧠 Quick Machine Learning Tip for 5th & 7th sem students: When working with imbalanced datasets for classification tasks, avoid relying purely on accuracy! Always evaluate using F1-score, Precision-Recall curves, or ROC-AUC. Also consider SMOTE or Focal Loss for heavy class imbalance. Happy to share my Jupyter notebook notes on this! 📊',
        category: 'Technical Knowledge',
        likes: [rahul._id, karthik._id],
        commentsCount: 1
      },
      {
        author: ananya._id,
        content: 'Robotics & IoT Workshop announcement! 🤖 The ECE Department & Robotics Club are organizing a hands-on session this Friday on "Building ESP32 Mesh Networks for Smart Campus Sensors". Open to all departments. Bring your laptops with Arduino IDE installed!',
        category: 'Campus News',
        likes: [rahul._id, pooja._id, zaid._id],
        commentsCount: 0
      }
    ]);

    // Create comments on posts
    await Comment.create([
      {
        post: posts[0]._id,
        author: pooja._id,
        content: 'Hearty congratulations Rahul and team! Super proud moment for BITM CSE department! 👏🔥'
      },
      {
        post: posts[0]._id,
        author: karthik._id,
        content: 'Well deserved victory! That presentation was stellar!'
      },
      {
        post: posts[1]._id,
        author: zaid._id,
        content: 'Thank you Pooja senior! Could you please share the GitHub link to your reference notebook?'
      }
    ]);

    console.log('[Seed] Created community posts and comments.');

    // 5. Create Technical Discussions
    const discussion = await Discussion.create({
      title: 'How to efficiently optimize MongoDB aggregations for high-throughput queries?',
      content: 'In our 7th-semester mini project, we have large collections of student activity logs. When running `$lookup` across multiple collections with `$unwind`, the response latency spikes. What are the industry best practices for indexing compound fields and structuring pipelines for low latency?',
      category: 'Database Management',
      tags: ['MongoDB', 'Indexing', 'Performance', 'Database'],
      author: rahul._id,
      views: 34,
      isSolved: true,
      answers: [
        {
          author: pooja._id,
          content: '1. Ensure that the foreign field in the `$lookup` collection has a dedicated B-tree index. 2. Filter early in the pipeline using `$match` BEFORE `$lookup` and `$unwind` so you only join necessary documents. 3. Use `$project` early to eliminate unused fields and reduce in-memory RAM usage.',
          isAccepted: true,
          upvotes: [rahul._id, karthik._id]
        }
      ]
    });

    await Discussion.create({
      title: 'Best strategy to master Data Structures & Algorithms for upcoming campus placements at BITM?',
      content: 'I am preparing for the Day-1 IT company recruitment drives visiting BITM next semester (TCS Digital, Cognizant, Infosys, Tech Mahindra). Which platforms and topic sequence do you recommend starting with?',
      category: 'Data Structures and Algorithms',
      tags: ['DSA', 'Placements', 'LeetCode', 'InterviewPreparation'],
      author: zaid._id,
      views: 52,
      isSolved: false,
      answers: [
        {
          author: rahul._id,
          content: 'Start with Arrays, Strings, HashMaps, and Two-pointer approaches on LeetCode/Striver A2Z sheet. Once comfortable, move to Linked Lists, Binary Trees, and Recursion. Spend at least 1-2 hours daily solving 2-3 medium problems consistently!',
          isAccepted: false,
          upvotes: [zaid._id, karthik._id]
        }
      ]
    });

    console.log('[Seed] Created technical discussions with accepted answers.');

    // 6. Create Student Collaboration Projects
    await Project.create([
      {
        title: 'BITM Smart Campus Ride Sharing',
        description: 'A dedicated web and mobile platform for BITM day-scholar students and faculty traveling between Ballari city center, Cantonment, and the BITM campus to pool auto-rickshaws and two-wheelers safely.',
        owner: rahul._id,
        technologies: ['React.js', 'Node.js', 'Express', 'MongoDB', 'Google Maps API'],
        githubUrl: 'https://github.com',
        liveDemoUrl: 'https://bitm-rides.vercel.app',
        image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop&q=80',
        category: 'Web App',
        isOpenForCollaboration: true,
        rolesNeeded: ['UI/UX Designer', 'Mobile App Developer (Flutter)', 'Backend Security Reviewer'],
        collaborators: [pooja._id],
        stars: [pooja._id, karthik._id, ananya._id]
      },
      {
        title: 'Crop Disease Identifier for Ballari Agriculture',
        description: 'Deep convolutional neural network model trained on localized crops in Kalyana-Karnataka region (Cotton, Chilli, Groundnut) to identify pest and blight damage from leaf photos.',
        owner: pooja._id,
        technologies: ['Python', 'PyTorch', 'FastAPI', 'React Native', 'OpenCV'],
        githubUrl: 'https://github.com',
        image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&auto=format&fit=crop&q=80',
        category: 'AI/ML',
        isOpenForCollaboration: true,
        rolesNeeded: ['Frontend Developer', 'Data Annotation Specialist'],
        collaborators: [],
        stars: [rahul._id, ananya._id]
      }
    ]);

    console.log('[Seed] Created collaboration projects.');

    // 7. Create Opportunities (Internships, Hackathons, Placements)
    await Opportunity.create([
      {
        title: 'Software Engineer Intern (Frontend / Full Stack)',
        organization: 'Infosys Springboard / Campus Connect',
        category: 'Internship',
        description: 'Opportunity for 5th and 7th semester engineering students to work on cutting-edge enterprise cloud web applications. 6-month paid internship with pre-placement interview (PPI) opportunity.',
        eligibility: 'B.E. 6th / 7th Sem (CSE, ISE, AIML, ECE) with minimum 6.5 CGPA and no active backlogs.',
        location: 'Bengaluru / Hybrid',
        stipendOrPrize: '₹25,000 / month',
        applyLink: 'https://infyspringboard.onwingspan.com',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days ahead
        postedBy: admin._id,
        isOfficial: true,
        status: 'approved'
      },
      {
        title: 'Smart India Hackathon 2025 - College Internal Screening',
        organization: 'Ministry of Education & BITM Incubation Center',
        category: 'Hackathon',
        description: 'BITM Internal Hackathon to nominate top student teams for SIH 2025 national edition. 36 problem statements across Hardware and Software categories.',
        eligibility: 'All branches and semesters of BITM (Teams of 6 with at least one female member).',
        location: 'BITM Seminar Hall & Main Computer Center',
        stipendOrPrize: '₹50,000 Total Cash Pool + Incubation Funding',
        applyLink: 'https://www.sih.gov.in',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        postedBy: admin._id,
        isOfficial: true,
        status: 'approved'
      },
      {
        title: 'Graduate Engineer Trainee - Campus Placement Drive',
        organization: 'TCS - Tata Consultancy Services',
        category: 'Placement Opportunity',
        description: 'TCS National Qualifier Test (NQT) on-campus drive at BITM Ballari for 2025 passing out batch. Roles: TCS Ninja & TCS Digital.',
        eligibility: '7th/8th Semester B.E. (All branches), 60% throughout 10th, 12th, and Engineering.',
        location: 'BITM Campus, Ballari',
        stipendOrPrize: '₹3.6 LPA - ₹7.2 LPA CTC',
        applyLink: 'https://nextstep.tcs.com',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        postedBy: admin._id,
        isOfficial: true,
        status: 'approved'
      }
    ]);

    console.log('[Seed] Created internships and career opportunities.');

    // 8. Create Events
    await Event.create([
      {
        title: 'BITM INVENTO 2025 - Annual National Techno-Cultural Fest',
        description: 'The flagship technical extravaganza of Ballari Institute of Technology and Management featuring Hackathons, Coding Marathons, Robotics Combat, Paper Presentations, and Technical Quizzes.',
        eventType: 'Tech Fest',
        date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        venue: 'BITM Campus Grounds & Main Auditorium, Ballari',
        organizer: 'BITM Student Council & Technical Clubs',
        registrationLink: 'https://bitm.edu.in/invento2025',
        bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
        interestedStudents: [rahul._id, pooja._id, karthik._id, ananya._id],
        createdBy: admin._id
      },
      {
        title: 'Hands-on Workshop: Full-Stack React & Node.js Masterclass',
        description: 'Intensive two-day bootcamp covering React Hooks, REST API architecture, JWT authentication, and MongoDB database modeling for 2nd and 3rd year engineering students.',
        eventType: 'Workshop',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        venue: 'Lab 4, Computer Science Block, BITM',
        organizer: 'Department of Computer Science & Engineering',
        registrationLink: 'https://bitm.edu.in/workshops/react-fullstack',
        bannerImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
        interestedStudents: [rahul._id, zaid._id],
        createdBy: admin._id
      }
    ]);

    console.log('[Seed] Created campus events and workshops.');

    // 9. Create Messages
    await Message.create([
      {
        sender: pooja._id,
        receiver: rahul._id,
        text: 'Hey Rahul! Did you submit the abstract for the Smart India Hackathon internal round?',
        read: true,
        createdAt: new Date(Date.now() - 3600000 * 5)
      },
      {
        sender: rahul._id,
        receiver: pooja._id,
        text: 'Yes Pooja, submitted it this morning under the Smart Agriculture bucket! Our mentor approved the problem definition.',
        read: true,
        createdAt: new Date(Date.now() - 3600000 * 4)
      },
      {
        sender: pooja._id,
        receiver: rahul._id,
        text: 'Awesome! Let us meet at the library discussion hall tomorrow afternoon to finalize the UI slides.',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 2)
      }
    ]);

    console.log('[Seed] Created messages between connected students.');

    // 10. Create Official Announcements
    await Announcement.create([
      {
        title: 'VTU Odd Semester Examination Schedule & Hall Ticket Notification',
        content: 'All B.E. 3rd, 5th, and 7th-semester students are hereby informed that Visvesvaraya Technological University (VTU) has released the tentative timetable for the upcoming semester examinations. Hall tickets will be issued at the departmental offices upon clearing all library and lab dues.',
        priority: 'Urgent',
        targetDepartment: 'All',
        postedBy: admin._id
      },
      {
        title: 'TCS & Infosys Campus Placement Preparation Mock Interviews',
        content: 'The Training & Placement Cell of BITM will be conducting mock technical and HR interview rounds this Saturday starting at 9:30 AM in the Placement Training Center. Formal dress code is mandatory.',
        priority: 'Important',
        targetDepartment: 'All',
        postedBy: admin._id
      }
    ]);

    console.log('[Seed] Created official college announcements.');

    // 11. Create Notifications
    await Notification.create([
      {
        recipient: rahul._id,
        sender: zaid._id,
        type: 'connection_request',
        message: 'Mohammed Zaid sent you a connection request.',
        link: '/connections'
      },
      {
        recipient: rahul._id,
        sender: pooja._id,
        type: 'new_message',
        message: 'Pooja Reddy sent you a new message.',
        link: '/messages'
      },
      {
        recipient: rahul._id,
        sender: admin._id,
        type: 'admin_announcement',
        message: 'Official Announcement: VTU Odd Semester Examination Schedule & Hall Ticket Notification',
        link: '/announcements'
      }
    ]);

    console.log('[Seed] Created notifications.');

    console.log('=============================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================');
    console.log('Admin Account:');
    console.log('Email: admin@bitm.edu.in');
    console.log('Password: Admin@BITM2024');
    console.log('---------------------------------------------');
    console.log('Student Accounts:');
    console.log('1. rahul.cs@bitm.edu.in (USN: 3BR21CS045) / Password@123');
    console.log('2. pooja.aiml@bitm.edu.in (USN: 3BR21AI015) / Password@123');
    console.log('3. karthik.is@bitm.edu.in (USN: 3BR22IS023) / Password@123');
    console.log('4. ananya.ec@bitm.edu.in (USN: 3BR22EC052) / Password@123');
    console.log('5. zaid.cs@bitm.edu.in (USN: 3BR23CS089) / Password@123');
    console.log('=============================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
