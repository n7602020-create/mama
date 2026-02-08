
import React from 'react';
import { CareEvent, EventType, EventStatus } from '../types';
import { User, Users, Clock, AlertCircle } from 'lucide-react';

interface EventCardProps {
  event: CareEvent;
  onClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const isEscort = event.type === EventType.Escort;
  const isPending = event.status === EventStatus.Pending;

  return (
    <div 
      onClick={onClick}
      className={`relative group cursor-pointer overflow-hidden p-4 rounded-xl border transition-all duration-200 
        ${isEscort 
          ? 'bg-white border-indigo-100 hover:border-indigo-300 shadow-sm hover:shadow-md' 
          : 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md'
        }
        ${isPending ? 'border-dashed' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`p-1.5 rounded-lg ${isEscort ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
          {isEscort ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}
        </div>
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-slate-400">
          <Clock className="w-3 h-3" />
          {event.startTime}-{event.endTime}
        </div>
      </div>

      <h3 className={`text-sm font-bold truncate ${isEscort ? 'text-indigo-900' : 'text-emerald-900'}`}>
        {event.personnel || 'פנוי לשיבוץ'}
      </h3>
      
      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
        {isEscort ? 'מלווה' : 'מבקר'}
      </p>

      {isPending && (
        <div className="absolute top-2 left-2 animate-pulse">
          <AlertCircle className="w-4 h-4 text-amber-500" />
        </div>
      )}

      {!event.personnel && (
        <div className="mt-3">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isEscort ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
            הזמן עכשיו
          </span>
        </div>
      )}
    </div>
  );
};

export default EventCard;
