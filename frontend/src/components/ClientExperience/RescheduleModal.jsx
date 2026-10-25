import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CalendarClock,
  X,
  AlertCircle,
  Check,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { formatDate, formatTime } from '../../utils/formatters.js';

export function RescheduleModal({
  appointment,
  isOpen,
  onClose,
  onRescheduleSuccess,
}) {
  if (!isOpen || !appointment) return null;

  const [newDate, setNewDate] = useState(appointment.date);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch slots for selected new date
  useEffect(() => {
    let isMounted = true;
    async function loadSlots() {
      if (!newDate) return;
      setLoadingSlots(true);
      setErrorMessage('');
      setSelectedSlot(null);
      try {
        const res = await api.getSlots(newDate);
        if (isMounted && res.success) {
          // If viewing current appointment's date, the current appointment's own slot will show booked,
          // but we can mark it or filter
          setSlots(res.slots || []);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage('Failed to load slots for this date.');
        }
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    }
    loadSlots();
    return () => {
      isMounted = false;
    };
  }, [newDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMessage('Please select a new time slot.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.rescheduleAppointment(
        appointment._id,
        newDate,
        selectedSlot.time
      );

      if (res.success) {
        if (onRescheduleSuccess) {
          onRescheduleSuccess({
            appointment: res.data,
            releasedSlot: res.releasedSlot,
            matchingWaitlist: res.matchingWaitlist,
          });
        }
        onClose();
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to reschedule. The requested slot may be occupied. Your original booking remains unchanged.';
      setErrorMessage(msg);
      // Reload slots
      api.getSlots(newDate).then((r) => {
        if (r.success) setSlots(r.slots || []);
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                Reschedule Consultation
              </h3>
              <p className="text-xs text-stone-500">
                Pick a new date and time. Original appointment stays safe until confirmed.
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

        {/* Current Booking Pill */}
        <div className="my-4 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-center justify-between">
          <div>
            <span className="text-stone-500 block">Current Schedule:</span>
            <span className="font-semibold text-stone-900">
              {formatDate(appointment.date)} at {formatTime(appointment.startTime)}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
            Active
          </span>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Date */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Select New Date
            </label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* New Time Slot */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Select New Time Slot
            </label>

            {loadingSlots ? (
              <div className="py-8 text-center text-stone-400 text-xs flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                <span>Checking availability...</span>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-xs text-stone-500 py-4 text-center">No slots found.</div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                {slots.map((slot) => {
                  const isCurrent =
                    appointment.date === newDate && appointment.startTime === slot.time;
                  const isSelected = selectedSlot?.time === slot.time;

                  if (isCurrent) {
                    return (
                      <div
                        key={slot.time}
                        className="p-2 rounded-lg border border-stone-200 bg-stone-100 text-stone-400 text-center text-xs opacity-60"
                      >
                        <div>{slot.formattedTime}</div>
                        <span className="text-[9px] uppercase font-bold text-stone-500">Current</span>
                      </div>
                    );
                  }

                  if (!slot.isAvailable) {
                    return (
                      <div
                        key={slot.time}
                        className="p-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-400 text-center text-xs line-through opacity-50"
                      >
                        {slot.formattedTime}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                          : 'bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-950 border-emerald-200'
                      }`}
                    >
                      {slot.formattedTime}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedSlot}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {submitting ? (
                <span>Rescheduling...</span>
              ) : (
                <>
                  <span>Confirm Reschedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
