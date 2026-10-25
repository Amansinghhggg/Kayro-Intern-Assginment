import express from 'express';
import {
  getAppointments,
  getAvailableSlots,
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
  updateAppointmentStatus,
  confirmAttendance,
} from '../controllers/appointmentController.js';

const router = express.Router();

// Slot availability
router.get('/slots', getAvailableSlots);

// Appointments CRUD & lifecycle
router.get('/', getAppointments);
router.post('/', createAppointment);
router.patch('/:id/reschedule', rescheduleAppointment);
router.patch('/:id/cancel', cancelAppointment);
router.patch('/:id/status', updateAppointmentStatus);
router.patch('/:id/confirm-attendance', confirmAttendance);

export default router;
