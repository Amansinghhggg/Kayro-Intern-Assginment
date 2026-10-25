import React, { useState } from 'react';
import { BellRing, X, Check, Calendar, Phone, User, Clock } from 'lucide-react';
import { api } from '../../services/api.js';

export function WaitlistModal({
  isOpen,
  onClose,
  initialDate = '',
  defaultClient,
  onSuccess,
}) {
  if (!isOpen) return null;

  const [clientName, setClientName] = useState(
    defaultClient?.name !== 'New Client' ? defaultClient?.name || '' : ''
  );
  const [clientPhone, setClientPhone] = useState(
    defaultClient?.phone && defaultClient?.phone !== 'Not provided' ? defaultClient.phone : ''
  );
  const [preferredDate, setPreferredDate] = useState(initialDate || '');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('Any');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      setErrorMessage('Please provide both your name and phone number.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.addToWaitlist({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        preferredDate,
        preferredTimeSlot,
        notes: notes.trim(),
      });

      if (res.success) {
        setIsSuccess(true);
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to join waitlist. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <BellRing className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Join Consultation Waitlist
              </h3>
              <p className="text-xs text-stone-500">
                Be the first to know when a consultation slot frees up.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-emerald-700" />
            </div>
            <h4 className="text-lg font-bold text-stone-900">You're on the list!</h4>
            <p className="text-xs text-stone-600 max-w-xs mx-auto">
              Whenever an appointment is cancelled or rescheduled matching your window, our practice will contact you immediately via WhatsApp.
            </p>
            <button
              onClick={handleClose}
              className="mt-3 px-5 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g., Devika Sen"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Phone Number (WhatsApp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  placeholder="e.g., 98200 44444"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Time Window
                </label>
                <select
                  value={preferredTimeSlot}
                  onChange={(e) => setPreferredTimeSlot(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                >
                  <option value="Any">Any Time</option>
                  <option value="Morning">Morning (09:00 - 12:30)</option>
                  <option value="Afternoon">Afternoon (14:00 - 17:00)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Notes / Health Goals
              </label>
              <textarea
                rows={2}
                placeholder="Optional notes or urgency..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {submitting ? 'Adding...' : 'Join Waitlist'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
