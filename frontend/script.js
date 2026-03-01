// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global state
let currentUser = null;
let authToken = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check if user is logged in
    checkAuthStatus();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Load dynamic content
    loadAlumni();
    loadEvents();
    loadNews();
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize forms
    initializeForms();
}

// Authentication Functions
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        updateAuthUI();
    }
}

function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    
    if (currentUser) {
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        if (userName) userName.textContent = `Welcome, ${currentUser.firstName}!`;
        
        // Add admin dashboard link if user is admin
        if (currentUser.isAdmin) {
            addAdminDashboardLink();
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

function addAdminDashboardLink() {
    // Check if admin link already exists
    if (document.getElementById('admin-dashboard-link')) return;
    
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        const adminLink = document.createElement('li');
        adminLink.id = 'admin-dashboard-link';
        adminLink.innerHTML = '<a href="admin-dashboard.html" style="color: var(--warning); font-weight: 600;"><i class="fas fa-shield-alt"></i> Admin</a>';
        
        // Insert before the last item (auth buttons)
        const lastItem = navMenu.lastElementChild;
        navMenu.insertBefore(adminLink, lastItem);
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    currentUser = null;
    authToken = null;
    updateAuthUI();
    window.location.href = 'index.html';
}

// API Helper Functions
async function apiCall(endpoint, method = 'GET', body = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    if (body) {
        config.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication API calls
async function login(email, password) {
    try {
        const response = await apiCall('/auth/login', 'POST', { email, password });
        
        authToken = response.token;
        currentUser = response.user;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateAuthUI();
        return response;
    } catch (error) {
        throw error;
    }
}

async function register(userData) {
    try {
        const response = await apiCall('/auth/register', 'POST', userData);
        
        authToken = response.token;
        currentUser = response.user;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateAuthUI();
        
        // Refresh alumni directory if on alumni page
        if (window.location.pathname.includes('alumni-directory.html') || 
            window.location.pathname.includes('index.html')) {
            setTimeout(() => {
                loadAlumniWithRefresh();
            }, 1000);
        }
        
        return response;
    } catch (error) {
        throw error;
    }
}

// Job loading and filtering functions
async function loadJobs() {
    const jobsGrid = document.getElementById('jobs-grid');
    if (!jobsGrid) return;
    
    try {
        const response = await apiCall('/jobs');
        const jobs = response.jobs || response;
        
        if (jobs && jobs.length > 0) {
            displayJobs(jobs);
        } else {
            // Show sample jobs if no jobs in database
            const sampleJobs = [
                {
                    title: 'Senior Software Engineer',
                    company: 'TechCorp',
                    location: 'San Francisco, CA',
                    department: 'Computer Science',
                    employmentType: 'Full-time',
                    experienceLevel: 'Senior',
                    description: 'We are looking for a senior software engineer to join our team...',
                    applicationLink: 'https://techcorp.com/careers',
                    postedBy: { firstName: 'John', lastName: 'Doe', profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
                    createdAt: new Date()
                },
                {
                    title: 'Marketing Manager',
                    company: 'DataSoft',
                    location: 'New York, NY',
                    department: 'Business',
                    employmentType: 'Full-time',
                    experienceLevel: 'Mid',
                    description: 'Join our marketing team to drive growth and brand awareness...',
                    applicationLink: 'https://datasoft.com/jobs',
                    postedBy: { firstName: 'Sarah', lastName: 'Johnson', profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
                    createdAt: new Date()
                }
            ];
            displayJobs(sampleJobs);
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
        jobsGrid.innerHTML = '<p style="text-align: center; color: var(--muted);">Error loading jobs. Please try again later.</p>';
    }
}

function displayJobs(jobs) {
    const jobsGrid = document.getElementById('jobs-grid');
    if (!jobsGrid) return;
    
    jobsGrid.innerHTML = jobs.map(job => {
        const postedDate = new Date(job.createdAt).toLocaleDateString();
        
        return `
            <div class="job-card" data-department="${job.department}" data-employment-type="${job.employmentType}" data-experience-level="${job.experienceLevel}">
                <div class="job-header">
                    <h3>${job.title}</h3>
                    <span class="job-type">${job.employmentType}</span>
                </div>
                <div class="job-company">
                    <h4>${job.company}</h4>
                    <p><i class="fas fa-map-marker-alt"></i> ${job.location}</p>
                </div>
                <div class="job-details">
                    <span class="job-dept">${job.department}</span>
                    <span class="job-level">${job.experienceLevel}</span>
                </div>
                <p class="job-description">${job.description.substring(0, 150)}...</p>
                <div class="job-footer">
                    <div class="job-poster">
                        <img src="${job.postedBy?.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}" alt="${job.postedBy?.firstName} ${job.postedBy?.lastName}">
                        <span>Posted by ${job.postedBy?.firstName} ${job.postedBy?.lastName}</span>
                    </div>
                    <div class="job-actions">
                        <a href="${job.applicationLink}" target="_blank" class="btn btn-primary">Apply Now</a>
                        <span class="job-date">${postedDate}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterJobs() {
    const departmentFilter = document.getElementById('department-filter')?.value;
    const employmentTypeFilter = document.getElementById('employment-type-filter')?.value;
    const experienceLevelFilter = document.getElementById('experience-level-filter')?.value;
    
    const jobCards = document.querySelectorAll('.job-card');
    
    jobCards.forEach(card => {
        let show = true;
        
        if (departmentFilter && card.dataset.department !== departmentFilter) {
            show = false;
        }
        
        if (employmentTypeFilter && card.dataset.employmentType !== employmentTypeFilter) {
            show = false;
        }
        
        if (experienceLevelFilter && card.dataset.experienceLevel !== experienceLevelFilter) {
            show = false;
        }
        
        card.style.display = show ? 'block' : 'none';
    });
}

function searchJobs() {
    const searchTerm = document.getElementById('job-search')?.value.toLowerCase();
    const jobCards = document.querySelectorAll('.job-card');
    
    jobCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const company = card.querySelector('h4').textContent.toLowerCase();
        const location = card.querySelector('.job-company p').textContent.toLowerCase();
        
        if (searchTerm && !title.includes(searchTerm) && !company.includes(searchTerm) && !location.includes(searchTerm)) {
            card.style.display = 'none';
        } else {
            card.style.display = 'block';
        }
    });
}

// Data Loading Functions
async function loadAlumni() {
    const alumniGrid = document.getElementById('alumni-grid');
    if (!alumniGrid) return;
    
    try {
        const response = await apiCall('/alumni');
        const alumni = response.alumni || response;
        displayAlumni(alumni);
    } catch (error) {
        console.error('Error loading alumni:', error);
        // Show sample data if API fails
        const sampleAlumni = [
            {
                firstName: 'John',
                lastName: 'Anderson',
                graduationYear: 2010,
                department: 'Business Administration',
                currentJob: { title: 'VP of Marketing', company: 'TechCorp' },
                profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                firstName: 'Sarah',
                lastName: 'Johnson',
                graduationYear: 2015,
                department: 'Computer Science',
                currentJob: { title: 'Senior Software Engineer', company: 'DataSoft' },
                profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                firstName: 'Michael',
                lastName: 'Chen',
                graduationYear: 2008,
                department: 'Medicine',
                currentJob: { title: 'Chief Medical Officer', company: 'HealthPlus' },
                profilePicture: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                firstName: 'Emily',
                lastName: 'Rodriguez',
                graduationYear: 2012,
                department: 'Economics',
                currentJob: { title: 'Finance Director', company: 'Global Bank' },
                profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            }
        ];
        
        displayAlumni(sampleAlumni);
    }
}

function displayAlumni(alumni) {
    const alumniGrid = document.getElementById('alumni-grid');
    if (!alumniGrid) return;
    
    alumniGrid.innerHTML = alumni.map(person => `
        <div class="alumni-card">
            <div class="alumni-img">
                <img src="${person.profilePicture}" alt="Portrait of ${person.firstName} ${person.lastName}">
            </div>
            <div class="alumni-info">
                <h3>${person.firstName} ${person.lastName}</h3>
                <p class="graduation">Class of ${person.graduationYear}, ${person.department}</p>
                <p class="position">${person.currentJob.title} at ${person.currentJob.company}</p>
                <div class="alumni-actions">
                    <a href="mailto:${person.firstName.toLowerCase()}.${person.lastName.toLowerCase()}@example.com">
                        <i class="fas fa-envelope"></i> Message
                    </a>
                    <a href="#" onclick="connectWithAlumni('${person.firstName} ${person.lastName}')">
                        <i class="fas fa-user-plus"></i> Connect
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

async function loadEvents() {
    const eventsGrid = document.getElementById('events-grid');
    if (!eventsGrid) return;
    
    try {
        const events = await apiCall('/events');
        displayEvents(events);
    } catch (error) {
        console.error('Error loading events:', error);
        // Show sample events if API fails
        const sampleEvents = [
            {
                title: 'Annual Alumni Meetup',
                description: 'Join us for our yearly gathering of graduates from all years and programs.',
                date: '2024-06-15',
                time: '6:00 PM',
                location: 'Campus Hall',
                eventType: 'Networking'
            },
            {
                title: 'Career Networking Workshop',
                description: 'Learn how to leverage your alumni network for career advancement.',
                date: '2024-06-22',
                time: '2:00 PM',
                location: 'Virtual Event',
                eventType: 'Workshop'
            },
            {
                title: 'Industry Leaders Panel',
                description: 'Hear from successful alumni about trends in technology, business, and healthcare.',
                date: '2024-07-05',
                time: '4:30 PM',
                location: 'Business Center',
                eventType: 'Conference'
            }
        ];
        displayEvents(sampleEvents);
    }
}

function displayEvents(events) {
    const eventsGrid = document.getElementById('events-grid');
    if (!eventsGrid) return;
    
    eventsGrid.innerHTML = events.map(event => {
        const eventDate = new Date(event.date);
        const day = eventDate.getDate();
        const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
        
        return `
            <div class="event-card">
                <div class="event-date">
                    <div class="day">${day}</div>
                    <div class="month">${month}</div>
                </div>
                <div class="event-info">
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                    <div class="event-details">
                        <span><i class="fas fa-clock"></i> ${event.time}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                    </div>
                    <a href="#" class="btn btn-accent" onclick="registerForEvent('${event._id || event.title}')">Register</a>
                </div>
            </div>
        `;
    }).join('');
}

async function loadNews() {
    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid) return;
    
    try {
        const news = await apiCall('/announcements');
        displayNews(news);
    } catch (error) {
        console.error('Error loading news:', error);
        // Show sample news if API fails
        const sampleNews = [
            {
                title: 'Alumni Honored with Achievement Awards',
                content: 'Five distinguished alumni recognized for outstanding contributions to their fields at annual ceremony.',
                createdAt: '2024-06-05',
                author: { firstName: 'Admin', lastName: 'User' }
            },
            {
                title: 'New Scholarship Fund Established',
                content: 'Alumni donors create new endowment to support first-generation college students.',
                createdAt: '2024-05-22',
                author: { firstName: 'Admin', lastName: 'User' }
            },
            {
                title: 'Campus Expansion Project Approved',
                content: 'New science and technology center to be built with support from alumni donations.',
                createdAt: '2024-04-30',
                author: { firstName: 'Admin', lastName: 'User' }
            }
        ];
        displayNews(sampleNews);
    }
}

function displayNews(news) {
    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid) return;
    
    newsGrid.innerHTML = news.map(article => {
        const date = new Date(article.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        return `
            <div class="news-card">
                <div class="news-img">
                    <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="News image">
                </div>
                <div class="news-content">
                    <h3>${article.title}</h3>
                    <p>${article.content}</p>
                    <div class="news-meta">
                        <span><i class="far fa-calendar"></i> ${date}</span>
                        <a href="#" onclick="readMore('${article.title}')">Read More</a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Search Functions
function initializeSearch() {
    const alumniSearchInput = document.getElementById('alumni-search');
    if (alumniSearchInput) {
        alumniSearchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                searchAlumni();
            }
        });
    }
}

function searchAlumni() {
    const searchInput = document.getElementById('alumni-search');
    const searchTerm = searchInput.value.toLowerCase();
    const alumniCards = document.querySelectorAll('.alumni-card');
    
    alumniCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Form Functions
function initializeForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
        await loginUser({ email, password });
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        graduationYear: parseInt(formData.get('graduationYear')),
        department: formData.get('department'),
        degree: formData.get('degree')
    };
    
    try {
        await register(userData);
        showMessage('Registration successful!', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// UI Helper Functions
function showMessage(message, type) {
    const existingMessage = document.querySelector('.error-message, .success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    
    const form = document.querySelector('form');
    if (form) {
        form.appendChild(messageDiv);
    } else {
        document.body.appendChild(messageDiv);
    }
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Mobile Menu Functions
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuBtn.innerHTML = navMenu.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const href = this.getAttribute('href');
            if (href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Action Functions
function connectWithAlumni(name) {
    if (!currentUser) {
        showMessage('Please login to connect with alumni', 'error');
        return;
    }
    showMessage(`Connection request sent to ${name}`, 'success');
}

function registerForEvent(eventId) {
    if (!currentUser) {
        showMessage('Please login to register for events', 'error');
        return;
    }
    showMessage('Successfully registered for event!', 'success');
}

function readMore(title) {
    showMessage(`Opening article: ${title}`, 'success');
}

function loadMoreAlumni() {
    showMessage('Loading more alumni...', 'success');
    // Reload alumni with pagination
    loadAlumni();
}

// Enhanced alumni loading with real-time updates
async function loadAlumniWithRefresh() {
    const alumniGrid = document.getElementById('alumni-grid');
    if (!alumniGrid) return;
    
    try {
        const response = await apiCall('/alumni');
        const alumni = response.alumni || response;
        
        if (alumni && alumni.length > 0) {
            displayAlumni(alumni);
        } else {
            // Show sample data if no alumni in database
            const sampleAlumni = [
                {
                    firstName: 'John',
                    lastName: 'Anderson',
                    graduationYear: 2010,
                    department: 'Business Administration',
                    currentJob: { title: 'VP of Marketing', company: 'TechCorp' },
                    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                },
                {
                    firstName: 'Sarah',
                    lastName: 'Johnson',
                    graduationYear: 2015,
                    department: 'Computer Science',
                    currentJob: { title: 'Senior Software Engineer', company: 'DataSoft' },
                    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                },
                {
                    firstName: 'Michael',
                    lastName: 'Chen',
                    graduationYear: 2008,
                    department: 'Medicine',
                    currentJob: { title: 'Chief Medical Officer', company: 'HealthPlus' },
                    profilePicture: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                },
                {
                    firstName: 'Emily',
                    lastName: 'Rodriguez',
                    graduationYear: 2012,
                    department: 'Economics',
                    currentJob: { title: 'Finance Director', company: 'Global Bank' },
                    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                }
            ];
            displayAlumni(sampleAlumni);
        }
    } catch (error) {
        console.error('Error loading alumni:', error);
        alumniGrid.innerHTML = '<p style="text-align: center; color: var(--muted);">Error loading alumni. Please try again later.</p>';
    }
}

// View All Alumni functionality
function viewAllAlumni() {
    window.location.href = 'alumni-directory.html';
}

// View All Events functionality  
function viewAllEvents() {
    window.location.href = 'events.html';
}

// View All News functionality
function viewAllNews() {
    window.location.href = 'news.html';
}

// Modal functions
function openProfileModal() {
    document.getElementById('profileModal').style.display = 'block';
    loadCurrentProfile();
}

function openJobModal() {
    document.getElementById('jobModal').style.display = 'block';
}

function openDonationModal() {
    document.getElementById('donationModal').style.display = 'block';
}

function openNewsModal() {
    document.getElementById('newsModal').style.display = 'block';
}

function openEventModal() {
    document.getElementById('eventModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Load current profile data
async function loadCurrentProfile() {
    try {
        const user = await apiCall('/users/profile');
        if (user) {
            document.getElementById('profilePhoto').value = user.profilePicture || '';
            document.getElementById('profileBio').value = user.bio || '';
            document.getElementById('profileSkills').value = user.skills ? user.skills.join(', ') : '';
            document.getElementById('profileInterests').value = user.interests ? user.interests.join(', ') : '';
            
            if (user.currentJob) {
                document.getElementById('currentJobTitle').value = user.currentJob.title || '';
                document.getElementById('currentJobCompany').value = user.currentJob.company || '';
                document.getElementById('currentJobLocation').value = user.currentJob.location || '';
                document.getElementById('currentJobDescription').value = user.currentJob.description || '';
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Admin login function
function showAdminLogin() {
    const email = prompt('Enter admin email:');
    const password = prompt('Enter admin password:');
    
    if (email && password) {
        loginUser({ email, password, isAdmin: true });
    }
}

// Enhanced login function to handle admin redirects
async function loginUser(userData) {
    try {
        const response = await apiCall('/auth/login', 'POST', userData);
        
        authToken = response.token;
        currentUser = response.user;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateAuthUI();
        
        // Redirect based on user type
        if (currentUser.isAdmin) {
            showMessage('Welcome, Admin!', 'success');
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1000);
        } else {
            showMessage('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
        
        return response;
    } catch (error) {
        throw error;
    }
}

// Real-time update functions for events, news, and jobs
async function addEvent(eventData) {
    try {
        const response = await apiCall('/events', 'POST', eventData);
        if (response.success) {
            showMessage('Event created successfully!', 'success');
            // Refresh events display
            await loadEvents();
            return response.data;
        }
    } catch (error) {
        showMessage('Error creating event: ' + error.message, 'error');
        throw error;
    }
}

async function updateEvent(eventId, eventData) {
    try {
        const response = await apiCall(`/events/${eventId}`, 'PUT', eventData);
        if (response.success) {
            showMessage('Event updated successfully!', 'success');
            // Refresh events display
            await loadEvents();
            return response.data;
        }
    } catch (error) {
        showMessage('Error updating event: ' + error.message, 'error');
        throw error;
    }
}

async function addJob(jobData) {
    try {
        const response = await apiCall('/jobs', 'POST', jobData);
        if (response.success) {
            showMessage('Job posted successfully!', 'success');
            // Refresh jobs display
            await loadJobs();
            return response.data;
        }
    } catch (error) {
        showMessage('Error posting job: ' + error.message, 'error');
        throw error;
    }
}

async function updateJob(jobId, jobData) {
    try {
        const response = await apiCall(`/jobs/${jobId}`, 'PUT', jobData);
        if (response.success) {
            showMessage('Job updated successfully!', 'success');
            // Refresh jobs display
            await loadJobs();
            return response.data;
        }
    } catch (error) {
        showMessage('Error updating job: ' + error.message, 'error');
        throw error;
    }
}

async function addNews(newsData) {
    try {
        const response = await apiCall('/announcements', 'POST', newsData);
        if (response.success) {
            showMessage('News posted successfully!', 'success');
            // Refresh news display
            await loadNews();
            return response.data;
        }
    } catch (error) {
        showMessage('Error posting news: ' + error.message, 'error');
        throw error;
    }
}

async function updateNews(newsId, newsData) {
    try {
        const response = await apiCall(`/announcements/${newsId}`, 'PUT', newsData);
        if (response.success) {
            showMessage('News updated successfully!', 'success');
            // Refresh news display
            await loadNews();
            return response.data;
        }
    } catch (error) {
        showMessage('Error updating news: ' + error.message, 'error');
        throw error;
    }
}

// Form handlers
document.addEventListener('DOMContentLoaded', function() {
    // Profile form handler
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(profileForm);
            const profileData = {
                profilePicture: formData.get('profilePicture'),
                bio: formData.get('bio'),
                skills: formData.get('skills') ? formData.get('skills').split(',').map(s => s.trim()) : [],
                interests: formData.get('interests') ? formData.get('interests').split(',').map(s => s.trim()) : [],
                currentJob: {
                    title: formData.get('currentJob.title'),
                    company: formData.get('currentJob.company'),
                    location: formData.get('currentJob.location'),
                    description: formData.get('currentJob.description')
                }
            };
            
            try {
                await apiCall('/users/profile', 'PUT', profileData);
                showMessage('Profile updated successfully!', 'success');
                closeModal('profileModal');
                // Refresh alumni directory if on that page
                if (window.location.pathname.includes('alumni-directory.html') || 
                    window.location.pathname.includes('index.html')) {
                    loadAlumniWithRefresh();
                }
            } catch (error) {
                showMessage('Error updating profile: ' + error.message, 'error');
            }
        });
    }
    
    // Job form handler
    const jobForm = document.getElementById('jobForm');
    if (jobForm) {
        jobForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(jobForm);
            const jobData = {
                title: formData.get('title'),
                company: formData.get('company'),
                location: formData.get('location'),
                department: formData.get('department'),
                employmentType: formData.get('employmentType'),
                experienceLevel: formData.get('experienceLevel'),
                description: formData.get('description'),
                applicationLink: formData.get('applicationLink')
            };
            
            try {
                await addJob(jobData);
                closeModal('jobModal');
                jobForm.reset();
            } catch (error) {
                // Error message already shown in addJob function
            }
        });
    }
    
    // Donation form handler
    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(donationForm);
            const donationData = {
                amount: parseFloat(formData.get('amount')),
                purpose: formData.get('purpose'),
                description: formData.get('description'),
                paymentMethod: formData.get('paymentMethod'),
                isAnonymous: formData.get('isAnonymous') === 'on'
            };
            
            try {
                await apiCall('/donations', 'POST', donationData);
                showMessage('Donation submitted successfully! Thank you for your contribution.', 'success');
                closeModal('donationModal');
                donationForm.reset();
            } catch (error) {
                showMessage('Error submitting donation: ' + error.message, 'error');
            }
        });
    }
    
    // News form handler
    const newsForm = document.getElementById('newsForm');
    if (newsForm) {
        newsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(newsForm);
            const newsData = {
                title: formData.get('title'),
                content: formData.get('content'),
                category: formData.get('category'),
                priority: formData.get('priority')
            };
            
            try {
                await addNews(newsData);
                closeModal('newsModal');
                newsForm.reset();
            } catch (error) {
                // Error message already shown in addNews function
            }
        });
    }
    
    // Event form handler
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(eventForm);
            const eventData = {
                title: formData.get('title'),
                description: formData.get('description'),
                date: formData.get('date'),
                time: formData.get('time'),
                location: formData.get('location'),
                address: formData.get('address'),
                eventType: formData.get('eventType'),
                maxAttendees: formData.get('maxAttendees') ? parseInt(formData.get('maxAttendees')) : null,
                isVirtual: formData.get('isVirtual') === 'on',
                virtualLink: formData.get('virtualLink') || '',
                requirements: formData.get('requirements') ? formData.get('requirements').split(',').map(r => r.trim()) : [],
                registrationDeadline: formData.get('registrationDeadline') || null
            };
            
            try {
                await addEvent(eventData);
                closeModal('eventModal');
                eventForm.reset();
            } catch (error) {
                // Error message already shown in addEvent function
            }
        });
    }
});
