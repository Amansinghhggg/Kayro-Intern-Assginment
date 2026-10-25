import { Waitlist } from '../models/Waitlist.js';
import { normalizeDateString } from '../config/schedule.js';

/**
 * GET /api/waitlist
 * List waitlist entries
 */
export async function getWaitlist(req, res) {
  try {
    const { status, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) filter.preferredDate = normalizeDateString(date);

    const entries = await Waitlist.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch waitlist entries',
      error: error.message,
    });
  }
}

/**
 * POST /api/waitlist
 * Add a client to the waitlist
 */
export async function addToWaitlist(req, res) {
  try {
    const { clientName, clientPhone, preferredDate, preferredTimeSlot, notes } = req.body;

    if (!clientName || !clientName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Client name is required',
      });
    }

    if (!clientPhone || !clientPhone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Client phone number is required',
      });
    }

    const entry = await Waitlist.create({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      preferredDate: preferredDate ? normalizeDateString(preferredDate) : '',
      preferredTimeSlot: preferredTimeSlot ? preferredTimeSlot.trim() : 'Any',
      notes: notes ? notes.trim() : '',
      status: 'Waiting',
    });

    return res.status(201).json({
      success: true,
      message: 'Added to waitlist successfully',
      data: entry,
    });
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add to waitlist',
      error: error.message,
    });
  }
}

/**
 * PATCH /api/waitlist/:id
 * Update waitlist entry status (Waiting, Notified, Booked, Cancelled)
 */
export async function updateWaitlistStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Waiting', 'Notified', 'Booked', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const updateData = { status };
    if (status === 'Notified') {
      updateData.notifiedAt = new Date();
    }

    const entry = await Waitlist.findByIdAndUpdate(id, updateData, { new: true });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Waitlist entry not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Waitlist entry marked as ${status}`,
      data: entry,
    });
  } catch (error) {
    console.error('Error updating waitlist entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update waitlist entry',
      error: error.message,
    });
  }
}
