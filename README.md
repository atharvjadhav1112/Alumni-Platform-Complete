# 🎓 Alumni Platform

A comprehensive web application designed to connect alumni, facilitate networking, and manage alumni-related activities. Built with Node.js, Express, and MongoDB.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Demo Accounts](#demo-accounts)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 Overview

The Alumni Platform is a full-stack web application that serves as a central hub for:
- **Alumni networking** - Connect with fellow alumni
- **Event management** - Organize and manage alumni events
- **Job opportunities** - Post and browse job listings
- **Mentorship programs** - Facilitate mentoring relationships
- **News & announcements** - Share important updates
- **Donation management** - Track and manage alumni contributions

---

## ✨ Features

- ✅ **User Authentication** - Secure login and registration with JWT
- ✅ **Alumni Directory** - Browse and search alumni profiles
- ✅ **Dashboard** - Personalized user dashboard
- ✅ **Event Management** - Create, view, and manage events
- ✅ **Job Listings** - Post and apply for job opportunities
- ✅ **Mentorship Program** - Connect mentors with mentees
- ✅ **News & Announcements** - Share and view updates
- ✅ **Admin Panel** - Administrative dashboard for platform management
- ✅ **Donation Tracking** - Manage alumni donations
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **Secure API** - Password hashing and token-based authentication

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Tokens for authentication
- **Bcryptjs** - Password hashing
- **CORS** - Cross-Origin Resource Sharing
- **Express-validator** - Input validation

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling
- **JavaScript (ES6+)** - Client-side logic
- **Tailwind CSS** - Utility-first CSS framework

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v14 or higher - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** (optional - the app includes a demo mode without database)
- **Git** (optional - for cloning the repository)
- **Web Browser** - Chrome, Firefox, Safari, or Edge

### Check Installation
```bash
node --version
npm --version
mongod --version  # If MongoDB is installed
```

---

## 🚀 Installation & Setup

### Option 1: Using Batch Script (Windows)

1. **Navigate to the project directory**
   ```bash
   cd "C:\Users\[YourUsername]\Desktop\Alumni-Platform-Complete"
   ```

2. **Run the setup script** (first time only)
   ```bash
   setup.bat
   ```
   This will automatically:
   - Install all required dependencies via npm
   - Set up your environment configuration

3. **Verify installation**
   ```bash
   npm list
   ```

### Option 2: Manual Installation

1. **Navigate to project directory**
   ```bash
   cd path/to/Alumni-Platform-Complete
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create/Update environment file**
   - An `alumni.env` file should already exist
   - Update with your configuration if needed

---

## ⚙️ Running the Application

### Quick Start (Windows)
Double-click **`start-alumni-platform.bat`** to start the server and open the application.

### Manual Start (All Platforms)

1. **Start the server**
   ```bash
   node server.js
   ```

2. **Open in browser**
   - Navigate to: **http://localhost:5000**
   - The application should load automatically

3. **Stop the server**
   - Press `Ctrl + C` in the terminal

---

## 📁 Project Structure

```
Alumni-Platform-Complete/
│
├── frontend/                      # Frontend files
│   ├── index.html                # Homepage
│   ├── login.html                # Login page
│   ├── register.html             # Registration page
│   ├── dashboard.html            # User dashboard
│   ├── alumni-directory.html     # Alumni profiles directory
│   ├── admin-dashboard.html      # Admin control panel
│   ├── events.html               # Events management
│   ├── jobs.html                 # Job listings
│   ├── mentorship.html           # Mentorship program
│   ├── news.html                 # News & announcements
│   ├── script.js                 # Client-side JavaScript
│   └── style.css                 # Styling
│
├── models/                        # Database models
│   ├── User.js                   # User model
│   ├── Admin.js                  # Admin model
│   ├── Event.js                  # Event model
│   ├── Job.js                    # Job listing model
│   ├── Mentorship.js             # Mentorship model
│   ├── Announcement.js           # Announcement model
│   └── Donation.js               # Donation model
│
├── server.js                      # Main Express server
├── alumni.env                     # Environment variables
├── package.json                   # Dependencies configuration
├── setup.bat                      # Setup script
├── start-alumni-platform.bat      # Start script
├── QUICK-START.txt               # Quick start guide
└── README.md                      # This file
```

---

## 👥 Demo Accounts

Use these credentials to test the application:

### Alumni Account
- **Email:** `alumni@example.com`
- **Password:** `password123`

### Admin Account
- **Email:** `admin@example.com`
- **Password:** `admin123`

---

## 🔌 API Endpoints

The application provides the following REST API endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users` - Get all users/alumni
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Jobs
- `GET /api/jobs` - Get all job listings
- `POST /api/jobs` - Post new job (admin)
- `PUT /api/jobs/:id` - Update job (admin)
- `DELETE /api/jobs/:id` - Delete job (admin)

### Mentorship
- `GET /api/mentorship` - Get mentorship programs
- `POST /api/mentorship/apply` - Apply for mentorship

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement (admin)

### Donations
- `GET /api/donations` - Get donation records
- `POST /api/donations` - Record new donation

---

## 🐛 Troubleshooting

### Port 5000 Already in Use
**Problem:** "Port 5000 is already in use"
- **Solution 1:** Close other applications using port 5000
- **Solution 2:** Change the port in `server.js`:
  ```javascript
  const PORT = process.env.PORT || 3000;  // Change 5000 to 3000
  ```

### Node.js Not Found
**Problem:** "'node' is not recognized as an internal or external command"
- **Solution:** Install Node.js from [nodejs.org](https://nodejs.org/)
- **Verify:** Run `node --version` in a new terminal

### Dependencies Not Installed
**Problem:** "Cannot find module 'express'"
- **Solution:** Run the following in the project directory:
  ```bash
  npm install
  ```

### MongoDB Connection Issues
**Problem:** Cannot connect to MongoDB
- **Solution 1:** Start MongoDB service on your system
- **Solution 2:** The app works in demo mode without MongoDB - you can test features without a database

### Page Not Loading at localhost:5000
**Problem:** "Cannot connect to server"
- **Solution 1:** Ensure server is running (check terminal)
- **Solution 2:** Try a different browser
- **Solution 3:** Clear browser cache and try again
- **Solution 4:** Check if firewall is blocking port 5000

### Browser Shows Blank Page
**Problem:** Page loads but shows no content
- **Solution 1:** Check browser console for errors (F12 > Console tab)
- **Solution 2:** Verify `frontend/` folder exists in project directory
- **Solution 3:** Restart the server

---

## 📝 Configuration

The application uses environment variables defined in `alumni.env`:

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/alumni-platform

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d

# Email Configuration (Optional)
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-password
```

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 📞 Support

For issues, questions, or suggestions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing issues on GitHub
3. Create a new issue with detailed information

---

## 🎉 Getting Started

Ready to use the Alumni Platform?

1. **Run setup.bat** (first time)
2. **Run start-alumni-platform.bat** (every time)
3. **Open http://localhost:5000** in your browser
4. **Log in** using demo credentials
5. **Explore** the features!

---

**Last Updated:** March 2026  
**Version:** 1.0.0  
**Built with ❤️ for Alumni Networks**
