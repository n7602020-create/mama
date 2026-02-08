
import React, { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { APP_CONFIG } from '../constants';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === APP_CONFIG.ADMIN_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mb-2">
            <Lock className="w-8 h-8" />
          </div>
          
          <div>
            <h2 className="text-2xl font-black text-slate-800">כניסת ניהול</h2>
            <p className="text-slate-500 text-sm mt-1">אנא הזן את הסיסמה כדי להמשיך</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              autoFocus
              type="password"
              placeholder="סיסמה (לדוגמה: 2020)"
              className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl outline-none text-center text-xl font-bold tracking-[0.5em] transition-all
                ${error ? 'border-red-500 bg-red-50 shake' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}
              `}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 group"
            >
              התחבר למערכת
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1" />
            </button>
          </form>

          <button 
            onClick={onCancel}
            className="text-slate-400 font-bold hover:text-slate-600 transition-colors text-sm"
          >
            ביטול וחזרה
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
