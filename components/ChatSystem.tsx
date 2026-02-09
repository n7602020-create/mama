
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

  useEffect(() => {
    setUsers(getChatUsers());
  }, []);

  // עדכון הנושא הפעיל כשהנתונים הגלובליים משתנים
  useEffect(() => {
    if (activeTopic) {
      const current = topics.find(t => t.id === activeTopic.id);
      if (current && JSON.stringify(current.messages) !== JSON.stringify(activeTopic.messages)) {
        setActiveTopic(current);
      }
    }
  }, [topics, activeTopic]);

  // גלילה אוטומטית לסוף
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [activeTopic?.messages.length]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userPass) return;
    if (users.find(u => u.name === userName)) {
      alert("שם המשתמש כבר קיים");
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

  const createTopic = async () => {
    if (!newTopicTitle) return;
    const topic: ChatTopic = {
      id: Date.now().toString(),
      title: newTopicTitle,
      author: userName,
      timestamp: Date.now(),
      messages: []
    };
    const newTopics = [topic, ...topics];
    await saveChatTopics(newTopics);
    onUpdateTopics(newTopics);
    setNewTopicTitle('');
    setShowNewTopicModal(false);
    setActiveTopic(topic);
  };

  const addMessage = async () => {
    if (!newMessageText.trim() || !activeTopic) return;
    
    const msg: ChatMessage = {
      id: Date.now().toString(),
      author: userName,
      text: newMessageText,
      timestamp: Date.now()
    };
    
    // עדכון אופטימי
    const updatedTopic = { ...activeTopic, messages: [...activeTopic.messages, msg] };
    setActiveTopic(updatedTopic);
    setNewMessageText('');

    const allTopics = topics.map(t => 
      t.id === activeTopic.id ? updatedTopic : t
    );
    
    await saveChatTopics(allTopics);
    onUpdateTopics(allTopics);
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
          <p className="text-slate-400 font-bold mt-2">הכניסה לצ'אט מאובטחת ומסונכרנת בין כולם</p>
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
            <button type="button" onClick={() => setView('register')} className="text-indigo-600 font-bold text-xs hover:underline">משתמש חדש? הירשם כאן</button>
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
            <button type="button" onClick={() => setView('login')} className="text-slate-500 font-bold text-xs hover:underline">חזור להתחברות</button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden min-h-[600px] flex flex-col md:flex-row animate-in fade-in duration-500 relative">
      
      {/* Sidebar */}
      <div className="w-full md:w-80 border-l border-slate-100 bg-slate-50/50 flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-100 bg-white flex justify-between items-center">
          <h3 className="font-black text-xl text-slate-900 tracking-tighter">נושאי שיחה</h3>
          <button onClick={() => setShowNewTopicModal(true)} className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {topics.length === 0 ? (
            <div className="p-12 text-center text-slate-300 font-bold italic">אין נושאים פתוחים</div>
          ) : (
            topics.sort((a,b) => b.timestamp - a.timestamp).map(topic => (
              <button 
                key={topic.id}
                onClick={() => setActiveTopic(topic)}
                className={`w-full p-6 text-right border-b border-slate-100 transition-all hover:bg-white flex flex-col gap-1.5 ${activeTopic?.id === topic.id ? 'bg-white border-r-4 border-r-indigo-600 shadow-sm' : ''}`}
              >
                <span className="font-black text-slate-800 text-sm">{topic.title}</span>
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] text-slate-400 font-bold">{topic.author}</span>
                  <span className="bg-slate-200 text-slate-500 text-[9px] px-2 py-0.5 rounded-full font-black">{topic.messages.length}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col bg-white">
        {activeTopic ? (
          <>
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h4 className="font-black text-2xl text-slate-900 tracking-tighter">{activeTopic.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[11px] text-slate-400 font-bold">מאת: {activeTopic.author}</span>
                   <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                   <span className="text-[11px] text-emerald-500 font-black flex items-center gap-1">
                     <Wifi className="w-3 h-3" /> מחובר לענן
                   </span>
                </div>
              </div>
              <button onClick={() => setActiveTopic(null)} className="md:hidden p-2 text-slate-400 hover:text-slate-600">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            
            <div ref={scrollRef} className="flex-grow p-8 overflow-y-auto space-y-6 bg-slate-50/20">
              {activeTopic.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-40">
                  <MessageCircle className="w-16 h-16" />
                  <p className="font-bold text-lg">אין הודעות עדיין. תהיו הראשונים!</p>
                </div>
              ) : (
                activeTopic.messages.map(msg => {
                  const isMe = msg.author === userName;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
                      <div className={`max-w-[80%] p-4 rounded-3xl shadow-sm text-sm font-bold leading-relaxed ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-bl-none ml-auto text-right' 
                          : 'bg-white border border-slate-100 text-slate-700 rounded-br-none mr-auto text-right'
                      }`}>
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 px-2">
                         <span className="text-[9px] text-slate-400 font-bold">{msg.author}</span>
                         <span className="text-[9px] text-slate-300 font-medium">{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-white flex gap-4">
              <input 
                className="flex-grow bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-4 outline-none font-bold text-sm focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
                placeholder="כתבו הודעה לקהילה..."
                value={newMessageText}
                onChange={e => setNewMessageText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addMessage()}
              />
              <button 
                onClick={addMessage}
                disabled={!newMessageText.trim()}
                className="w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-30 flex items-center justify-center shrink-0"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-20 text-center gap-8">
             <div className="bg-indigo-50 p-10 rounded-full text-indigo-200">
                <MessageSquarePlus className="w-16 h-16" />
             </div>
             <div>
                <h4 className="text-3xl font-black text-slate-900 tracking-tighter">מרכז התקשורת של הקהילה</h4>
                <p className="text-slate-400 font-bold mt-3 max-w-sm mx-auto leading-relaxed">
                  כל ההודעות מסונכרנות עכשיו ב-Cloud. בחרו נושא או פתחו אחד חדש כדי להתחיל.
                </p>
             </div>
             <button onClick={() => setShowNewTopicModal(true)} className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
                פתח נושא חדש לדיון
             </button>
          </div>
        )}
      </div>

      {/* New Topic Modal */}
      {showNewTopicModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
            <h3 className="text-3xl font-black text-slate-900 text-center">נושא חדש</h3>
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-center">שם הנושא / הכותרת</label>
              <input 
                autoFocus
                className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-center text-lg"
                placeholder="למשל: עדכונים מהפיזיותרפיה"
                value={newTopicTitle}
                onChange={e => setNewTopicTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createTopic()}
              />
            </div>
            <div className="flex flex-col gap-3">
               <button onClick={createTopic} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all">צור נושא עכשיו</button>
               <button onClick={() => setShowNewTopicModal(false)} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all text-sm">ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSystem;
