
import React, { useState, useEffect, useRef } from 'react';
import { ChatTopic, ChatMessage } from '../types';
import { MessageSquarePlus, Send, MessageCircle, Lock, ChevronLeft, Plus, UserPlus, RefreshCw, Wifi } from 'lucide-react';
import { getChatUsers, saveChatUsers, ChatUser, getChatTopics, saveChatTopics } from '../services/storage';

interface ChatSystemProps {
  topics: ChatTopic[];
  onUpdateTopics: (topics: ChatTopic[]) => void;
}

const ChatSystem: React.FC<ChatSystemProps> = ({ topics, onUpdateTopics }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPass, setUserPass] = useState('');
  const [activeTopic, setActiveTopic] = useState<ChatTopic | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync Logic - Polling every 5 seconds to simulate real-time
  useEffect(() => {
    setUsers(getChatUsers());
    
    const syncInterval = setInterval(() => {
      refreshTopics();
    }, 5000);

    return () => clearInterval(syncInterval);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeTopic?.messages]);

  const refreshTopics = () => {
    setIsSyncing(true);
    const updated = getChatTopics();
    onUpdateTopics(updated);
    
    // If we have an active topic, update it from the refreshed list
    if (activeTopic) {
      const refreshedActive = updated.find(t => t.id === activeTopic.id);
      if (refreshedActive && JSON.stringify(refreshedActive.messages) !== JSON.stringify(activeTopic.messages)) {
        setActiveTopic(refreshedActive);
      }
    }
    
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userPass) return;
    if (users.find(u => u.name === userName)) {
      alert("שם משתמש תפוס");
      return;
    }
    const newList = [...users, { name: userName, pass: userPass }];
    setUsers(newList);
    saveChatUsers(newList);
    alert("נרשמת בהצלחה! כעת ניתן להתחבר.");
    setView('login');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.name === userName && u.pass === userPass);
    if (user) {
      setIsLoggedIn(true);
    } else {
      alert("שם משתמש או סיסמה שגויים.");
    }
  };

  const createTopic = () => {
    if (!newTopicTitle) return;
    const topic: ChatTopic = {
      id: Date.now().toString(),
      title: newTopicTitle,
      author: userName,
      timestamp: Date.now(),
      messages: []
    };
    const newTopics = [topic, ...topics];
    saveChatTopics(newTopics);
    onUpdateTopics(newTopics);
    setNewTopicTitle('');
    setShowNewTopicModal(false);
    setActiveTopic(topic);
  };

  const addMessage = () => {
    if (!newMessageText || !activeTopic) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      author: userName,
      text: newMessageText,
      timestamp: Date.now()
    };
    
    const allTopics = getChatTopics();
    const updated = allTopics.map(t => 
      t.id === activeTopic.id ? { ...t, messages: [...t.messages, msg] } : t
    );
    
    saveChatTopics(updated);
    onUpdateTopics(updated);
    setActiveTopic(prev => prev ? { ...prev, messages: [...prev.messages, msg] } : null);
    setNewMessageText('');
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-12 text-center max-w-xl mx-auto space-y-8 animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <MessageCircle className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">צ'אט הקהילה</h3>
          <p className="text-slate-400 font-bold mt-2">הכניסה לצ'אט מותרת לנרשמים בלבד</p>
        </div>
        
        {view === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-center text-sm"
              placeholder="שם משתמש"
              value={userName}
              onChange={e => setUserName(e.target.value)}
            />
            <input 
              type="password"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-center text-sm"
              placeholder="סיסמה"
              value={userPass}
              onChange={e => setUserPass(e.target.value)}
            />
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              התחבר לצ'אט
            </button>
            <button type="button" onClick={() => setView('register')} className="text-indigo-600 font-bold text-xs hover:underline">אין לך משתמש? הירשם כאן</button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <input 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-center text-sm"
              placeholder="שם משתמש חדש"
              value={userName}
              onChange={e => setUserName(e.target.value)}
            />
            <input 
              type="password"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-center text-sm"
              placeholder="בחר סיסמה"
              value={userPass}
              onChange={e => setUserPass(e.target.value)}
            />
            <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5" />
              בצע הרשמה
            </button>
            <button type="button" onClick={() => setView('login')} className="text-slate-500 font-bold text-xs hover:underline">כבר רשום? התחבר עכשיו</button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden min-h-[600px] flex flex-col md:flex-row animate-in fade-in duration-500 relative">
      
      {/* Sync Badge */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-1 bg-white/80 backdrop-blur rounded-full border border-slate-100 shadow-sm pointer-events-none">
        <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
          {isSyncing ? <RefreshCw className="w-2 h-2 animate-spin" /> : <Wifi className="w-2 h-2" />}
          Live Update
        </span>
      </div>

      {/* Sidebar: Topics List */}
      <div className="w-full md:w-80 border-l border-slate-100 bg-slate-50/50 flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center">
          <h3 className="font-black text-lg text-slate-900">נושאי שיחה</h3>
          <button onClick={() => setShowNewTopicModal(true)} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {topics.length === 0 ? (
            <div className="p-12 text-center text-slate-300 font-bold italic">אין נושאים פתוחים</div>
          ) : (
            topics.map(topic => (
              <button 
                key={topic.id}
                onClick={() => setActiveTopic(topic)}
                className={`w-full p-6 text-right border-b border-slate-100 transition-all hover:bg-white flex flex-col gap-1 ${activeTopic?.id === topic.id ? 'bg-white border-r-4 border-r-indigo-600 shadow-sm' : ''}`}
              >
                <span className="font-black text-slate-800 text-sm line-clamp-1">{topic.title}</span>
                <span className="text-[10px] text-slate-400 font-bold">{topic.author} | {topic.messages.length} תגובות</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main: Message Thread */}
      <div className="flex-grow flex flex-col bg-white">
        {activeTopic ? (
          <>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div>
                <h4 className="font-black text-xl text-slate-900 tracking-tight">{activeTopic.title}</h4>
                <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  נוצר על ידי {activeTopic.author} 
                  <span className="opacity-40">•</span>
                  מעודכן בזמן אמת
                </p>
              </div>
              <button onClick={() => setActiveTopic(null)} className="md:hidden p-2 text-slate-400 hover:text-slate-600">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            
            <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-4 bg-white">
              {activeTopic.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                  <MessageCircle className="w-12 h-12 opacity-20" />
                  <p className="font-bold">היו הראשונים להגיב בנושא זה</p>
                </div>
              ) : (
                activeTopic.messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.author === userName ? 'items-start' : 'items-end'}`}>
                    <div className={`group relative max-w-[85%] p-4 rounded-2xl shadow-sm text-sm font-bold transition-all ${
                      msg.author === userName 
                        ? 'bg-indigo-600 text-white rounded-bl-none ml-auto text-right' 
                        : 'bg-slate-100 text-slate-700 rounded-br-none mr-auto text-right'
                    }`}>
                      {msg.text}
                      <span className={`absolute bottom-1 px-2 text-[8px] opacity-0 group-hover:opacity-60 transition-opacity ${msg.author === userName ? 'left-0' : 'right-0'}`}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold mt-1 px-1">{msg.author}</span>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
              <input 
                className="flex-grow bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none font-bold text-sm focus:border-indigo-400 transition-all"
                placeholder="כתבו הודעה..."
                value={newMessageText}
                onChange={e => setNewMessageText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    addMessage();
                  }
                }}
              />
              <button 
                onClick={addMessage}
                disabled={!newMessageText.trim()}
                className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-20 text-center gap-6">
             <div className="bg-indigo-50 p-8 rounded-full text-indigo-300 animate-pulse">
                <MessageSquarePlus className="w-12 h-12" />
             </div>
             <div>
                <h4 className="text-2xl font-black text-slate-800 tracking-tighter">ברוכים הבאים לצ'אט המסתנכרן</h4>
                <p className="text-slate-400 font-bold mt-2 max-w-sm mx-auto">
                  הודעות מתעדכנות באופן אוטומטי בין כל המכשירים. בחרו נושא או פתחו אחד חדש.
                </p>
             </div>
             <button onClick={() => setShowNewTopicModal(true)} className="px-10 py-4 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl shadow-indigo-100 hover:scale-105 transition-all">
                פתח נושא חדש לשיחה
             </button>
          </div>
        )}
      </div>

      {/* New Topic Modal */}
      {showNewTopicModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6">
            <h3 className="text-2xl font-black text-slate-900">פתיחת נושא חדש</h3>
            <input 
              autoFocus
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm"
              placeholder="מה הנושא שתרצו להעלות?"
              value={newTopicTitle}
              onChange={e => setNewTopicTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createTopic()}
            />
            <div className="flex gap-4">
               <button onClick={createTopic} className="flex-grow py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all text-sm">צור נושא</button>
               <button onClick={() => setShowNewTopicModal(false)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all text-sm">ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSystem;
