import React, { useState, useEffect } from 'react';
import { PlusCircle, X, Calendar, Clock, User, Phone, FileText, Check, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.js';

export function ManualBookingModal({
  isOpen,
  onClose,
  initialDate,
  onBookingSuccess,
}) {
  if (!isOpen) return null;

  const [date, setDate] = useState(initialDate || '2026-10-25');
  const [startTime, setStartTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch slots whenever date changes
  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!date) return;
      setLoadingSlots(true);
      setErrorMessage('');
      try {
        const res = await api.getSlots(date);
        if (isMounted && res.success) {
          setSlots(res.slots || []);
        }
      } catch (err) {
        if (isMounted) setErrorMessage('Could not load slots');
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName.trim() || !date || !startTime) {
      setErrorMessage('Please provide Client Name, Date, and Start Time.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.createAppointment({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim() || null,
        date,
        startTime,
        notes: notes.trim(),
        bookingSource: 'nutritionist',
      });

      if (res.success) {
        if (onBookingSuccess) onBookingSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to create appointment. The slot may be occupied.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <PlusCircle className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Add Appointment Manually
              </h3>
              <p className="text-xs text-stone-500">
                Book for a walk-in, phone call, or offline client.
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

        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Client Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g., Ananya Gupta"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  placeholder="e.g., 98200 55555"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Available Time Slot <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
              >
                <option value="">Select a slot</option>
                {slots
                  .filter((s) => s.isAvailable)
                  .map((s) => (
                    <option key={s.time} value={s.time}>
                      {s.formattedTime} ({s.time} - {s.endTime})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Consultation Notes / Context
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Telephone consultation request regarding diet chart"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !startTime}
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {submitting ? 'Booking...' : 'Add Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
