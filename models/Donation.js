const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'USD' },
  purpose: { 
    type: String, 
    enum: ['General Fund', 'Scholarship', 'Infrastructure', 'Research', 'Events', 'Other'],
    default: 'General Fund'
  },
  description: { type: String },
  isAnonymous: { type: Boolean, default: false },
  paymentMethod: { 
    type: String, 
    enum: ['Credit Card', 'PayPal', 'Bank Transfer', 'Check'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  transactionId: { type: String },
  receipt: { type: String }, // URL to receipt
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);

