import React, { useState } from 'react';
import { MessageSquare, X, Copy, ExternalLink, AlertCircle, Check } from 'lucide-react';
import { generateWhatsAppLink, formatPhone } from '../../utils/formatters.js';

export function WhatsAppPreviewModal({
  isOpen,
  onClose,
  clientName,
  clientPhone,
  title = 'Send WhatsApp Follow-up',
  initialMessage = '',
}) {
  if (!isOpen) return null;

  const [message, setMessage] = useState(initialMessage);
  const [copied, setCopied] = useState(false);

  const hasPhone = clientPhone && clientPhone !== 'Not provided';
  const whatsappUrl = hasPhone ? generateWhatsAppLink(clientPhone, message) : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                {title}
              </h3>
              <p className="text-xs text-stone-500">
                Prefilled message for {clientName}
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

        {/* Client & Phone Banner */}
        <div className="my-3 p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
          <div>
            <span className="text-stone-500 block">Recipient:</span>
            <span className="font-semibold text-stone-900">{clientName}</span>
          </div>
          <div className="text-right">
            <span className="text-stone-500 block">Phone:</span>
            <span className={`font-semibold ${hasPhone ? 'text-stone-900' : 'text-amber-700'}`}>
              {formatPhone(clientPhone)}
            </span>
          </div>
        </div>

        {!hasPhone && (
          <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Phone number not provided:</strong> WhatsApp cannot be launched automatically without a contact number. You can still copy the message text below.
            </div>
          </div>
        )}

        {/* Message Editor / Preview */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-stone-700">
              Message Content (Editable)
            </label>
            <button
              onClick={handleCopy}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-medium flex items-center gap-1 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy text</span>
                </>
              )}
            </button>
          </div>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 rounded-2xl border border-stone-300 text-xs text-stone-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
          />
        </div>

        <p className="text-[11px] text-stone-400 mt-2">
          Note: Nourish prepares the message for you. Clicking below launches WhatsApp with this message ready to send.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-stone-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-800 text-xs font-semibold"
          >
            Close
          </button>

          {hasPhone && (
            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in WhatsApp</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
