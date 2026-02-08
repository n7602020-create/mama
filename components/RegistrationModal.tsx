
import React, { useState } from 'react';
import { AppSettings, CareEvent, EventStatus } from '../types';
import { X, Check } from 'lucide-react';

interface RegistrationModalProps {
  date: string;
  slotId: string;
  settings: AppSettings;
  onClose: () => void;
  onSave: (event: CareEvent) => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ date, slotId, settings, onClose, onSave }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const slot = settings.slots.find(s => s.id === slotId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};
    settings.fields.forEach(f => {
      if (f.isRequired && !formData[f.id]) {
        newErrors[f.id] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: Math.random().toString(36).substr(2, 9),
      slotId,
      date,
      status: EventStatus.Pending,
      registrationData: formData,
      creatorId: 'public'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <div>
            <h3 className="font-black text-xl text-indigo-900">הרשמה לביקור/ליווי</h3>
            <p className="text-xs text-indigo-700 font-bold">{date} | {slot?.label}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {settings.fields.map(field => (
            <div key={field.id}>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {field.label} {field.isRequired && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'select' ? (
                <select
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors[field.id] ? 'border-red-500' : 'border-slate-200'}`}
                  onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                  value={formData[field.id] || ''}
                >
                  <option value="">בחר...</option>
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none h-20 resize-none ${errors[field.id] ? 'border-red-500' : 'border-slate-200'}`}
                  onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                  value={formData[field.id] || ''}
                />
              ) : (
                <input
                  type={field.type}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none ${errors[field.id] ? 'border-red-500' : 'border-slate-200'}`}
                  onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                  value={formData[field.id] || ''}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            הרשמה ואישור
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationModal;
