
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import PublicView from './components/PublicView';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import RegistrationModal from './components/RegistrationModal';
import ChatSystem from './components/ChatSystem';
import AdModal from './components/AdModal';
import { CareEvent, AppSettings, ChatTopic } from './types';
import { getEvents, saveEvents, getSettings, saveSettings, getChatTopics, saveChatTopics } from './services/storage';
import { Wifi, RefreshCw, Bell } from 'lucide-react';

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
  const [isSyncing, setIsSyncing] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  
  const lastMsgCountRef = useRef<number>(0);
  const originalTitle = useRef(document.title);

  // בקשת אישור להתראות
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  };

  // פונקציית השמעת צליל
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio failed", e);
    }
  };

  // טעינה וסנכרון
  const syncData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [remoteEvents, remoteSettings, remoteChat] = await Promise.all([
        getEvents(),
        getSettings(),
        getChatTopics()
      ]);
      
      setEvents(remoteEvents);
      setSettings(remoteSettings);
      
      // בדיקה אם הגיעו הודעות חדשות עבור התראה
      const currentMsgCount = remoteChat.reduce((acc, t) => acc + t.messages.length, 0);
      if (lastMsgCountRef.current !== 0 && currentMsgCount > lastMsgCountRef.current) {
        if (!showChat || document.hidden) {
          playNotificationSound();
          if (Notification.permission === 'granted') {
            new Notification("הודעה חדשה בצ'אט רוחי", {
              body: "יש עדכונים חדשים בקהילה",
              icon: "/favicon.ico"
            });
          }
          document.title = `* הודעה חדשה! * ${originalTitle.current}`;
        }
      }
      lastMsgCountRef.current = currentMsgCount;
      setChatTopics(remoteChat);
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setIsSyncing(false);
    }
  }, [showChat]);

  useEffect(() => {
    syncData();
    const interval = setInterval(syncData, 4000);
    return () => clearInterval(interval);
  }, [syncData]);

  // איפוס הכותרת כשנכנסים לצ'אט
  useEffect(() => {
    if (showChat) {
      document.title = originalTitle.current;
    }
  }, [showChat]);

  const handleUpdateEvents = useCallback(async (newEvents: CareEvent[]) => {
    setEvents(newEvents);
    await saveEvents(newEvents);
  }, []);

  const handleUpdateSettings = useCallback(async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, []);

  const handleUpdateChat = useCallback(async (newTopics: ChatTopic[]) => {
    setChatTopics(newTopics);
    await saveChatTopics(newTopics);
  }, []);

  if (!settings) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  );

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

      {/* Cloud Sync Status and Notification Permission */}
      <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-3 items-start">
        {notificationPermission === 'default' && (
          <button 
            onClick={requestPermission}
            className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-[10px] font-black animate-bounce"
          >
            <Bell className="w-3 h-3" />
            אפשר התראות
          </button>
        )}
        <div className={`transition-all duration-500 ${isSyncing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-white/90 backdrop-blur-md border border-slate-100 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <Wifi className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">סנכרון ענן פעיל</span>
          </div>
        </div>
      </div>

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
          <p className="text-xs font-bold text-slate-500 text-center md:text-right">© 2025. מערכת חכמה לניהול ליווי וביקורים - הנתונים מסונכרנים בענן.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
