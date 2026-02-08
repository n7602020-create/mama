
import React, { useState } from 'react';
import { CareEvent, AppSettings, TimeSlotDef, EventType, AppNotice, Advertisement } from '../types';
import { LayoutGrid, Settings, ListChecks, CalendarRange, Plus, Trash2, Megaphone, BellRing, Image as ImageIcon } from 'lucide-react';

interface AdminDashboardProps {
  events: CareEvent[];
  settings: AppSettings;
  onUpdateEvents: (events: CareEvent[]) => void;
  onUpdateSettings: (settings: AppSettings) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ events, settings, onUpdateEvents, onUpdateSettings }) => {
  const [activeTab, setActiveTab] = useState<'events' | 'slots' | 'fields' | 'notices' | 'ads' | 'texts'>('events');
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  const updateSettings = (updated: AppSettings) => {
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const addNotice = () => {
    const newNotice: AppNotice = { id: Date.now().toString(), text: "הנחיה חדשה", type: 'general' };
    updateSettings({ ...localSettings, notices: [...localSettings.notices, newNotice] });
  };

  const addAd = () => {
    const newAd: Advertisement = { id: Date.now().toString(), title: "פרסומת חדשה", description: "תיאור הפרסומת", imageUrl: "" };
    updateSettings({ ...localSettings, ads: [...localSettings.ads, newAd] });
  };

  const handleAddSlot = () => {
    const newSlot: TimeSlotDef = { id: Math.random().toString(36).substr(2, 5), label: 'משבצת חדשה', startTime: '00:00', endTime: '00:00', type: EventType.Visitor };
    updateSettings({ ...localSettings, slots: [...localSettings.slots, newSlot] });
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-full overflow-x-auto shadow-sm">
        {[
          { id: 'events', label: 'נרשמים', icon: CalendarRange },
          { id: 'slots', label: 'משבצות', icon: LayoutGrid },
          { id: 'fields', label: 'טופס', icon: ListChecks },
          { id: 'notices', label: 'הנחיות', icon: BellRing },
          { id: 'ads', label: 'פרסומות', icon: Megaphone },
          { id: 'texts', label: 'כללי', icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-sm whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-in fade-in duration-300">
        
        {activeTab === 'events' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">רשימת נרשמים</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3">תאריך</th>
                    <th className="px-4 py-3">משבצת</th>
                    <th className="px-4 py-3">נרשם</th>
                    <th className="px-4 py-3">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {events.sort((a,b) => b.date.localeCompare(a.date)).map(event => {
                    const slot = settings.slots.find(s => s.id === event.slotId);
                    return (
                      <tr key={event.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-4 font-bold">{event.date}</td>
                        <td className="px-4 py-4">{slot?.label}</td>
                        <td className="px-4 py-4">
                          <div className="font-bold text-slate-900">{event.registrationData.firstName} {event.registrationData.lastName}</div>
                          <div className="text-[10px] text-slate-400">{event.registrationData.phone}</div>
                        </td>
                        <td className="px-4 py-4">
                          <button onClick={() => onUpdateEvents(events.filter(e => e.id !== event.id))} className="text-red-400 p-2 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'slots' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">ניהול משבצות זמן</h2>
              <button onClick={handleAddSlot} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" /> הוסף משבצת
              </button>
            </div>
            <div className="grid gap-3">
              {localSettings.slots.map(slot => (
                <div key={slot.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3">
                  <input className="bg-white border rounded-lg px-3 py-1.5 flex-grow font-bold text-sm outline-none" value={slot.label} onChange={e => updateSettings({...localSettings, slots: localSettings.slots.map(s => s.id === slot.id ? {...s, label: e.target.value} : s)})} />
                  <div className="flex gap-2">
                    <input type="time" className="bg-white border rounded-lg px-2 py-1 text-xs outline-none" value={slot.startTime} onChange={e => updateSettings({...localSettings, slots: localSettings.slots.map(s => s.id === slot.id ? {...s, startTime: e.target.value} : s)})} />
                    <input type="time" className="bg-white border rounded-lg px-2 py-1 text-xs outline-none" value={slot.endTime} onChange={e => updateSettings({...localSettings, slots: localSettings.slots.map(s => s.id === slot.id ? {...s, endTime: e.target.value} : s)})} />
                  </div>
                  <select className="bg-white border rounded-lg px-2 py-1 text-xs outline-none" value={slot.type} onChange={e => updateSettings({...localSettings, slots: localSettings.slots.map(s => s.id === slot.id ? {...s, type: e.target.value as EventType} : s)})}>
                    <option value={EventType.Escort}>מלווה</option>
                    <option value={EventType.Visitor}>מבקר</option>
                  </select>
                  <button onClick={() => updateSettings({...localSettings, slots: localSettings.slots.filter(s => s.id !== slot.id)})} className="text-red-400 p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'fields' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">הגדרות טופס הרשמה</h2>
            <div className="grid gap-3">
              {localSettings.fields.map(field => (
                <div key={field.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="font-bold text-slate-700 text-sm">{field.label}</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateSettings({...localSettings, fields: localSettings.fields.map(f => f.id === field.id ? {...f, isRequired: !f.isRequired} : f)})}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${field.isRequired ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}
                    >
                      {field.isRequired ? 'חובה' : 'רשות'}
                    </button>
                    <button 
                      onClick={() => updateSettings({...localSettings, fields: localSettings.fields.map(f => f.id === field.id ? {...f, isPublic: !f.isPublic} : f)})}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${field.isPublic ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}
                    >
                      {field.isPublic ? 'גלוי' : 'נסתר'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notices' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">ניהול הנחיות</h2>
              <button onClick={addNotice} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> הוסף
              </button>
            </div>
            <div className="grid gap-3">
              {localSettings.notices.map(notice => (
                <div key={notice.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 items-center">
                  <select 
                    className="bg-white border rounded-lg px-2 py-1 text-xs font-bold outline-none"
                    value={notice.type}
                    onChange={e => updateSettings({...localSettings, notices: localSettings.notices.map(n => n.id === notice.id ? {...n, type: e.target.value as any} : n)})}
                  >
                    <option value="general">כללי</option>
                    <option value="safety">בטיחות</option>
                    <option value="escort">מלווה</option>
                    <option value="visitor">מבקר</option>
                  </select>
                  <input className="flex-grow bg-white border rounded-lg px-3 py-1.5 text-sm outline-none" value={notice.text} onChange={e => updateSettings({...localSettings, notices: localSettings.notices.map(n => n.id === notice.id ? {...n, text: e.target.value} : n)})} />
                  <button onClick={() => updateSettings({...localSettings, notices: localSettings.notices.filter(n => n.id !== notice.id)})} className="text-red-400 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ads' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">ניהול פרסומות ותוכן</h2>
              <button onClick={addAd} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> הוסף פרסומת
              </button>
            </div>
            <div className="grid gap-4">
              {localSettings.ads.map(ad => (
                <div key={ad.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex justify-between gap-4">
                    <input placeholder="כותרת" className="flex-grow bg-white border rounded-lg px-3 py-1.5 font-bold text-sm outline-none" value={ad.title} onChange={e => updateSettings({...localSettings, ads: localSettings.ads.map(a => a.id === ad.id ? {...a, title: e.target.value} : a)})} />
                    <button onClick={() => updateSettings({...localSettings, ads: localSettings.ads.filter(a => a.id !== ad.id)})} className="text-red-400 p-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <textarea placeholder="תיאור" className="w-full bg-white border rounded-lg px-3 py-1.5 text-sm h-16 outline-none resize-none" value={ad.description} onChange={e => updateSettings({...localSettings, ads: localSettings.ads.map(a => a.id === ad.id ? {...a, description: e.target.value} : a)})} />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-1.5">
                      <ImageIcon className="w-3 h-3 text-slate-400" />
                      <input placeholder="URL תמונה" className="flex-grow text-[10px] outline-none" value={ad.imageUrl || ''} onChange={e => updateSettings({...localSettings, ads: localSettings.ads.map(a => a.id === ad.id ? {...a, imageUrl: e.target.value} : a)})} />
                    </div>
                    <input placeholder="קישור" className="bg-white border rounded-lg px-3 py-1.5 text-[10px] outline-none" value={ad.link || ''} onChange={e => updateSettings({...localSettings, ads: localSettings.ads.map(a => a.id === ad.id ? {...a, link: e.target.value} : a)})} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'texts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold border-b pb-2 text-[10px] uppercase tracking-wider text-slate-400">פרטי קשר והנחיות</h3>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">שם אחראית</label>
                <input className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm font-bold outline-none" value={localSettings.coordinatorName} onChange={e => updateSettings({...localSettings, coordinatorName: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">טלפון אחראית</label>
                <input className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm font-bold outline-none" value={localSettings.coordinatorPhone} onChange={e => updateSettings({...localSettings, coordinatorPhone: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">הערת בטיחות בבנר</label>
                <input className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm font-bold text-amber-600 outline-none" value={localSettings.safetyNote} onChange={e => updateSettings({...localSettings, safetyNote: e.target.value})} />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold border-b pb-2 text-[10px] uppercase tracking-wider text-slate-400">הודעות מערכת</h3>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">הערה מתחת לכותרת</label>
                <textarea className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm h-20 outline-none resize-none" value={localSettings.systemNote} onChange={e => updateSettings({...localSettings, systemNote: e.target.value})} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
