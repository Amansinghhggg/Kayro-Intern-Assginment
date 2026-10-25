import React, { useState, useEffect } from 'react';
import {
  BellRing,
  X,
  MessageSquare,
  CalendarPlus,
  CheckCircle,
  Clock,
  Phone,
  User,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { formatDate, formatPhone, WhatsAppTemplates } from '../../utils/formatters.js';

export function WaitlistDrawer({
  isOpen,
  onClose,
  onOpenWhatsApp,
  onBookWaitlistCandidate,
  onToast,
}) {
  if (!isOpen) return null;

  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const res = await api.getWaitlist();
      if (res.success) {
        setWaitlist(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch waitlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.updateWaitlistStatus(id, status);
      if (res.success) {
        if (onToast) onToast(`Waitlist entry marked as ${status}`, 'success');
        fetchWaitlist();
      }
    } catch (err) {
      if (onToast) onToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <BellRing className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Waitlist Management
              </h3>
              <p className="text-xs text-stone-500">
                Clients waiting for available or released consultation slots
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

        {/* Content */}
        <div className="overflow-y-auto py-4 space-y-3 flex-1 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-stone-400 flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
              <span>Loading waitlist entries...</span>
            </div>
          ) : waitlist.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              No clients currently on the waitlist.
            </div>
          ) : (
            waitlist.map((entry) => (
              <div
                key={entry._id}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-stone-900 text-sm block">
                      {entry.clientName}
                    </span>
                    <span className="text-stone-500 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      {formatPhone(entry.clientPhone)}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      entry.status === 'Waiting'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : entry.status === 'Notified'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : entry.status === 'Booked'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 text-stone-700 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Preferred Date:</span>
                    <span className="font-medium text-stone-900">
                      {entry.preferredDate ? formatDate(entry.preferredDate) : 'Any Day'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Time Window:</span>
                    <span className="font-medium text-stone-900">{entry.preferredTimeSlot}</span>
                  </div>
                  {entry.notes && (
                    <div className="text-stone-600 italic pt-1 border-t border-stone-100 mt-1">
                      &ldquo;{entry.notes}&rdquo;
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-[11px] text-stone-500">
                    <span>Status:</span>
                    <select
                      value={entry.status}
                      onChange={(e) => handleUpdateStatus(entry._id, e.target.value)}
                      className="px-2 py-0.5 rounded border border-stone-300 text-[11px] bg-white font-medium text-stone-800"
                    >
                      <option value="Waiting">Waiting</option>
                      <option value="Notified">Notified</option>
                      <option value="Booked">Booked</option>
                      <option value="Cancelled">Closed</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const message = `Hello ${entry.clientName}, this is Nourish Wellness Practice. 🌿 We noticed you're on our waitlist. A consultation slot is currently available! Let us know if you would like to book it.`;
                        onOpenWhatsApp({
                          clientName: entry.clientName,
                          clientPhone: entry.clientPhone,
                          title: 'Contact Waitlisted Client',
                          initialMessage: message,
                        });
                        // Auto-mark as Notified
                        handleUpdateStatus(entry._id, 'Notified');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium shadow-2xs transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => onBookWaitlistCandidate(entry)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium transition-colors cursor-pointer"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>Book Slot</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
