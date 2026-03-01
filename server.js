const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // ✅ Load environment variables

// Import models
const User = require('./models/User');
// 🚨 NEW: Import the Admin model (assuming you have created models/Admin.js)
const Admin = require('./models/Admin'); 
const Event = require('./models/Event');
const Announcement = require('./models/Announcement');
const Mentorship = require('./models/Mentorship');
const Job = require('./models/Job');
const Donation = require('./models/Donation');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Admin Authorization Middleware (Helper function to check permissions)
const authorizeAdmin = async (req, res, next) => {
    // Check if the user ID from the token exists in the Admin collection
    const admin = await Admin.findById(req.user.userId);
    if (admin && admin.role === 'admin') {
        req.admin = admin; // Attach admin details to request
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};


// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  // The JWT token payload must now specify if it's an admin or user token 
  // (We check the DB later for admin permissions, but this verifies the JWT structure/signature)
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ✅ Database connection (Atlas or fallback to localhost)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/alumni_platform';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Basic routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Alumni Platform API is working!' });
});

// -----------------------------------------------------------
// 🚨 Alumni/User AUTHENTICATION ROUTES (User Collection)
// -----------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, graduationYear, department, degree } = req.body;

    // Check if a standard user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if an admin exists with the same email (to prevent collision)
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
        return res.status(400).json({ message: 'An administrative account exists with this email' });
    }

    // Create new user (Alumni only)
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      graduationYear,
      department,
      degree
    });

    await user.save();

    // Generate JWT token (Only standard user ID is included)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        graduationYear: user.graduationYear,
        department: user.department,
        degree: user.degree,
        isAdmin: false // Explicitly set to false for frontend
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user (Alumni only)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token (Only standard user ID is included)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        graduationYear: user.graduationYear,
        department: user.department,
        degree: user.degree,
        isAdmin: false // Explicitly set to false for frontend
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});


// -----------------------------------------------------------
// 🚨 NEW: Admin AUTHENTICATION ROUTES (Admin Collection)
// -----------------------------------------------------------

// Dedicated Admin Login Endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    // Since the Admin model will have its own comparePassword method:
    const isMatch = await bcrypt.compare(password, admin.password); 
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // JWT token for Admin (Note: Admin ID is used for userId)
    const token = jwt.sign(
      { userId: admin._id, email: admin.email, role: 'admin' }, 
      JWT_SECRET,
      { expiresIn: "1d" } // Shorter expiry for admin session
    );

    res.json({ 
      message: 'Admin login successful',
      token, 
      user: { 
        id: admin._id, 
        name: admin.name, 
        email: admin.email,
        isAdmin: true // Must be true for client-side routing
      } 
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: "Server error during admin login" });
  }
});

// -----------------------------------------------------------
// 🌐 Standard User Routes (User Collection)
// -----------------------------------------------------------

app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    // Check User collection first
    let user = await User.findById(req.user.userId);

    // If not found in User, check Admin collection
    if (!user) {
        user = await Admin.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Account not found' });
        }
        // If it's an Admin, attach isAdmin flag for frontend compatibility
        user = { ...user.toObject(), isAdmin: true };
    } else {
        // If it's a regular user, ensure isAdmin is false
        user = { ...user.toObject(), isAdmin: false };
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile only for Alumni
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    // Only allow update if the user is a standard Alumni (User collection)
    const user = await User.findById(req.user.userId);
    if (!user) {
        return res.status(403).json({ message: 'Admin profiles cannot be updated via this route.' });
    }
    
    const updates = req.body;
    delete updates.password; 
    delete updates.email; 
    delete updates._id; 

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true, runValidators: true }
    );

    // Explicitly add isAdmin: false back for frontend compatibility
    res.json({ ...updatedUser.toObject(), isAdmin: false });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enhanced profile routes (photo/job) - restricted to Alumni
app.put('/api/users/profile/photo', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
        return res.status(403).json({ message: 'Admin profiles cannot be updated via this route.' });
    }
    const { profilePicture } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { profilePicture },
      { new: true }
    ).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Profile photo update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/profile/job', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
        return res.status(403).json({ message: 'Admin profiles cannot be updated via this route.' });
    }
    const { currentJob, jobHistory } = req.body;
    const updateData = {};
    
    if (currentJob) updateData.currentJob = currentJob;
    if (jobHistory) updateData.jobHistory = jobHistory;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Job update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Alumni directory routes (ONLY QUERYING USER COLLECTION)
app.get('/api/alumni', async (req, res) => {
  try {
    const { search, department, graduationYear, page = 1, limit = 12 } = req.query;
    // 💡 FIX: Query only the User collection (which is now Alumni)
    const query = { isActive: true }; 
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { 'currentJob.company': { $regex: search, $options: 'i' } },
        { 'currentJob.title': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }
    
    if (graduationYear) {
      query.graduationYear = parseInt(graduationYear);
    }
    
    const skip = (page - 1) * limit;
    const alumni = await User.find(query) // Only searches the User collection
      .select('-password -email -isAdmin') // Ensure isAdmin and password are removed
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      alumni,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Alumni fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// -----------------------------------------------------------
// 🔒 Admin-Protected Routes (Using authorizeAdmin)
// -----------------------------------------------------------

// Event/Announcement/Job POST/PUT/DELETE routes that require admin checks are simplified:
// Since only Alumni can use the standard routes, we check if they are the organizer/author/poster OR if the requester is an Admin

// Update Event - Check if organizer OR Admin
app.put('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) { return res.status(404).json({ message: 'Event not found' }); }
    
    // Check if user is the organizer (Alumni)
    if (event.organizer.toString() === req.user.userId) {
      // User is the organizer, proceed.
    } else {
      // Check if user is an Admin
      const admin = await Admin.findById(req.user.userId);
      if (!admin || admin.role !== 'admin') {
          return res.status(403).json({ message: 'Not authorized to update this event' });
      }
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'firstName lastName email');
    
    res.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error('Event update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Announcement - Check if author OR Admin
app.put('/api/announcements/:id', authenticateToken, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) { return res.status(404).json({ message: 'Announcement not found' }); }
    
    // Check if user is the author (Alumni)
    if (announcement.author.toString() === req.user.userId) {
        // User is the author, proceed.
    } else {
        // Check if user is an Admin
        const admin = await Admin.findById(req.user.userId);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this announcement' });
        }
    }
    
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName profilePicture');
    
    res.json({ success: true, data: updatedAnnouncement });
  } catch (error) {
    console.error('Announcement update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Job - Check if poster OR Admin
app.put('/api/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) { return res.status(404).json({ message: 'Job not found' }); }
    
    // Check if user is the poster (Alumni)
    if (job.postedBy.toString() === req.user.userId) {
        // User is the poster, proceed.
    } else {
        // Check if user is an Admin
        const admin = await Admin.findById(req.user.userId);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this job' });
        }
    }
    
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'firstName lastName profilePicture');
    
    res.json({ success: true, data: updatedJob });
  } catch (error) {
    console.error('Job update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Create default admin user (run once) - NOW USES ADMIN COLLECTION
app.post('/api/admin/create-admin', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if admin already exists in the Admin collection
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }
    
    // Create admin user in the Admin collection
    const hashedPassword = await bcrypt.hash(password || 'admin123', 10);

    const admin = new Admin({
      name: `${firstName || 'College'} ${lastName || 'Admin'}`,
      email: email || 'admin@college.edu',
      password: hashedPassword,
      role: 'admin'
    });
    
    await admin.save();
    
    res.status(201).json({ 
      message: 'Admin user created successfully',
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        isAdmin: true
      }
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Admin routes (now use authorizeAdmin middleware for clean separation)
app.get('/api/admin/users', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // Fetch users (Alumni) - Admin details are NOT fetched here
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/announcements', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // Use req.user.userId from token (which is the Admin ID) as the author
    const announcement = new Announcement({
      ...req.body,
      author: req.user.userId 
    });
    
    await announcement.save();
    // Populate uses the ID, which will be found in the Admin collection now
    await announcement.populate('author', 'name email'); 
    res.status(201).json(announcement);
  } catch (error) {
    console.error('Announcement creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin user management (Alumni collection)
app.put('/api/admin/users/:userId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Since only Alumni are in this collection, we don't worry about isAdmin flag.
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/users/:userId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if the user is trying to delete the currently logged-in Admin
    if (userId === req.user.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Check if the user being deleted is a regular Alumni account
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
        // Optionally, check if the ID refers to an Admin account to provide a proper error
        return res.status(404).json({ message: 'User not found in alumni collection' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin job management
app.get('/api/admin/jobs', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('postedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Admin jobs fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/jobs/:jobId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { jobId } = req.params;
    const updates = req.body;
    
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      updates,
      { new: true }
    ).populate('postedBy', 'firstName lastName email');
    
    res.json(updatedJob);
  } catch (error) {
    console.error('Job update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/jobs/:jobId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { jobId } = req.params;
    await Job.findByIdAndDelete(jobId);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Job deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin statistics
app.get('/api/admin/stats', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments(); // Alumni
    const totalAdmins = await Admin.countDocuments(); // Admins
    const totalAlumni = await User.countDocuments({ isActive: true });
    const totalJobs = await Job.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalAnnouncements = await Announcement.countDocuments();
    const totalDonations = await Donation.countDocuments({ status: 'Completed' });
    
    // Fetch only Alumni as recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email createdAt');
    
    const recentJobs = await Job.find()
      .populate('postedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title company postedBy createdAt');
    
    res.json({
      stats: {
        totalUsers: totalUsers + totalAdmins, // Display total accounts
        totalAlumni,
        totalJobs,
        totalEvents,
        totalAnnouncements,
        totalDonations
      },
      recentUsers,
      recentJobs
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve static files (after API routes)
app.use(express.static('frontend'));
app.use('/frontend', express.static('frontend'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend available at http://localhost:${PORT}`);
});