/**
 * Nourish - Formatting & Helper Utilities
 */

/**
 * Format ISO date string 'YYYY-MM-DD' to human readable
 * Example: '2026-10-25' -> 'Sun, 25 Oct 2026'
 */
export function formatDate(dateStr, options = { includeWeekday: true }) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });

  if (options.includeWeekday) {
    return `${dayOfWeek}, ${day} ${monthName} ${year}`;
  }
  return `${day} ${monthName} ${year}`;
}

/**
 * Format relative date tag (e.g. Today, Tomorrow, Yesterday, or date)
 */
export function getRelativeDateLabel(dateStr) {
  if (!dateStr) return '';
  // Format current date in Asia/Kolkata or local
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (dateStr === todayStr) return 'Today';
  if (dateStr === tomorrowStr) return 'Tomorrow';
  if (dateStr === yesterdayStr) return 'Yesterday';

  return formatDate(dateStr, { includeWeekday: true });
}

/**
 * Format time 'HH:mm' to '10:00 AM', '4:00 PM'
 */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 === 0 ? 12 : h % 12;
  return `${displayHours}:${m} ${period}`;
}

/**
 * Clean and format phone for display
 * Returns "Not provided" if null or empty
 */
export function formatPhone(phone) {
  if (!phone || phone.trim() === '' || phone.toLowerCase() === 'not provided') {
    return 'Not provided';
  }
  return phone;
}

/**
 * Generates direct WhatsApp click-to-chat URL
 * @param {string} phone - client phone number
 * @param {string} message - prefilled message text
 */
export function generateWhatsAppLink(phone, message) {
  if (!phone || phone === 'Not provided') return null;

  // Extract digits
  let digits = phone.replace(/\D/g, '');
  // Default to +91 (India) if 10 digits
  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  const encodedMessage = encodeURIComponent(message.trim());
  return `https://wa.me/${digits}?text=${encodedMessage}`;
}

/**
 * Pre-composed WhatsApp message templates for Nutritionist actions
 */
export const WhatsAppTemplates = {
  // Reminder to confirm attendance
  reminder: (appointment) => {
    const formattedDate = formatDate(appointment.date);
    const formattedTime = formatTime(appointment.startTime);
    return `Hello ${appointment.clientName}, this is Nourish Wellness Practice. 👋

This is a gentle reminder for your nutrition consultation scheduled for ${formattedDate} at ${formattedTime}.

Could you please confirm if you'll be able to attend, or let us know if you need to reschedule? We look forward to helping you with your health goals! 🌿`;
  },

  // Follow up after a No-show
  noShowFollowUp: (appointment) => {
    const formattedTime = formatTime(appointment.startTime);
    return `Hello ${appointment.clientName}, this is Nourish Wellness Practice.

We missed you at your scheduled consultation today at ${formattedTime}. We hope everything is well on your end.

Whenever you're ready, please let us know if you would like to reschedule your consultation. Take care! 🌿`;
  },

  // Notify waitlisted client of a newly released slot
  waitlistReleaseAlert: (waitlistEntry, releasedSlot) => {
    const formattedDate = formatDate(releasedSlot.date);
    const formattedTime = formatTime(releasedSlot.startTime);
    return `Hello ${waitlistEntry.clientName}, great news from Nourish Wellness Practice! 🌿

A consultation slot has just opened up on ${formattedDate} at ${formattedTime}.

Since you were on our waitlist, we wanted to let you know first. Please reply promptly if you would like to book this slot before it fills up!`;
  },
};
