
import React from 'react';
import { Advertisement } from '../types';
import { X, CheckCircle2 } from 'lucide-react';

interface AdModalProps {
  ads: Advertisement[];
  onClose: () => void;
}

const AdModal: React.FC<AdModalProps> = ({ ads, onClose }) => {
  if (ads.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 left-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <div className="max-h-[85vh] overflow-y-auto p-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900">הודעות ופרסומות הקהילה</h2>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Community Announcements</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {ads.map(ad => (
              <div key={ad.id} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col sm:flex-row">
                {ad.imageUrl && (
                  <div className="w-full sm:w-48 h-48 bg-slate-200 shrink-0">
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 flex flex-col justify-center gap-2">
                  <h4 className="text-lg font-bold text-indigo-900">{ad.title}</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{ad.description}</p>
                  {ad.link && ad.link !== '#' && (
                    <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-indigo-600 hover:underline mt-2">
                      לפרטים נוספים >>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-center">
            <button 
              onClick={onClose}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              הבנתי, תודה!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdModal;
