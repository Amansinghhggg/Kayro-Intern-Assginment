import axios from 'axios';

// Base API configuration (Vite proxy forwards /api to http://localhost:5000)
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const api = {
  // Appointments
  getAppointments: async (params = {}) => {
    const res = await apiClient.get('/appointments', { params });
    return res.data;
  },

  getSlots: async (date) => {
    const res = await apiClient.get('/appointments/slots', { params: { date } });
    return res.data;
  },

  createAppointment: async (appointmentData) => {
    const res = await apiClient.post('/appointments', appointmentData);
    return res.data;
  },

  rescheduleAppointment: async (id, newDate, newStartTime) => {
    const res = await apiClient.patch(`/appointments/${id}/reschedule`, {
      newDate,
      newStartTime,
    });
    return res.data;
  },

  cancelAppointment: async (id) => {
    const res = await apiClient.patch(`/appointments/${id}/cancel`);
    return res.data;
  },

  updateAppointmentStatus: async (id, status) => {
    const res = await apiClient.patch(`/appointments/${id}/status`, { status });
    return res.data;
  },

  confirmAttendance: async (id) => {
    const res = await apiClient.patch(`/appointments/${id}/confirm-attendance`);
    return res.data;
  },

  // Waitlist
  getWaitlist: async (params = {}) => {
    const res = await apiClient.get('/waitlist', { params });
    return res.data;
  },

  addToWaitlist: async (waitlistData) => {
    const res = await apiClient.post('/waitlist', waitlistData);
    return res.data;
  },

  updateWaitlistStatus: async (id, status) => {
    const res = await apiClient.patch(`/waitlist/${id}/status`, { status });
    return res.data;
  },

  // Health
  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Reset Demo Database
  resetDemoData: async () => {
    const res = await apiClient.post('/reset-demo');
    return res.data;
  },
};

