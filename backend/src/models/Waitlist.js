import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    clientPhone: {
      type: String,
      required: [true, 'Client phone number is required'],
      trim: true,
    },
    preferredDate: {
      type: String, // Normalized 'YYYY-MM-DD'
      default: '',
    },
    preferredTimeSlot: {
      type: String, // e.g., 'Morning', 'Afternoon', 'Any', or '10:00'
      default: 'Any',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Waiting', 'Notified', 'Booked', 'Cancelled'],
      default: 'Waiting',
      index: true,
    },
    notifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Waitlist = mongoose.model('Waitlist', waitlistSchema);
