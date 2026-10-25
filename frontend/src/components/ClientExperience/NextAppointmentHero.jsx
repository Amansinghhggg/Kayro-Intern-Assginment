import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  CalendarClock,
  XCircle,
  Sparkles,
  Phone,
  FileText,
} from 'lucide-react';
import { StatusBadge } from '../StatusBadge.jsx';
import { AttendanceBadge } from '../AttendanceBadge.jsx';
import { formatDate, formatTime, formatPhone } from '../../utils/formatters.js';

export function NextAppointmentHero({
  appointment,
  onConfirmAttendance,
  onReschedule,
  onCancel,
  isConfirming,
}) {
  if (!appointment) return null;

  const isCancelled = appointment.status === 'Cancelled';
  const isDone = appointment.status === 'Done';
  const isNoShow = appointment.status === 'No-show';
  const isPastOrInactive = isCancelled || isDone || isNoShow;

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl relative overflow-hidden border border-emerald-700/50">
      {/* Decorative subtle background accents */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header Tag */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/60 text-emerald-100 border border-emerald-600/50">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Your Next Consultation
            </span>
            <StatusBadge status={appointment.status} size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <AttendanceBadge isConfirmed={appointment.attendanceConfirmed} />
          </div>
        </div>

        {/* Main Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-3 sm:my-4">
          <div>
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-emerald-50 mb-1.5 sm:mb-2 break-words">
              {formatDate(appointment.date)}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-emerald-200 text-base sm:text-xl font-medium">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 shrink-0" />
              <span>
                {formatTime(appointment.startTime)} &ndash; {formatTime(appointment.endTime)}
              </span>
              <span className="text-[11px] sm:text-xs bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800">
                {appointment.durationMinutes}m
              </span>
            </div>

            {appointment.notes && (
              <div className="mt-3 flex items-start gap-2 text-xs sm:text-sm text-emerald-200/90 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="break-words">{appointment.notes}</span>
              </div>
            )}
          </div>

          <div className="bg-emerald-950/50 rounded-2xl p-3.5 sm:p-4 border border-emerald-800/60 flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider block mb-1">
                Client Details
              </span>
              <div className="text-sm sm:text-base font-semibold text-emerald-50 truncate">
                {appointment.clientName}
              </div>
              <div className="text-xs sm:text-sm text-emerald-200/80 flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{formatPhone(appointment.clientPhone)}</span>
              </div>
            </div>

            {/* Attendance Confirmation State Info */}
            <div className="mt-3 pt-2.5 border-t border-emerald-800/80 text-xs text-emerald-200/90 flex items-center gap-2">
              {appointment.attendanceConfirmed ? (
                <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Thank you! Your attendance is confirmed.</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-200">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Please confirm below so the nutritionist expects you.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isPastOrInactive && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 pt-3.5 sm:pt-4 border-t border-emerald-800/80 mt-3 sm:mt-4">
            {!appointment.attendanceConfirmed && (
              <button
                onClick={() => onConfirmAttendance(appointment._id)}
                disabled={isConfirming}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-stone-900" />
                <span>{isConfirming ? 'Confirming...' : "I'll Be There (Confirm Attendance)"}</span>
              </button>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
              <button
                onClick={() => onReschedule(appointment)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium border border-emerald-600 transition-all active:scale-95 cursor-pointer"
              >
                <CalendarClock className="w-4 h-4 text-emerald-200" />
                <span>Reschedule</span>
              </button>

              <button
                onClick={() => onCancel(appointment)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-rose-950/80 hover:text-rose-200 text-emerald-300 text-xs sm:text-sm font-medium border border-emerald-800/80 hover:border-rose-800 transition-all active:scale-95 cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
