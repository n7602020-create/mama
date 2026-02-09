
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import PublicView from './components/PublicView';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import RegistrationModal from './components/RegistrationModal';
import ChatSystem from './components/ChatSystem';
import AdModal from './components/AdModal';
import { CareEvent, AppSettings, ChatTopic } from './types';
import { getEvents, saveEvents, getSettings, saveSettings, getChatTopics, saveChatTopics } from './services/storage';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [events, setEvents] = useState<CareEvent[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [chatTopics, setChatTopics] = useState<ChatTopic[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [regParams, setRegParams] = useState<{date: string, slotId: string} | null>(null);

  useEffect(() => {
    const s = getSettings();
    setEvents(getEvents());
    setSettings(s);
    setChatTopics(getChatTopics());
    
    // Listen for storage changes from other tabs on same device
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ruhi_care_events_v3') setEvents(getEvents());
      if (e.key === 'ruhi_chat_v1') setChatTopics(getChatTopics());
    };
    
    window.addEventListener('storage', handleStorageChange);

    // Show community ads on entry
    if (s.ads && s.ads.length > 0) {
      setShowAdModal(true);
    }
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleUpdateEvents = useCallback((newEvents: CareEvent[]) => {
    setEvents(newEvents);
    saveEvents(newEvents);
  }, []);

  const handleUpdateSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  const handleUpdateChat = useCallback((newTopics: ChatTopic[]) => {
    setChatTopics(newTopics);
    saveChatTopics(newTopics);
  }, []);

  if (!settings) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-200 text-slate-900 font-['Assistant'] pb-20 transition-colors duration-500">
      <Header 
        isAdmin={isAdmin} 
        settings={settings}
        onLogin={() => setShowLogin(true)} 
        onLogout={() => setIsAdmin(false)}
        onToggleChat={() => setShowChat(!showChat)}
        isChatOpen={showChat}
      />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        {isAdmin ? (
          <div className="animate-in fade-in duration-500 space-y-10">
             <div className="flex items-center justify-between border-b border-slate-300 pb-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-right">ניהול המערכת</h1>
                  <p className="text-slate-500 text-xs font-bold mt-1 text-right">שליטה מלאה בלוח, בהנחיות ובפרסום</p>
                </div>
                <button 
                  onClick={() => setIsAdmin(false)} 
                  className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-sm shadow-sm hover:bg-slate-50 transition-all"
                >
                  חזור לתצוגה
                </button>
             </div>
             <AdminDashboard 
                events={events} 
                settings={settings} 
                onUpdateEvents={handleUpdateEvents} 
                onUpdateSettings={handleUpdateSettings} 
             />
          </div>
        ) : (
          <div className="animate-in fade-in duration-500 space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
                לוח ביקורים <span className="text-indigo-600">לרוחי</span>
              </h1>
              <p className="text-slate-600 font-bold text-base max-w-2xl mx-auto">
                {settings.systemNote}
              </p>
            </div>

            {showChat && (
              <div className="animate-in slide-in-from-top-10 duration-500">
                <div className="mb-6 flex items-center justify-between border-b-2 border-indigo-300 pb-4">
                   <h2 className="text-2xl font-black text-slate-900">צ'אט הקהילה</h2>
                   <button onClick={() => setShowChat(false)} className="text-slate-500 text-xs font-bold hover:text-slate-700">סגור צ'אט X</button>
                </div>
                <ChatSystem topics={chatTopics} onUpdateTopics={handleUpdateChat} />
              </div>
            )}

            <PublicView 
              events={events} 
              settings={settings} 
              weekOffset={weekOffset} 
              onSetWeekOffset={setWeekOffset} 
              isAdmin={isAdmin} 
              onEventClick={(date, slotId) => {
                const existing = events.find(e => e.date === date && e.slotId === slotId);
                if (existing) {
                  alert("משבצת זו תפוסה.");
                } else {
                  setRegParams({date, slotId});
                }
              }} 
            />
          </div>
        )}
      </main>

      {showLogin && <AdminLogin onSuccess={() => { setIsAdmin(true); setShowLogin(false); }} onCancel={() => setShowLogin(false)} />}
      
      {regParams && (
        <RegistrationModal 
          date={regParams.date} 
          slotId={regParams.slotId} 
          settings={settings} 
          onClose={() => setRegParams(null)} 
          onSave={(ev) => {
            handleUpdateEvents([...events, ev]);
            setRegParams(null);
          }}
        />
      )}

      {showAdModal && <AdModal ads={settings.ads} onClose={() => setShowAdModal(false)} />}

      <footer className="mt-20 py-12 border-t border-slate-300 bg-white/80 backdrop-blur-md shadow-inner">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl"></div>
            <p className="text-xl font-bold text-slate-900">רוחי</p>
          </div>
          <p className="text-xs font-bold text-slate-500 text-center md:text-right">© 2025. מערכת חכמה לניהול ליווי וביקורים שיקומיים - מעודכן בזמן אמת.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
