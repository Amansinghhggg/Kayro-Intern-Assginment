import React from 'react';
import { Calendar, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export function StatusBadge({ status, size = 'md' }) {
  const configs = {
    Booked: {
      label: 'Booked',
      icon: Calendar,
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      dot: 'bg-emerald-600',
    },
    Done: {
      label: 'Done',
      icon: CheckCircle2,
      bg: 'bg-teal-50 text-teal-900 border-teal-200',
      dot: 'bg-teal-600',
    },
    'No-show': {
      label: 'No-show',
      icon: AlertCircle,
      bg: 'bg-rose-50 text-rose-900 border-rose-200',
      dot: 'bg-rose-600',
    },
    Cancelled: {
      label: 'Cancelled',
      icon: XCircle,
      bg: 'bg-stone-100 text-stone-600 border-stone-200 line-through opacity-85',
      dot: 'bg-stone-400',
    },
  };

  const current = configs[status] || {
    label: status,
    icon: Calendar,
    bg: 'bg-stone-100 text-stone-700 border-stone-200',
    dot: 'bg-stone-500',
  };

  const Icon = current.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${current.bg} ${sizeClasses} shadow-xs transition-colors`}
      aria-label={`Status: ${current.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} aria-hidden="true" />
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{current.label}</span>
    </span>
  );
}
