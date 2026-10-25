import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  PlusCircle,
  Filter,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  BellRing,
  Phone,
  FileText,
  UserCheck,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { StatusBadge } from '../StatusBadge.jsx';
import { AttendanceBadge } from '../AttendanceBadge.jsx';
import { ManualBookingModal } from './ManualBookingModal.jsx';
import { WhatsAppPreviewModal } from './WhatsAppPreviewModal.jsx';
import { WaitlistDrawer } from './WaitlistDrawer.jsx';
import {
  formatDate,
  formatTime,
  formatPhone,
  WhatsAppTemplates,
} from '../../utils/formatters.js';

export function NutritionistDashboard({ onToast }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  // 'today', 'tomorrow', 'all', or 'custom'
  const [filterMode, setFilterMode] = useState('all');
  const [customDate, setCustomDate] = useState('2026-10-25');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [manualBookingOpen, setManualBookingOpen] = useState(false);
  const [waitlistDrawerOpen, setWaitlistDrawerOpen] = useState(false);
  const [whatsAppModalData, setWhatsAppModalData] = useState(null);

  // Released slot banner state (when an appointment is cancelled or rescheduled)
  const [releasedSlotAlert, setReleasedSlotAlert] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterMode === 'today') {
        params.date = '2026-10-25'; // Demo "Today" per Section 8
      } else if (filterMode === 'tomorrow') {
        params.date = '2026-10-26';
      } else if (filterMode === 'custom' && customDate) {
        params.date = customDate;
      }

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      if (searchQuery.trim()) {
        params.clientName = searchQuery.trim();
      }

      const res = await api.getAppointments(params);
      if (res.success) {
        setAppointments(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      if (onToast) onToast('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterMode, customDate, statusFilter, searchQuery]);

  // Update Status handler
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.updateAppointmentStatus(id, newStatus);
      if (res.success) {
        if (onToast) onToast(`Appointment updated to ${newStatus}`, 'success');

        // Check if slot was released and matches waitlist
        if (newStatus === 'Cancelled' && res.matchingWaitlist?.length > 0) {
          setReleasedSlotAlert({
            appointment: res.data,
            matchingWaitlist: res.matchingWaitlist,
          });
        }

        fetchAppointments();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status';
      if (onToast) onToast(msg, 'error');
    }
  };

  // WhatsApp reminder launcher
  const openWhatsAppReminder = (appt) => {
    const text = WhatsAppTemplates.reminder(appt);
    setWhatsAppModalData({
      clientName: appt.clientName,
      clientPhone: appt.clientPhone,
      title: 'Send Consultation Reminder',
      initialMessage: text,
    });
  };

  // WhatsApp no-show follow-up launcher
  const openWhatsAppNoShow = (appt) => {
    const text = WhatsAppTemplates.noShowFollowUp(appt);
    setWhatsAppModalData({
      clientName: appt.clientName,
      clientPhone: appt.clientPhone,
      title: 'Send No-Show Follow-up',
      initialMessage: text,
    });
  };

  // Summary Metrics
  const totalCount = appointments.length;
  const bookedCount = appointments.filter((a) => a.status === 'Booked').length;
  const confirmedCount = appointments.filter((a) => a.status === 'Booked' && a.attendanceConfirmed).length;
  const pendingConfirmationCount = appointments.filter((a) => a.status === 'Booked' && !a.attendanceConfirmed).length;
  const noShowCount = appointments.filter((a) => a.status === 'No-show').length;
  const doneCount = appointments.filter((a) => a.status === 'Done').length;

  return (
    <div className="space-y-6 pb-20">
      {/* Dashboard Title & Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Practice Management
            </span>
            <span className="text-xs text-stone-500 font-medium">Asia/Kolkata Timezone</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Nutritionist Consultation Schedule
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Monitor client attendance, update statuses, follow up via WhatsApp, and manage released consultation slots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setWaitlistDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-200 transition-colors cursor-pointer"
          >
            <BellRing className="w-4 h-4 text-amber-700" />
            <span>Waitlist</span>
          </button>

          <button
            onClick={() => setManualBookingOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-200" />
            <span>+ Add Appointment</span>
          </button>
        </div>
      </div>

      {/* Released Slot & Waitlist Matching Alert Banner */}
      {releasedSlotAlert && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                Slot Released &bull; Waitlist Opportunity
              </span>
              <p className="text-xs text-amber-800 mt-0.5">
                The slot on <strong>{formatDate(releasedSlotAlert.appointment.date)}</strong> at{' '}
                <strong>{formatTime(releasedSlotAlert.appointment.startTime)}</strong> has been released.
                There are <strong>{releasedSlotAlert.matchingWaitlist.length} waitlisted client(s)</strong> waiting for an opening!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const candidate = releasedSlotAlert.matchingWaitlist[0];
                const msg = WhatsAppTemplates.waitlistReleaseAlert(candidate, releasedSlotAlert.appointment);
                setWhatsAppModalData({
                  clientName: candidate.clientName,
                  clientPhone: candidate.clientPhone,
                  title: 'Notify Waitlisted Client',
                  initialMessage: msg,
                });
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Notify via WhatsApp</span>
            </button>
            <button
              onClick={() => setReleasedSlotAlert(null)}
              className="text-xs text-amber-700 hover:text-amber-900 font-semibold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Actionable Practice Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            Total In View
          </span>
          <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
            {totalCount}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
            Active Bookings
          </span>
          <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-900 mt-1">
            {bookedCount}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
            Confirmed
          </span>
          <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-800 mt-1">
            {confirmedCount}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
            Needs Follow-up
          </span>
          <div className="text-xl sm:text-2xl font-serif font-bold text-amber-700 mt-1">
            {pendingConfirmationCount}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">
            No-shows
          </span>
          <div className="text-xl sm:text-2xl font-serif font-bold text-rose-700 mt-1">
            {noShowCount}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider block">
            Completed
          </span>
          <div className="text-xl sm:text-2xl font-serif font-bold text-teal-900 mt-1">
            {doneCount}
          </div>
        </div>
      </div>

      {/* Date & Filter Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">

          {/* Quick Date Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold border border-stone-200 overflow-x-auto no-scrollbar w-full sm:w-auto shrink-0">
            <button
              onClick={() => setFilterMode('today')}
              className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterMode === 'today'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              Today (25 Oct)
            </button>
            <button
              onClick={() => setFilterMode('tomorrow')}
              className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterMode === 'tomorrow'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              Tomorrow
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterMode === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              All Dates
            </button>
            <button
              onClick={() => setFilterMode('custom')}
              className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterMode === 'custom'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              Custom Date
            </button>
          </div>

          {/* Custom Date Picker if selected */}
          {filterMode === 'custom' && (
            <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
              <span className="text-stone-500 font-medium shrink-0">Select Date:</span>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white w-full sm:w-auto"
              />
            </div>
          )}

          {/* Search Input */}
          <div className="relative w-full sm:w-auto sm:min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search client name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-300 text-base sm:text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50"
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 sm:gap-2 pt-2 border-t border-stone-100 overflow-x-auto no-scrollbar text-xs">
          <span className="text-stone-400 font-medium shrink-0">Filter:</span>
          {['ALL', 'Booked', 'Done', 'No-show', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`shrink-0 px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors border text-[11px] sm:text-xs cursor-pointer ${statusFilter === st
                ? 'bg-stone-800 text-white border-stone-900 shadow-2xs'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border-stone-200'
                }`}
            >
              {st === 'ALL' ? 'All Statuses' : st}
            </button>
          ))}
          <button
            onClick={fetchAppointments}
            className="ml-auto shrink-0 text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 font-medium px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Appointments Table / Card Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-stone-400 flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          <span>Loading consultation records...</span>
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center space-y-2">
          <Calendar className="w-8 h-8 text-stone-300 mx-auto" />
          <h4 className="text-sm font-bold text-stone-800">No appointments found</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            No consultations match the selected date or filter criteria. You can create a new booking using the button above.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs overflow-hidden">

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Update Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {appointments.map((appt) => {
                  const isUnconfirmedBooked = appt.status === 'Booked' && !appt.attendanceConfirmed;
                  const isNoShow = appt.status === 'No-show';
                  const hasPhone = appt.clientPhone && appt.clientPhone !== 'Not provided';

                  return (
                    <tr key={appt._id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-stone-900">
                        <div>{appt.clientName}</div>
                        {appt.notes && (
                          <div className="text-[11px] text-stone-400 font-normal truncate max-w-xs">
                            {appt.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-stone-600">
                        <span className={hasPhone ? '' : 'text-stone-400 italic'}>
                          {formatPhone(appt.clientPhone)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-stone-900">
                          {formatDate(appt.date, { includeWeekday: false })}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {formatTime(appt.startTime)} &ndash; {formatTime(appt.endTime)}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={appt.status} size="sm" />
                      </td>

                      <td className="py-3 px-4">
                        <AttendanceBadge isConfirmed={appt.attendanceConfirmed} />
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={appt.status}
                          onChange={(e) => handleUpdateStatus(appt._id, e.target.value)}
                          className="px-2 py-1 rounded-lg border border-stone-300 text-xs bg-white text-stone-800 font-medium focus:ring-2 focus:ring-emerald-700"
                        >
                          <option value="Booked">Booked</option>
                          <option value="Done">Done</option>
                          <option value="No-show">No-show</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Action Buttons */}
                          {isUnconfirmedBooked && (
                            <button
                              onClick={() => openWhatsAppReminder(appt)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                              title="Send reminder to confirm attendance"
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              <span>Remind</span>
                            </button>
                          )}

                          {isNoShow && (
                            <button
                              onClick={() => openWhatsAppNoShow(appt)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-semibold border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                              title="Send gentle check-in follow-up"
                            >
                              <MessageSquare className="w-3 h-3 text-rose-600" />
                              <span>Follow up</span>
                            </button>
                          )}

                          {appt.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleUpdateStatus(appt._id, 'Cancelled')}
                              className="px-2 py-1 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 text-[11px] transition-colors cursor-pointer"
                              title="Cancel & Release slot"
                            >
                              Release Slot
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Card View */}
          <div className="lg:hidden divide-y divide-stone-100 p-3 space-y-3">
            {appointments.map((appt) => {
              const isUnconfirmedBooked = appt.status === 'Booked' && !appt.attendanceConfirmed;
              const isNoShow = appt.status === 'No-show';
              const hasPhone = appt.clientPhone && appt.clientPhone !== 'Not provided';

              return (
                <div
                  key={appt._id}
                  className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold text-stone-900">{appt.clientName}</div>
                      <div className="text-stone-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{formatPhone(appt.clientPhone)}</span>
                      </div>
                    </div>
                    <StatusBadge status={appt.status} size="sm" />
                  </div>

                  <div className="flex items-center justify-between text-stone-700 bg-stone-50 p-2 rounded-xl">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{formatDate(appt.date, { includeWeekday: false })}</span>
                      <span>&bull;</span>
                      <span>{formatTime(appt.startTime)}</span>
                    </div>
                    <AttendanceBadge isConfirmed={appt.attendanceConfirmed} />
                  </div>

                  {appt.notes && (
                    <div className="text-stone-500 italic bg-stone-50/50 p-2 rounded-lg">
                      {appt.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-1 text-[11px] text-stone-500">
                      <span>Status:</span>
                      <select
                        value={appt.status}
                        onChange={(e) => handleUpdateStatus(appt._id, e.target.value)}
                        className="px-2 py-0.5 rounded border border-stone-300 text-[11px] bg-white font-medium text-stone-800"
                      >
                        <option value="Booked">Booked</option>
                        <option value="Done">Done</option>
                        <option value="No-show">No-show</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isUnconfirmedBooked && (
                        <button
                          onClick={() => openWhatsAppReminder(appt)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200 flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>Remind</span>
                        </button>
                      )}

                      {isNoShow && (
                        <button
                          onClick={() => openWhatsAppNoShow(appt)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-semibold border border-rose-200 flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3 text-rose-600" />
                          <span>Follow up</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <ManualBookingModal
        isOpen={manualBookingOpen}
        initialDate={filterMode === 'custom' ? customDate : '2026-10-25'}
        onClose={() => setManualBookingOpen(false)}
        onBookingSuccess={() => {
          if (onToast) onToast('Appointment booked manually!', 'success');
          fetchAppointments();
        }}
      />

      <WaitlistDrawer
        isOpen={waitlistDrawerOpen}
        onClose={() => setWaitlistDrawerOpen(false)}
        onOpenWhatsApp={(data) => setWhatsAppModalData(data)}
        onBookWaitlistCandidate={(candidate) => {
          setWaitlistDrawerOpen(false);
          setManualBookingOpen(true);
        }}
        onToast={onToast}
      />

      {whatsAppModalData && (
        <WhatsAppPreviewModal
          isOpen={Boolean(whatsAppModalData)}
          onClose={() => setWhatsAppModalData(null)}
          clientName={whatsAppModalData.clientName}
          clientPhone={whatsAppModalData.clientPhone}
          title={whatsAppModalData.title}
          initialMessage={whatsAppModalData.initialMessage}
        />
      )}
    </div>
  );
}
