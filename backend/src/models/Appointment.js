import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    clientPhone: {
      type: String,
      trim: true,
      default: null,
    },
    date: {
      type: String, // Normalized 'YYYY-MM-DD'
      required: [true, 'Appointment date is required'],
      index: true,
    },
    startTime: {
      type: String, // Normalized 'HH:mm' (24-hour)
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String, // Normalized 'HH:mm'
      required: [true, 'End time is required'],
    },
    durationMinutes: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: ['Booked', 'Done', 'No-show', 'Cancelled'],
      default: 'Booked',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    attendanceConfirmed: {
      type: Boolean,
      default: false,
    },
    attendanceConfirmedAt: {
      type: Date,
      default: null,
    },
    bookingSource: {
      type: String,
      enum: ['client', 'nutritionist'],
      default: 'client',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    isDemoSample: {
      type: Boolean,
      default: false,
    },
    sampleKey: {
      type: String,
      default: null,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: ensure isActive is synchronized with status
appointmentSchema.pre('save', function (next) {
  this.isActive = this.status !== 'Cancelled';
  next();
});

/**
 * Valid MongoDB Partial Unique Index:
 * Ensures only ONE active appointment exists for a given date & startTime.
 * Cancelled appointments have isActive = false, excluding them from the unique index
 * and immediately freeing the slot for new bookings.
 */
appointmentSchema.index(
  { date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
  }
);

export const Appointment = mongoose.model('Appointment', appointmentSchema);
