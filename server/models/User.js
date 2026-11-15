const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: [{ type: String }],
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  date: { type: String, default: '' }
}, { _id: true });

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  organization: { type: String, required: true },
  issueDate: { type: String, default: '' },
  credentialUrl: { type: String, default: '' }
}, { _id: true });

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  year: { type: String, default: '' }
}, { _id: true });

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide full name'],
    trim: true
  },
  usn: {
    type: String,
    required: [true, 'Please provide USN'],
    unique: true,
    uppercase: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
    select: false // Do not return password by default
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'deactivated'],
    default: 'active'
  },
  department: {
    type: String,
    required: [true, 'Please select department'],
    enum: [
      'Computer Science & Engineering',
      'Information Science & Engineering',
      'Artificial Intelligence & Machine Learning',
      'Electronics & Communication Engineering',
      'Electrical & Electronics Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Management Studies (MBA)'
    ]
  },
  semester: {
    type: Number,
    min: 1,
    max: 8,
    default: 1
  },
  section: {
    type: String,
    trim: true,
    default: 'A'
  },
  profilePicture: {
    type: String,
    default: ''
  },
  headline: {
    type: String,
    default: ''
  },
  aboutMe: {
    type: String,
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  projects: [projectSchema],
  certifications: [certificationSchema],
  achievements: [achievementSchema],
  github: {
    type: String,
    default: ''
  },
  linkedin: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  privacy: {
    showPhone: { type: Boolean, default: false },
    showEmail: { type: Boolean, default: true }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate Profile Completion Percentage
userSchema.virtual('profileCompletion').get(function () {
  let score = 0;
  if (this.fullName) score += 10;
  if (this.usn) score += 10;
  if (this.email) score += 10;
  if (this.department) score += 10;
  if (this.aboutMe && this.aboutMe.length > 20) score += 15;
  if (this.profilePicture) score += 10;
  if (this.skills && this.skills.length > 0) score += 15;
  if (this.interests && this.interests.length > 0) score += 10;
  if (this.projects && this.projects.length > 0) score += 10;
  if (this.github || this.linkedin) score += 10;
  return Math.min(score, 100);
});

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
