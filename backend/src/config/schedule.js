/**
 * Nourish Wellness Practice - Schedule & Timezone Configuration
 * 
 * Configurable demo schedule:
 * Practice operates in Asia/Kolkata timezone.
 * Consultation duration: 30 minutes.
 * Standard consultation hours: 09:00 - 17:00 (with 13:00-14:00 lunch break).
 */

export const PRACTICE_CONFIG = {
  name: 'Nourish Wellness Practice',
  timezone: process.env.TIMEZONE || 'Asia/Kolkata',
  slotDurationMinutes: 30,
  workHours: {
    start: '09:00',
    end: '17:00',
  },
  // Fixed demo slot times available for booking
  slots: [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
  ],
  workingDays: [1, 2, 3, 4, 5, 6], // Monday - Saturday (0 is Sunday)
};

/**
 * Calculates end time given start time and duration
 * @param {string} startTime - 'HH:mm'
 * @param {number} durationMinutes - default 30
 * @returns {string} - 'HH:mm'
 */
export function calculateEndTime(startTime, durationMinutes = 30) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMins = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
}

/**
 * Normalizes user-supplied or seed time string to 'HH:mm' (24-hour)
 * Examples: '10:00' -> '10:00', '11:30am' -> '11:30', '4 pm' -> '16:00', '14:00' -> '14:00'
 */
export function normalizeTimeString(timeStr) {
  if (!timeStr) return '';
  const trimmed = timeStr.trim().toLowerCase();

  // Check 12-hour am/pm format e.g. "4 pm", "11:30am", "4pm"
  const ampmMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const mins = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const isPm = ampmMatch[3] === 'pm';

    if (isPm && hours < 12) hours += 12;
    if (!isPm && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  // Check 24-hour format e.g. "10:00", "09:00", "14:00"
  const standardMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (standardMatch) {
    const hours = parseInt(standardMatch[1], 10);
    const mins = parseInt(standardMatch[2], 10);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  return trimmed;
}

/**
 * Normalizes user-supplied or seed date string to ISO 'YYYY-MM-DD'
 * Examples: '24/10/2026' -> '2026-10-24', '2026-10-24' -> '2026-10-24', '25-10-2026' -> '2026-10-25'
 */
export function normalizeDateString(dateStr) {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = String(dmyMatch[1]).padStart(2, '0');
    const month = String(dmyMatch[2]).padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  return trimmed;
}

/**
 * Formats time for clean human display (e.g. '10:00' -> '10:00 AM', '16:00' -> '4:00 PM')
 */
export function formatTimeForDisplay(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 === 0 ? 12 : h % 12;
  return `${displayHours}:${m} ${period}`;
}
