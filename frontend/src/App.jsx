import React, { useState } from 'react';
import { Header, DEMO_CLIENTS } from './components/Header.jsx';
import { ClientHome } from './components/ClientExperience/ClientHome.jsx';
import { NutritionistDashboard } from './components/NutritionistDashboard/NutritionistDashboard.jsx';
import { Toast } from './components/Common/Toast.jsx';

export function App() {
  // 'client' or 'nutritionist'
  const [activeView, setActiveView] = useState('client');

  // Active client profile for client experience
  const [selectedClient, setSelectedClient] = useState(DEMO_CLIENTS[0]); // Riya Shah

  // Global Toast Notifications
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FBF9F5] text-stone-900 flex flex-col selection:bg-emerald-200 selection:text-emerald-950 font-sans">
      {/* Top Header & Experience Switcher */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        onToast={showToast}
      />

      {/* Main Experience Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3.5 sm:pt-8 min-w-0 overflow-x-hidden">
        {activeView === 'client' ? (
          <ClientHome
            selectedClient={selectedClient}
            onToast={showToast}
          />
        ) : (
          <NutritionistDashboard
            onToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200/80 bg-white/70 py-6 text-center text-xs text-stone-500 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-800 text-sm">Nourish</span>
            <span>&bull; Holistic Nutrition Practice</span>
          </div>

        </div>
      </footer>

      {/* Floating Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
