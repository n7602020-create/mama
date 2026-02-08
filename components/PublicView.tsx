
import React from 'react';
import { CareEvent, AppSettings, EventType } from '../types';
import { HEBREW_DAYS } from '../constants';
import { ChevronLeft, ChevronRight, User, Users, Coffee, MoonStar, Info, ShieldAlert, Heart } from 'lucide-react';

interface PublicViewProps {
  events: CareEvent[];
  settings: AppSettings;
  weekOffset: number;
  onSetWeekOffset: (offset: number) => void;
  onEventClick: (date: string, slotId: string) => void;
  isAdmin: boolean;
}

const PublicView: React.FC<PublicViewProps> = ({ events, settings, weekOffset, onSetWeekOffset, onEventClick, isAdmin }) => {
  const getWeekRange = () => {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay() + (weekOffset * 7));
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return {
      start: start.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }),
      end: end.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }),
      dates: Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
      })
    };
  };

  const { start, end, dates } = getWeekRange();

  const getNoticeIcon = (type: string) => {
    switch (type) {
      case 'safety': return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'escort': return <User className="w-4 h-4 text-indigo-500" />;
      case 'visitor': return <Heart className="w-4 h-4 text-emerald-500" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-10">
      {/* Notices Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settings.notices.map(notice => (
          <div key={notice.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-3 items-start">
            <div className="shrink-0 mt-0.5">{getNoticeIcon(notice.type)}</div>
            <p className="text-xs font-bold text-slate-700 leading-normal">{notice.text}</p>
          </div>
        ))}
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-md">
        <button onClick={() => onSetWeekOffset(weekOffset + 1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-all flex items-center gap-2 font-bold text-xs">
           הבא <ChevronRight className="w-4 h-4" />
        </button>
        <div className="text-center">
          <h3 className="font-bold text-lg text-slate-900"> {start} — {end}</h3>
        </div>
        <button onClick={() => onSetWeekOffset(weekOffset - 1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-all flex items-center gap-2 font-bold text-xs">
          <ChevronLeft className="w-4 h-4" /> הקודם
        </button>
      </div>

      {/* Main Table Structure */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse table-fixed min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="w-28 p-4 text-[10px] font-bold text-slate-400 border-b border-l border-slate-100 uppercase text-right">זמן</th>
              {HEBREW_DAYS.map((day, idx) => (
                <th key={day} className="p-4 border-b border-l last:border-l-0 border-slate-100 text-center">
                  <div className="text-[10px] font-bold text-indigo-400 uppercase opacity-60 mb-1">{day}</div>
                  <div className="text-lg font-black text-slate-800">{new Date(dates[idx]).getDate()}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {settings.slots.map(slot => (
              <tr key={slot.id} className="group">
                <td className="p-4 border-b border-l border-slate-100 bg-slate-50/20">
                  <div className="text-xs font-bold text-slate-900 mb-0.5">{slot.label}</div>
                  <div className="text-[9px] font-bold text-slate-400">{slot.startTime}—{slot.endTime}</div>
                </td>
                {dates.map((date, dayIdx) => {
                  const event = events.find(e => e.date === date && e.slotId === slot.id);
                  const isFriday = dayIdx === 5;
                  const isSaturday = dayIdx === 6;

                  if (isSaturday) {
                    if (slot.id === settings.slots[0].id) {
                      return (
                        <td key={date} rowSpan={settings.slots.length} className="border-b border-l border-slate-100 p-6 align-middle text-center bg-slate-50/40">
                           <div className="flex flex-col items-center gap-3">
                              <MoonStar className="w-8 h-8 text-amber-500 opacity-60" />
                              <div className="text-slate-500 text-sm font-bold leading-tight max-w-[120px] mx-auto">
                                {settings.saturdayMessage}
                              </div>
                           </div>
                        </td>
                      );
                    }
                    return null;
                  }

                  if (isFriday && slot.id !== settings.slots[0].id) {
                     if (slot.id === settings.slots[1].id) {
                        return (
                          <td key={date} rowSpan={settings.slots.length - 1} className="border-b border-l border-slate-100 p-6 align-middle text-center bg-slate-50/20">
                            <div className="flex flex-col items-center gap-2 opacity-40">
                              <Coffee className="w-6 h-6 text-slate-400" />
                              <div className="text-slate-400 text-xs font-bold leading-relaxed max-w-[100px] mx-auto">
                                {settings.fridayMessage}
                              </div>
                            </div>
                          </td>
                        );
                     }
                     return null;
                  }

                  return (
                    <td 
                      key={date} 
                      className={`h-32 p-2 border-b border-l border-slate-100 transition-all hover:bg-slate-50/40 cursor-pointer group/cell`}
                      onClick={() => onEventClick(date, slot.id)}
                    >
                      {event ? (
                        <div className={`h-full rounded-xl p-3 shadow-md border-b-2 animate-in zoom-in duration-300 flex flex-col justify-between ${slot.type === EventType.Escort ? 'bg-indigo-600 text-white border-indigo-800' : 'bg-emerald-600 text-white border-emerald-800'}`}>
                           <div>
                              <div className="text-xs font-bold truncate mb-1">
                                {event.registrationData.firstName} {event.registrationData.lastName}
                              </div>
                              <div className="text-[9px] opacity-90 font-medium line-clamp-2">
                                {settings.fields.filter(f => f.isPublic && !['firstName', 'lastName'].includes(f.id)).map(f => (
                                  <span key={f.id} className="block truncate opacity-80">{event.registrationData[f.id]}</span>
                                ))}
                              </div>
                           </div>
                           <div className="flex justify-end opacity-30">
                              {slot.type === EventType.Escort ? <User className="w-3 h-3"/> : <Users className="w-3 h-3"/>}
                           </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl group-hover/cell:border-indigo-300 transition-all">
                           <span className="text-[10px] font-bold text-slate-300 group-hover/cell:text-indigo-400">הירשם</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PublicView;
