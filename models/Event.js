const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['Networking', 'Workshop', 'Reunion', 'Conference', 'Social', 'Other']
  },
  maxAttendees: {
    type: Number,
    default: null
  },
  currentAttendees: {
    type: Number,
    default: 0
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  virtualLink: {
    type: String,
    default: ''
  },
  requirements: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  registrationDeadline: {
    type: Date
  }
}, {
  timestamps: true
});

// Check if event is full
eventSchema.virtual('isFull').get(function() {
  if (!this.maxAttendees) return false;
  return this.currentAttendees >= this.maxAttendees;
});

// Check if registration is open
eventSchema.virtual('isRegistrationOpen').get(function() {
  if (this.registrationDeadline) {
    return new Date() < this.registrationDeadline;
  }
  return this.date > new Date();
});

module.exports = mongoose.model('Event', eventSchema);
