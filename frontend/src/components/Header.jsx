import React, { useState, useEffect } from 'react';
import {
  Leaf,
  User,
  LayoutDashboard,
  Menu,
  X,
  UserCheck,
  Check,
  Globe,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api.js';

export const DEMO_CLIENTS = [
  { name: 'Riya Shah', phone: '98200 11111', badge: '2 appointments', desc: 'Upcoming & past consultations' },
  { name: 'Arjun Mehta', phone: '98200 22222', badge: '1 appointment', desc: 'Unconfirmed upcoming consultation' },
  { name: 'Meera Iyer', phone: 'Not provided', badge: 'Done', desc: 'Completed session (Phone not provided)' },
  { name: 'Kabir Rao', phone: '98200 33333', badge: 'No-show', desc: 'Past session marked as no-show' },
  { name: 'New Client', phone: '', badge: 'Guest', desc: 'Empty profile to test booking from scratch' },
];

export function Header({
  activeView,
  setActiveView,
  selectedClient,
  setSelectedClient,
  onToast,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetDemo = async () => {
    if (!window.confirm('Reset database back to the clean initial demonstration state? This will clear all test bookings and restore the 5 initial Section 8 appointments.')) {
      return;
    }
    setIsResetting(true);
    try {
      await api.resetDemoData();
      if (onToast) onToast('Demo database reset to initial Section 8 state!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      if (onToast) onToast('Failed to reset demo database: ' + (err.message || 'error'), 'error');
      setIsResetting(false);
    }
  };

  // Close on Escape key press and prevent background scrolling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  const handleSelectRole = (role) => {
    setActiveView(role);
    setMenuOpen(false);
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    if (activeView !== 'client') {
      setActiveView('client');
    }
    setMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-15 sm:h-18 gap-2 sm:gap-4">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-800 text-amber-50 flex items-center justify-center shadow-sm">
                <Leaf className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
                    Nourish
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Wellness
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 hidden sm:block">
                  Holistic Nutrition Practice
                </p>
              </div>
            </div>

            {/* Right: Status Pill & Hamburger Menu Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Compact Mobile Status Chip */}
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="inline-flex sm:hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200/80 border border-stone-200/90 text-[11px] font-medium text-stone-700 transition-colors cursor-pointer"
                title="Tap to switch persona or client"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="max-w-[115px] truncate font-semibold text-stone-900">
                  {activeView === 'client' ? selectedClient.name : 'Nutritionist'}
                </span>
              </button>

              {/* Desktop Quick Status Chip */}
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100/90 hover:bg-stone-200/70 border border-stone-200/80 text-xs font-medium text-stone-700 transition-colors cursor-pointer"
                title="Click to switch role or client profile"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>
                  {activeView === 'client' ? (
                    <>
                      Client: <strong className="text-stone-900">{selectedClient.name}</strong>
                    </>
                  ) : (
                    <strong className="text-emerald-900">Nutritionist Dashboard</strong>
                  )}
                </span>
              </button>

              {/* Hamburger Button */}
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open navigation menu and switch roles"
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              >
                <Menu className="w-5 h-5 text-emerald-800" />
                <span className="text-xs font-semibold hidden md:inline">Menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Flyout Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop overlay */}
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-stone-200 animate-in slide-in-from-right duration-200 overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-emerald-200" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 font-serif">
                    Experience &amp; Profile Menu
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Switch between personas and demo clients
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-200/60 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* SECTION 1: ROLE SWITCHER */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2.5">
                  1. Select Experience Role
                </span>

                <div className="grid grid-cols-1 gap-2.5">
                  {/* Client App Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectRole('client')}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      activeView === 'client'
                        ? 'bg-emerald-50/70 border-emerald-600 text-emerald-950 ring-2 ring-emerald-600/20 shadow-xs'
                        : 'bg-stone-50/60 border-stone-200 text-stone-700 hover:bg-stone-100/70'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        activeView === 'client'
                          ? 'bg-emerald-800 text-white'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">Client Portal</span>
                        {activeView === 'client' && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Book consultations, confirm attendance, view upcoming schedule &amp; history.
                      </p>
                    </div>
                  </button>

                  {/* Nutritionist Dashboard Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectRole('nutritionist')}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      activeView === 'nutritionist'
                        ? 'bg-emerald-50/70 border-emerald-600 text-emerald-950 ring-2 ring-emerald-600/20 shadow-xs'
                        : 'bg-stone-50/60 border-stone-200 text-stone-700 hover:bg-stone-100/70'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        activeView === 'nutritionist'
                          ? 'bg-emerald-800 text-white'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">Nutritionist Dashboard</span>
                        {activeView === 'nutritionist' && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Operational calendar, today's schedule, status updates, WhatsApp follow-ups &amp; waitlist.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* SECTION 2: DEMO CLIENT PROFILE SELECTOR */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    2. Switch Demo Client Profile
                  </span>
                  <span className="text-[10px] text-stone-400">No login required</span>
                </div>

                <div className="space-y-2">
                  {DEMO_CLIENTS.map((client) => {
                    const isSelected = selectedClient.name === client.name;
                    return (
                      <button
                        key={client.name}
                        type="button"
                        onClick={() => handleSelectClient(client)}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                            : 'bg-stone-50/70 border-stone-200 text-stone-800 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSelected
                                ? 'bg-emerald-700 text-emerald-100'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {client.name.charAt(0)}
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-semibold truncate">{client.name}</div>
                            <div
                              className={`text-[10px] truncate ${
                                isSelected ? 'text-emerald-200' : 'text-stone-400'
                              }`}
                            >
                              {client.desc}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                              isSelected
                                ? 'bg-emerald-900 text-emerald-200 border-emerald-700'
                                : 'bg-stone-100 text-stone-600 border-stone-200'
                            }`}
                          >
                            {client.badge}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-200" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: PRACTICE DETAILS & DEMO INFO */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-2">
                <div className="flex items-center gap-1.5 text-stone-900 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Practice Settings</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-500">Practice Timezone:</span>
                  <span className="font-medium text-stone-800 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-emerald-700" /> Asia/Kolkata
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-500">Consultation Duration:</span>
                  <span className="font-medium text-stone-800 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-700" /> 30 Minutes
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200/70 text-[10px] text-stone-400 leading-relaxed">
                  <em>Demo convenience note:</em> Switching roles and client profiles is accessible without login to easily evaluate all candidate flows and live database synchronization.
                </div>

                {/* Reset Database Action */}
                <div className="pt-2.5 border-t border-stone-200/80">
                  <button
                    type="button"
                    onClick={handleResetDemo}
                    disabled={isResetting}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isResetting ? 'animate-spin' : ''}`} />
                    <span>{isResetting ? 'Resetting database...' : 'Reset Demo Data (Restore Initial)'}</span>
                  </button>
                  <span className="text-[10px] text-stone-400 block text-center mt-1">
                    Restores initial 5 appointments &amp; waitlist candidate
                  </span>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50/60 flex items-center justify-between">
              <span className="text-[11px] text-stone-500">
                Current: <strong className="text-stone-800">{activeView === 'client' ? 'Client Portal' : 'Nutritionist'}</strong>
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
