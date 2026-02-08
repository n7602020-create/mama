
import React from 'react';
import { Calendar, LogIn, LogOut, MessageCircle } from 'lucide-react';
import { AppSettings } from '../types';

interface HeaderProps {
  isAdmin: boolean;
  settings: AppSettings;
  onLogin: () => void;
  onLogout: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAdmin, settings, onLogin, onLogout, onToggleChat, isChatOpen }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Calendar className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-none">ניהול ליווי וביקורים</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Care Manager</p>
          </div>
        </div>

        {/* Coordinator Info and Safety Note removed from here */}

        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleChat}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all font-bold text-xs border ${
              isChatOpen 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">צ'אט קהילה</span>
          </button>

          {isAdmin ? (
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-bold text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>יציאת מנהל</span>
            </button>
          ) : (
            <button 
              onClick={onLogin}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all font-bold text-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>כניסת מנהל</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
