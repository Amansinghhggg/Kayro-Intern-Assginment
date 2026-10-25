import React, { useState } from 'react';
import { AlertTriangle, X, Check, ArrowRight } from 'lucide-react';
import { api } from '../../services/api.js';
import { formatDate, formatTime } from '../../utils/formatters.js';

export function CancelModal({
  appointment,
  isOpen,
  onClose,
  onCancelSuccess,
}) {
  if (!isOpen || !appointment) return null;

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleConfirmCancel = async () => {
    setSubmitting(true);
    setErrorMessage('');
    try {
      const res = await api.cancelAppointment(appointment._id);
      if (res.success) {
        if (onCancelSuccess) {
          onCancelSuccess({
            appointment: res.data,
            releasedSlot: res.releasedSlot,
            matchingWaitlist: res.matchingWaitlist,
          });
        }
        onClose();
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to cancel appointment. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Cancel Consultation?
              </h3>
              <p className="text-xs text-stone-500">
                Your consultation slot will be released for others.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Appointment Card */}
        <div className="my-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-stone-500">Client:</span>
            <span className="font-semibold text-stone-900">{appointment.clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Date &amp; Time:</span>
            <span className="font-semibold text-stone-900">
              {formatDate(appointment.date)} at {formatTime(appointment.startTime)}
            </span>
          </div>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          Cancelling will release this 30-minute consultation window immediately, giving waitlisted clients an opportunity to book. The record will remain saved in your consultation history as <em>Cancelled</em>.
        </p>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-5 mt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-800 text-xs font-semibold"
          >
            Keep Appointment
          </button>
          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {submitting ? 'Releasing slot...' : 'Yes, Cancel Consultation'}
          </button>
        </div>
      </div>
    </div>
  );
}
