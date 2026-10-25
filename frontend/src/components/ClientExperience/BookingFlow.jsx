import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  BellRing,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { formatDate, formatTime } from '../../utils/formatters.js';

export function BookingFlow({
  defaultClient,
  onBookingSuccess,
  onOpenWaitlist,
}) {
  // Current step: 1: Date & Time, 2: Client Details & Review, 3: Success Confirmation
  const [step, setStep] = useState(1);

  // Form State
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to today or tomorrow
    const d = new Date();
    // Default to '2026-10-25' or current date
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState('');

  const [selectedSlot, setSelectedSlot] = useState(null);

  const [clientName, setClientName] = useState(defaultClient?.name !== 'New Client' ? defaultClient?.name || '' : '');
  const [clientPhone, setClientPhone] = useState(defaultClient?.phone && defaultClient?.phone !== 'Not provided' ? defaultClient.phone : '');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdAppointment, setCreatedAppointment] = useState(null);

  // Sync default client if changed
  useEffect(() => {
    if (defaultClient?.name && defaultClient.name !== 'New Client') {
      setClientName(defaultClient.name);
      setClientPhone(defaultClient.phone && defaultClient.phone !== 'Not provided' ? defaultClient.phone : '');
    } else if (defaultClient?.name === 'New Client') {
      setClientName('');
      setClientPhone('');
    }
  }, [defaultClient]);

  // Fetch slots whenever selectedDate changes
  useEffect(() => {
    let isMounted = true;
    async function fetchSlots() {
      if (!selectedDate) return;
      setLoadingSlots(true);
      setSlotError('');
      setSelectedSlot(null);
      try {
        const response = await api.getSlots(selectedDate);
        if (isMounted) {
          if (response.success) {
            setSlots(response.slots || []);
          } else {
            setSlotError('Could not load slots for this date.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setSlotError(err.response?.data?.message || 'Failed to fetch available slots.');
        }
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    }

    fetchSlots();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Quick Date Chips (Next 7 days)
  const dateChips = React.useMemo(() => {
    const list = [];
    const base = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      list.push({ iso, label: dayName, sub: `${dayNum} ${monthName}` });
    }
    return list;
  }, []);

  const handleSlotSelect = (slot) => {
    if (!slot.isAvailable) return;
    setSelectedSlot(slot);
    setErrorMessage('');
  };

  const handleProceedToDetails = () => {
    if (!selectedDate || !selectedSlot) {
      setErrorMessage('Please select a date and an available time slot.');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMessage('Please provide your name.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim() || null,
        date: selectedDate,
        startTime: selectedSlot.time,
        notes: notes.trim(),
        bookingSource: 'client',
      };

      const result = await api.createAppointment(payload);
      if (result.success) {
        setCreatedAppointment(result.data);
        setStep(3); // Show Success State
        if (onBookingSuccess) onBookingSuccess(result.data);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to book this appointment. The slot may have just been reserved. Please try again.';
      setErrorMessage(msg);
      // If slot was occupied, send back to slot step to re-pick
      if (err.response?.status === 409) {
        // Refresh slots for this date
        api.getSlots(selectedDate).then((res) => {
          if (res.success) setSlots(res.slots || []);
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedSlot(null);
    setNotes('');
    setErrorMessage('');
    setCreatedAppointment(null);
  };

  const availableCount = slots.filter((s) => s.isAvailable).length;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-sm p-4 sm:p-8">
      {/* Step Indicator Header */}
      <div className="flex items-center justify-between pb-5 sm:pb-6 mb-5 sm:mb-6 border-b border-stone-100">
        <div>
          <h2 className="text-lg sm:text-2xl font-serif font-bold text-stone-900">
            Book a Consultation
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Personalized nutrition &amp; wellness guidance (30 min session)
          </p>
        </div>

        {step < 3 && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold shrink-0">
            <span
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                step === 1 ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              1
            </span>
            <span className="text-stone-300">&mdash;</span>
            <span
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                step === 2 ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-400'
              }`}
            >
              2
            </span>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 sm:mb-6 p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Booking notice</span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* STEP 1: DATE & TIME SELECTION */}
      {step === 1 && (
        <div className="space-y-5 sm:space-y-6">
          {/* Date Selection */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5 sm:mb-3">
              <label className="text-xs sm:text-sm font-semibold text-stone-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                Select Consultation Date
              </label>
              <span className="text-[11px] text-stone-500 font-medium">Practice hours: 09:00 - 17:00</span>
            </div>

            {/* Quick 7-Day Chips: Touch Horizontal Rail on Mobile, Grid on Tablet/Desktop */}
            <div className="flex sm:grid sm:grid-cols-7 gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
              {dateChips.map((chip) => {
                const isSelected = selectedDate === chip.iso;
                return (
                  <button
                    key={chip.iso}
                    type="button"
                    onClick={() => setSelectedDate(chip.iso)}
                    className={`shrink-0 min-w-[78px] sm:min-w-0 p-2 sm:p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                        : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200'
                    }`}
                  >
                    <div className="text-xs font-semibold">{chip.label}</div>
                    <div className={`text-[10px] sm:text-[11px] ${isSelected ? 'text-emerald-200' : 'text-stone-500'}`}>
                      {chip.sub}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Date Input for future flexibility */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-stone-500">Or pick another date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
              />
            </div>
          </div>

          {/* Time Slot Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs sm:text-sm font-semibold text-stone-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                Select Time Slot for {formatDate(selectedDate)}
              </label>

              {!loadingSlots && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  {availableCount} available
                </span>
              )}
            </div>

            {loadingSlots ? (
              <div className="py-12 text-center text-stone-400 text-xs sm:text-sm flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                <span>Checking live practice availability...</span>
              </div>
            ) : slotError ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                {slotError}
              </div>
            ) : slots.length === 0 ? (
              <div className="py-8 text-center text-stone-500 text-xs sm:text-sm">
                No slots configured for this date.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.time === slot.time;
                  const isBooked = slot.reason === 'Booked';

                  if (!slot.isAvailable) {
                    return (
                      <div
                        key={slot.time}
                        className="p-2.5 sm:p-3 rounded-xl border border-stone-200 bg-stone-100/70 text-stone-400 flex items-center justify-between text-xs select-none cursor-not-allowed opacity-75"
                        title={isBooked ? 'Slot already booked' : 'Time has passed'}
                      >
                        <span className="font-medium line-through text-[11px] sm:text-xs">{slot.formattedTime}</span>
                        <span className="text-[9px] sm:text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-stone-200 text-stone-500">
                          {slot.reason}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => handleSlotSelect(slot)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-600/30'
                          : 'bg-emerald-50/40 text-emerald-950 border-emerald-200/80 hover:bg-emerald-100/60'
                      }`}
                    >
                      <span className="text-xs sm:text-sm">{slot.formattedTime}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-200" />
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-medium">Free</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Waitlist Callout if slots are fully booked */}
            {!loadingSlots && availableCount === 0 && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs text-amber-900">
                  <strong>All slots for this day are currently booked.</strong>
                  <p className="text-amber-700 mt-0.5">
                    Join our waitlist to be notified immediately if an appointment is cancelled or rescheduled.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenWaitlist && onOpenWaitlist({ date: selectedDate })}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  Join Waitlist
                </button>
              </div>
            )}
          </div>

          {/* Action to proceed */}
          <div className="flex justify-end pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={handleProceedToDetails}
              disabled={!selectedSlot}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-800 text-white text-sm font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>Continue to Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CLIENT DETAILS & REVIEW */}
      {step === 2 && (
        <form onSubmit={handleConfirmBooking} className="space-y-6">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <div className="text-sm font-bold text-stone-900">
                  {formatDate(selectedDate)}
                </div>
                <div className="text-xs text-stone-500 font-medium">
                  {selectedSlot?.formattedTime} &ndash; {selectedSlot?.endTime} (30 mins)
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold underline underline-offset-2"
            >
              Change Date &amp; Time
            </button>
          </div>

          {/* Details Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Client Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3.5 sm:top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g., Riya Shah"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-base sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Phone Number <span className="text-stone-400 font-normal">(for reminders &amp; follow-up)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5 sm:top-3" />
                <input
                  type="tel"
                  placeholder="e.g., 98200 11111"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-base sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Consultation Goals or Notes <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  placeholder="e.g., Diet plan review, weight management, gut health questions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-base sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Practice Promise / Policy */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-xs text-emerald-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong>Calm &amp; Convenient Practice:</strong> Free rescheduling or cancellation anytime prior to your appointment. By confirming, you secure your spot with your dedicated nutritionist.
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100 gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-stone-600 hover:text-stone-900 text-xs sm:text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Securing slot...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Confirm Consultation</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: SUCCESS CONFIRMATION STATE */}
      {step === 3 && createdAppointment && (
        <div className="py-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
            <Check className="w-8 h-8 text-emerald-700 stroke-[2.5]" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
              Booking Confirmed
            </span>
            <h3 className="text-2xl font-serif font-bold text-stone-900 mt-3">
              We look forward to seeing you, {createdAppointment.clientName}!
            </h3>
            <p className="text-sm text-stone-600 max-w-md mx-auto mt-1">
              Your consultation has been reserved in our practice schedule.
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-stone-200/60 pb-2">
              <span className="text-stone-500">Date:</span>
              <span className="font-semibold text-stone-900">{formatDate(createdAppointment.date)}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200/60 pb-2">
              <span className="text-stone-500">Time:</span>
              <span className="font-semibold text-stone-900">
                {formatTime(createdAppointment.startTime)} &ndash; {formatTime(createdAppointment.endTime)}
              </span>
            </div>
            <div className="flex justify-between border-b border-stone-200/60 pb-2">
              <span className="text-stone-500">Status:</span>
              <span className="font-semibold text-emerald-800">Booked</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Practice Timezone:</span>
              <span className="font-medium text-stone-700">Asia/Kolkata</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
