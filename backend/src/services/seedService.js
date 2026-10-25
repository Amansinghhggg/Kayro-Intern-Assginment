import { Appointment } from '../models/Appointment.js';
import { Waitlist } from '../models/Waitlist.js';
import {
  normalizeDateString,
  normalizeTimeString,
  calculateEndTime,
} from '../config/schedule.js';

/**
 * Section 8 Initial Demonstration Data:
 * | Client      | Phone        | Date as provided | Time as provided | Status  |
 * | Riya Shah   | 98200 11111  | 24/10/2026       | 10:00            | Booked  |
 * | Arjun Mehta | 98200 22222  | 2026-10-24       | 11:30am          | Booked  |
 * | Riya Shah   | 9820011111   | 25-10-2026       | 4 pm             | Booked  |
 * | Meera Iyer  | Not provided | 23/10/2026       | 09:00            | Done    |
 * | Kabir Rao   | 98200 33333  | 22/10/2026       | 14:00            | No-show |
 */
const RAW_DEMO_APPOINTMENTS = [
  {
    sampleKey: 'sample-1',
    clientName: 'Riya Shah',
    rawPhone: '98200 11111',
    rawDate: '24/10/2026',
    rawTime: '10:00',
    status: 'Booked',
    attendanceConfirmed: true,
    bookingSource: 'client',
    notes: 'Follow-up nutrition consultation. Discuss dietary adjustments.',
  },
  {
    sampleKey: 'sample-2',
    clientName: 'Arjun Mehta',
    rawPhone: '98200 22222',
    rawDate: '2026-10-24',
    rawTime: '11:30am',
    status: 'Booked',
    attendanceConfirmed: false,
    bookingSource: 'client',
    notes: 'Initial wellness assessment and body composition review.',
  },
  {
    sampleKey: 'sample-3',
    clientName: 'Riya Shah',
    rawPhone: '9820011111',
    rawDate: '25-10-2026',
    rawTime: '4 pm',
    status: 'Booked',
    attendanceConfirmed: false,
    bookingSource: 'client',
    notes: 'Meal planning and gut health protocol consultation.',
  },
  {
    sampleKey: 'sample-4',
    clientName: 'Meera Iyer',
    rawPhone: 'Not provided',
    rawDate: '23/10/2026',
    rawTime: '09:00',
    status: 'Done',
    attendanceConfirmed: true,
    bookingSource: 'nutritionist',
    notes: 'Completed session. Provided anti-inflammatory recipe guide.',
  },
  {
    sampleKey: 'sample-5',
    clientName: 'Kabir Rao',
    rawPhone: '98200 33333',
    rawDate: '22/10/2026',
    rawTime: '14:00',
    status: 'No-show',
    attendanceConfirmed: false,
    bookingSource: 'client',
    notes: 'Client did not attend or call. Follow-up reminder needed.',
  },
];

/**
 * Normalizes phone number formatting
 * If 'Not provided', returns null.
 */
export function normalizePhoneNumber(phoneStr) {
  if (!phoneStr) return null;
  const trimmed = phoneStr.trim();
  if (trimmed.toLowerCase() === 'not provided') return null;

  // Clean extra spaces, keep digits
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return trimmed;
}

/**
 * Seeds initial demo appointments and waitlist entries idempotently.
 */
export async function seedDemoData() {
  try {
    // Ensure database indexes are properly built on MongoDB Atlas / local DB
    await Appointment.syncIndexes();

    for (const raw of RAW_DEMO_APPOINTMENTS) {
      const normalizedDate = normalizeDateString(raw.rawDate);
      const normalizedTime = normalizeTimeString(raw.rawTime);
      const normalizedPhone = normalizePhoneNumber(raw.rawPhone);
      const endTime = calculateEndTime(normalizedTime, 30);

      // Check existing by sampleKey or by active date + startTime
      const existing = await Appointment.findOne({
        $or: [
          { sampleKey: raw.sampleKey },
          { date: normalizedDate, startTime: normalizedTime, isActive: true },
        ],
      });

      if (!existing) {
        try {
          await Appointment.create({
            sampleKey: raw.sampleKey,
            clientName: raw.clientName,
            clientPhone: normalizedPhone,
            date: normalizedDate,
            startTime: normalizedTime,
            endTime,
            durationMinutes: 30,
            status: raw.status,
            isActive: raw.status !== 'Cancelled',
            attendanceConfirmed: raw.attendanceConfirmed,
            attendanceConfirmedAt: raw.attendanceConfirmed ? new Date() : null,
            bookingSource: raw.bookingSource,
            notes: raw.notes,
            isDemoSample: true,
          });
        } catch (insertErr) {
          if (insertErr.code === 11000) {
            console.log(`[Seed] Slot ${normalizedDate} ${normalizedTime} already occupied; skipped.`);
          } else {
            throw insertErr;
          }
        }
      }
    }

    // Seed 1 initial demo waitlist candidate if none exist
    const waitlistCount = await Waitlist.countDocuments();
    if (waitlistCount === 0) {
      await Waitlist.create({
        clientName: 'Devika Sen',
        clientPhone: '98200 44444',
        preferredDate: '2026-10-25',
        preferredTimeSlot: '16:00',
        notes: 'Looking for a slot on 25 Oct around 4 PM for sports nutrition plan.',
        status: 'Waiting',
      });
    }

    console.log('[Seed] Demonstration data loaded idempotently.');
  } catch (error) {
    console.error('[Seed] Error during demo data seeding:', error.message);
  }
}

/**
 * Resets the entire database by clearing all appointments and waitlists,
 * and re-seeding the clean initial demonstration data from Section 8.
 */
export async function resetAndSeedDemoData() {
  try {
    console.log('[Seed] Wiping database for clean demonstration reset...');
    await Appointment.deleteMany({});
    await Waitlist.deleteMany({});
    await seedDemoData();
    console.log('[Seed] Database successfully reset to pristine Section 8 demonstration state.');
    return { success: true, message: 'Database reset and re-seeded successfully.' };
  } catch (error) {
    console.error('[Seed] Error during demo data reset:', error.message);
    throw error;
  }
}

