const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    company: {
      type: String,
      trim: true,
      default: ''
    },
    source: {
      type: String,
      enum: ['Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event', 'Other'],
      default: 'Website'
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'lost'],
      default: 'new'
    },
    notes: [NoteSchema]
  },
  {
    timestamps: true  // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Lead', LeadSchema);
