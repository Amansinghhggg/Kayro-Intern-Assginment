import { Appointment } from '../models/Appointment.js';
import { Waitlist } from '../models/Waitlist.js';
import {
  PRACTICE_CONFIG,
  normalizeDateString,
  normalizeTimeString,
  calculateEndTime,
  formatTimeForDisplay,
} from '../config/schedule.js';

/**
 * Get current date & time in practice timezone (Asia/Kolkata)
 */
function getPracticeDateTime() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: PRACTICE_CONFIG.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const partMap = {};
  for (const p of parts) partMap[p.type] = p.value;

  const currentDate = `${partMap.year}-${partMap.month}-${partMap.day}`;
  const currentTime = `${partMap.hour}:${partMap.minute}`;

  return { currentDate, currentTime };
}

/**
 * Check if a given date & time is in the past in the practice timezone
 */
function isSlotInPast(slotDate, slotTime) {
  const { currentDate, currentTime } = getPracticeDateTime();
  if (slotDate < currentDate) return true;
  if (slotDate === currentDate && slotTime <= currentTime) return true;
  return false;
}

/**
 * Normalizes phone number formatting
 */
function cleanPhone(phone) {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (!trimmed || trimmed.toLowerCase() === 'not provided') return null;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return trimmed;
}

/**
 * GET /api/appointments
 * List appointments with optional filtering
 */
export async function getAppointments(req, res) {
  try {
    const { date, status, clientName, clientPhone } = req.query;
    const filter = {};

    if (date) {
      filter.date = normalizeDateString(date);
    }
    if (status) {
      filter.status = status;
    }
    if (clientName) {
      filter.clientName = { $regex: new RegExp(clientName.trim(), 'i') };
    }
    if (clientPhone) {
      const cleaned = cleanPhone(clientPhone);
      if (cleaned) {
        filter.clientPhone = { $regex: new RegExp(cleaned.replace(/\s+/g, '\\s*'), 'i') };
      }
    }

    const appointments = await Appointment.find(filter).sort({
      date: 1,
      startTime: 1,
    });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message,
    });
  }
}

/**
 * GET /api/appointments/slots
 * Retrieve slot availability for a specified date
 */
export async function getAvailableSlots(req, res) {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "date" (YYYY-MM-DD) is required',
      });
    }

    const normalizedDate = normalizeDateString(date);

    // Fetch all active appointments on this date
    const activeAppointments = await Appointment.find({
      date: normalizedDate,
      status: { $ne: 'Cancelled' },
    }).select('startTime endTime clientName status');

    const bookedTimes = new Set(activeAppointments.map((a) => a.startTime));

    // Map through practice slots
    const slots = PRACTICE_CONFIG.slots.map((time) => {
      const isBooked = bookedTimes.has(time);
      const isPast = isSlotInPast(normalizedDate, time);

      let isAvailable = true;
      let reason = null;

      if (isBooked) {
        isAvailable = false;
        reason = 'Booked';
      } else if (isPast) {
        isAvailable = false;
        reason = 'Past';
      }

      return {
        time,
        formattedTime: formatTimeForDisplay(time),
        endTime: calculateEndTime(time, PRACTICE_CONFIG.slotDurationMinutes),
        isAvailable,
        reason,
      };
    });

    return res.status(200).json({
      success: true,
      date: normalizedDate,
      slots,
      practiceTimezone: PRACTICE_CONFIG.timezone,
    });
  } catch (error) {
    console.error('Error getting slots:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate slot availability',
      error: error.message,
    });
  }
}

/**
 * POST /api/appointments
 * Book a new consultation
 */
export async function createAppointment(req, res) {
  try {
    const { clientName, clientPhone, date, startTime, notes, bookingSource } = req.body;

    if (!clientName || !clientName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Client name is required',
      });
    }

    if (!date || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date and start time are required',
      });
    }

    const normalizedDate = normalizeDateString(date);
    const normalizedTime = normalizeTimeString(startTime);
    const cleanedPhone = cleanPhone(clientPhone);
    const endTime = calculateEndTime(normalizedTime, PRACTICE_CONFIG.slotDurationMinutes);

    // Rule 1: Prevent double booking with server-side check
    const existingActive = await Appointment.findOne({
      date: normalizedDate,
      startTime: normalizedTime,
      status: { $ne: 'Cancelled' },
    });

    if (existingActive) {
      return res.status(409).json({
        success: false,
        code: 'SLOT_OCCUPIED',
        message: 'This time slot is already booked. Please choose another slot.',
      });
    }

    // Create and save
    try {
      const appointment = await Appointment.create({
        clientName: clientName.trim(),
        clientPhone: cleanedPhone,
        date: normalizedDate,
        startTime: normalizedTime,
        endTime,
        durationMinutes: PRACTICE_CONFIG.slotDurationMinutes,
        status: 'Booked',
        bookingSource: bookingSource || 'client',
        notes: notes ? notes.trim() : '',
        attendanceConfirmed: false,
      });

      return res.status(201).json({
        success: true,
        message: 'Consultation booked successfully',
        data: appointment,
      });
    } catch (dbError) {
      // Catch compound unique index collision (code 11000)
      if (dbError.code === 11000) {
        return res.status(409).json({
          success: false,
          code: 'SLOT_OCCUPIED',
          message: 'This time slot was just taken by another client. Please select another time.',
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message,
    });
  }
}

/**
 * PATCH /api/appointments/:id/reschedule
 * Reschedule an existing appointment safely
 */
export async function rescheduleAppointment(req, res) {
  try {
    const { id } = req.params;
    const { newDate, newStartTime } = req.body;

    if (!newDate || !newStartTime) {
      return res.status(400).json({
        success: false,
        message: 'New date and new start time are required for rescheduling',
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cancelled appointments cannot be rescheduled. Please book a new consultation.',
      });
    }

    const normalizedNewDate = normalizeDateString(newDate);
    const normalizedNewTime = normalizeTimeString(newStartTime);
    const newEndTime = calculateEndTime(normalizedNewTime, PRACTICE_CONFIG.slotDurationMinutes);

    // Rule 3: Reschedule safely. Validate destination slot first.
    const destinationOccupied = await Appointment.findOne({
      _id: { $ne: id },
      date: normalizedNewDate,
      startTime: normalizedNewTime,
      status: { $ne: 'Cancelled' },
    });

    if (destinationOccupied) {
      // Original appointment remains strictly unchanged
      return res.status(409).json({
        success: false,
        code: 'SLOT_OCCUPIED',
        message: 'The requested new slot is not available. Your original appointment remains unchanged.',
      });
    }

    const oldDate = appointment.date;
    const oldStartTime = appointment.startTime;

    // Secure the new slot
    appointment.date = normalizedNewDate;
    appointment.startTime = normalizedNewTime;
    appointment.endTime = newEndTime;
    appointment.attendanceConfirmed = false; // Reset confirmation for the new time
    appointment.attendanceConfirmedAt = null;
    await appointment.save();

    // Check for matching waitlist entries for the released slot
    const matchingWaitlist = await Waitlist.find({
      status: 'Waiting',
      $or: [
        { preferredDate: oldDate },
        { preferredDate: '' },
        { preferredDate: null },
      ],
    });

    return res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: appointment,
      releasedSlot: {
        date: oldDate,
        startTime: oldStartTime,
      },
      matchingWaitlist,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        code: 'SLOT_OCCUPIED',
        message: 'The requested new slot was just taken. Your original appointment remains unchanged.',
      });
    }
    console.error('Error rescheduling appointment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reschedule appointment',
      error: error.message,
    });
  }
}

/**
 * PATCH /api/appointments/:id/cancel
 * Cancel an appointment and immediately release the slot
 */
export async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This appointment is already cancelled',
      });
    }

    const releasedSlot = {
      date: appointment.date,
      startTime: appointment.startTime,
    };

    // Mark as Cancelled (Rule 2: keep history, do not delete)
    appointment.status = 'Cancelled';
    await appointment.save();

    // Check waitlist for potential matches to notify
    const matchingWaitlist = await Waitlist.find({
      status: 'Waiting',
      $or: [
        { preferredDate: releasedSlot.date },
        { preferredDate: '' },
        { preferredDate: null },
      ],
    });

    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled. The slot has been released for new bookings.',
      data: appointment,
      releasedSlot,
      matchingWaitlist,
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message,
    });
  }
}

/**
 * PATCH /api/appointments/:id/status
 * Update appointment status (Booked, Done, No-show, Cancelled)
 */
export async function updateAppointmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Booked', 'Done', 'No-show', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    const wasCancelled = appointment.status === 'Cancelled';
    const isNowCancelled = status === 'Cancelled';

    // If un-cancelling back to Booked, check if slot is currently available
    if (wasCancelled && !isNowCancelled) {
      const slotTaken = await Appointment.findOne({
        _id: { $ne: id },
        date: appointment.date,
        startTime: appointment.startTime,
        status: { $ne: 'Cancelled' },
      });

      if (slotTaken) {
        return res.status(409).json({
          success: false,
          code: 'SLOT_OCCUPIED',
          message: 'Cannot re-activate appointment because the slot has already been booked by another client.',
        });
      }
    }

    appointment.status = status;
    await appointment.save();

    let matchingWaitlist = [];
    if (isNowCancelled) {
      matchingWaitlist = await Waitlist.find({
        status: 'Waiting',
        $or: [
          { preferredDate: appointment.date },
          { preferredDate: '' },
          { preferredDate: null },
        ],
      });
    }

    return res.status(200).json({
      success: true,
      message: `Appointment marked as ${status}`,
      data: appointment,
      matchingWaitlist,
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: error.message,
    });
  }
}

/**
 * PATCH /api/appointments/:id/confirm-attendance
 * Client or nutritionist confirms attendance
 */
export async function confirmAttendance(req, res) {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot confirm attendance for a cancelled appointment',
      });
    }

    appointment.attendanceConfirmed = true;
    appointment.attendanceConfirmedAt = new Date();
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: 'Attendance confirmed successfully. We look forward to seeing you!',
      data: appointment,
    });
  } catch (error) {
    console.error('Error confirming attendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to confirm attendance',
      error: error.message,
    });
  }
}
