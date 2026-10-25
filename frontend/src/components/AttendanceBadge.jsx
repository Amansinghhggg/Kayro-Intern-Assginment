import React from 'react';
import { CheckCheck, Clock } from 'lucide-react';

export function AttendanceBadge({ isConfirmed, showLabel = true }) {
  if (isConfirmed) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100/80 text-emerald-900 border border-emerald-300"
        title="Client has confirmed attendance"
      >
        <CheckCheck className="w-3.5 h-3.5 text-emerald-700" />
        {showLabel && <span>Confirmed</span>}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200"
      title="Attendance not yet confirmed by client"
    >
      <Clock className="w-3.5 h-3.5 text-amber-600" />
      {showLabel && <span>Unconfirmed</span>}
    </span>
  );
}
