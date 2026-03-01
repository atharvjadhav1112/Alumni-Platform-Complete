const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  graduationYear: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  degree: {
    type: String,
    required: true,
    enum: ['Bachelor\'s', 'Master\'s', 'PhD', 'Associate', 'Certificate', 'Other']
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500
  },
  currentJob: {
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    isCurrent: { type: Boolean, default: true },
    description: String,
    salary: { min: Number, max: Number, currency: String }
  },
  jobHistory: [{
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    description: String,
    isCurrent: { type: Boolean, default: false }
  }],
  skills: [String],
  interests: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
