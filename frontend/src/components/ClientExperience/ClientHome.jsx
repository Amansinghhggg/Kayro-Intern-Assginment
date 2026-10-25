import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  PlusCircle,
  History,
  CalendarCheck2,
  CalendarClock,
  Sparkles,
  AlertCircle,
  FileText,
  User,
  BellRing,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { NextAppointmentHero } from './NextAppointmentHero.jsx';
import { BookingFlow } from './BookingFlow.jsx';
import { RescheduleModal } from './RescheduleModal.jsx';
import { CancelModal } from './CancelModal.jsx';
import { WaitlistModal } from './WaitlistModal.jsx';
import { StatusBadge } from '../StatusBadge.jsx';
import { AttendanceBadge } from '../AttendanceBadge.jsx';
import { formatDate, formatTime } from '../../utils/formatters.js';

export function ClientHome({ selectedClient, onToast }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'book', 'history'

  // Modals state
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistInitialDate, setWaitlistInitialDate] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);

  // Fetch appointments for current client
  const fetchClientAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.getAppointments({
        clientName: selectedClient.name !== 'New Client' ? selectedClient.name : undefined,
      });
      if (res.success) {
        setAppointments(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch client appointments:', err);
      if (onToast) onToast('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientAppointments();
  }, [selectedClient]);

  // Separate Upcoming vs Past/History
  // An appointment is "Upcoming" if status === 'Booked' and date/time is in future (or today)
  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'Booked'
  );

  const pastAppointments = appointments.filter(
    (a) => a.status === 'Done' || a.status === 'No-show' || a.status === 'Cancelled'
  );

  // Nearest upcoming appointment for Hero banner
  const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

  // Actions
  const handleConfirmAttendance = async (appointmentId) => {
    setConfirmingId(appointmentId);
    try {
      const res = await api.confirmAttendance(appointmentId);
      if (res.success) {
        if (onToast) onToast('Attendance confirmed! Thank you.', 'success');
        fetchClientAppointments();
      }
    } catch (err) {
      if (onToast) onToast('Could not confirm attendance', 'error');
    } finally {
      setConfirmingId(null);
    }
  };

  const handleBookingSuccess = (newAppointment) => {
    if (onToast) onToast('Consultation successfully scheduled!', 'success');
    fetchClientAppointments();
    setActiveTab('upcoming');
  };

  const handleRescheduleSuccess = ({ appointment, releasedSlot, matchingWaitlist }) => {
    if (onToast) {
      let msg = 'Appointment rescheduled successfully!';
      if (matchingWaitlist?.length > 0) {
        msg += ` Freed slot (${releasedSlot.date}) matched ${matchingWaitlist.length} waitlist candidate(s).`;
      }
      onToast(msg, 'success');
    }
    fetchClientAppointments();
  };

  const handleCancelSuccess = ({ appointment, releasedSlot, matchingWaitlist }) => {
    if (onToast) {
      let msg = 'Appointment cancelled. Slot has been released.';
      if (matchingWaitlist?.length > 0) {
        msg += ` ${matchingWaitlist.length} waitlisted client(s) can now fill this opening.`;
      }
      onToast(msg, 'info');
    }
    fetchClientAppointments();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome / Client Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Welcome to Nourish
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Hello, {selectedClient.name !== 'New Client' ? selectedClient.name : 'Wellness Seeker'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Manage your nutrition consultations and book available appointment slots.
          </p>
        </div>

        {/* Quick Join Waitlist Button */}
        <button
          onClick={() => {
            setWaitlistInitialDate('');
            setWaitlistOpen(true);
          }}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/70 text-stone-700 text-xs font-medium border border-stone-200 transition-colors cursor-pointer"
        >
          <BellRing className="w-3.5 h-3.5 text-amber-600" />
          <span>Join Waitlist</span>
        </button>
      </div>

      {/* 1. Next Appointment Hero (Primary focus when one exists) */}
      {loading ? (
        <div className="h-48 rounded-3xl bg-stone-100 animate-pulse" />
      ) : nextAppointment ? (
        <NextAppointmentHero
          appointment={nextAppointment}
          onConfirmAttendance={handleConfirmAttendance}
          onReschedule={(appt) => setRescheduleTarget(appt)}
          onCancel={(appt) => setCancelTarget(appt)}
          isConfirming={confirmingId === nextAppointment._id}
        />
      ) : (
        /* Empty State when no upcoming appointment */
        <div className="p-8 sm:p-10 rounded-3xl bg-emerald-50/50 border border-emerald-200/80 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-7 h-7 text-emerald-700" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              No Upcoming Consultations
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Ready to take the next step in your health journey? Pick a convenient time slot below for your personalized nutrition consultation.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('book')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-200" />
            <span>Book a Consultation</span>
          </button>
        </div>
      )}

      {/* Modern Segmented Tab Bar - Mobile App Style */}
      <div className="w-full bg-stone-200/70 p-1 rounded-2xl flex items-center gap-1 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 sm:py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
          }`}
        >
          <CalendarCheck2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Upcoming</span>
          {upcomingAppointments.length > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'upcoming'
                  ? 'bg-emerald-700 text-emerald-100'
                  : 'bg-stone-300 text-stone-700'
              }`}
            >
              {upcomingAppointments.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('book')}
          className={`flex-1 py-2 sm:py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'book'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Book Slot</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 sm:py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
          }`}
        >
          <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">History</span>
          {pastAppointments.length > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'history'
                  ? 'bg-emerald-700 text-emerald-100'
                  : 'bg-stone-300 text-stone-700'
              }`}
            >
              {pastAppointments.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB CONTENT: BOOKING */}
      {activeTab === 'book' && (
        <BookingFlow
          defaultClient={selectedClient}
          onBookingSuccess={handleBookingSuccess}
          onOpenWaitlist={({ date }) => {
            setWaitlistInitialDate(date);
            setWaitlistOpen(true);
          }}
        />
      )}

      {/* TAB CONTENT: UPCOMING */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
              Your Scheduled Consultations
            </h3>
            {upcomingAppointments.length > 0 && (
              <span className="text-xs text-stone-500">
                {upcomingAppointments.length} active booking{upcomingAppointments.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center space-y-2">
              <Calendar className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-sm font-medium text-stone-700">No active bookings found.</p>
              <button
                onClick={() => setActiveTab('book')}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold underline underline-offset-2"
              >
                Book your first consultation &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingAppointments.map((appt) => (
                <div
                  key={appt._id}
                  className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-900">
                      {formatDate(appt.date)}
                    </span>
                    <StatusBadge status={appt.status} size="sm" />
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{formatTime(appt.startTime)} &ndash; {formatTime(appt.endTime)}</span>
                    </div>
                    <span>&bull;</span>
                    <AttendanceBadge isConfirmed={appt.attendanceConfirmed} />
                  </div>

                  {appt.notes && (
                    <div className="text-xs text-stone-500 bg-stone-50 p-2 rounded-lg">
                      {appt.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    {!appt.attendanceConfirmed && (
                      <button
                        onClick={() => handleConfirmAttendance(appt._id)}
                        disabled={confirmingId === appt._id}
                        className="text-amber-800 hover:text-amber-950 font-semibold cursor-pointer"
                      >
                        {confirmingId === appt._id ? 'Confirming...' : "Confirm Attendance"}
                      </button>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => setRescheduleTarget(appt)}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors cursor-pointer"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => setCancelTarget(appt)}
                        className="px-2.5 py-1 rounded-lg hover:bg-rose-50 text-rose-700 font-medium transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: HISTORY & PAST */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
              Consultation History
            </h3>
            <span className="text-xs text-stone-500">
              Includes completed, no-show, and cancelled sessions
            </span>
          </div>

          {pastAppointments.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center text-xs text-stone-500">
              No past consultations on record for {selectedClient.name}.
            </div>
          ) : (
            <div className="space-y-3">
              {pastAppointments.map((appt) => (
                <div
                  key={appt._id}
                  className="p-4 rounded-2xl bg-white border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900 text-sm">
                        {formatDate(appt.date)}
                      </span>
                      <StatusBadge status={appt.status} size="sm" />
                    </div>
                    <div className="text-stone-500 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTime(appt.startTime)}</span>
                      {appt.notes && <span>&bull; {appt.notes}</span>}
                    </div>
                  </div>

                  <div className="text-stone-400 text-[11px] self-end sm:self-center">
                    Session record preserved
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <RescheduleModal
        appointment={rescheduleTarget}
        isOpen={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        onRescheduleSuccess={handleRescheduleSuccess}
      />

      <CancelModal
        appointment={cancelTarget}
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onCancelSuccess={handleCancelSuccess}
      />

      <WaitlistModal
        isOpen={waitlistOpen}
        initialDate={waitlistInitialDate}
        defaultClient={selectedClient}
        onClose={() => setWaitlistOpen(false)}
        onSuccess={(entry) => {
          if (onToast) onToast('Added to waitlist!', 'success');
        }}
      />
    </div>
  );
}
