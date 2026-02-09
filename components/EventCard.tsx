
import React from 'react';
import { CareEvent, EventType, EventStatus } from '../types';
import { User, Users, Clock, AlertCircle } from 'lucide-react';

interface EventCardProps {
  event: CareEvent;
  onClick?: () => void;
}

// Note: This component is currently unused in the main PublicView table but kept for future mobile/list views.
const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const isEscort = event.slotId.includes('s1') || event.slotId.includes('s3'); // Placeholder logic
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
          {event.date}
        </div>
      </div>

      <h3 className={`text-sm font-bold truncate ${isEscort ? 'text-indigo-900' : 'text-emerald-900'}`}>
        {event.registrationData.firstName} {event.registrationData.lastName}
      </h3>
      
      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
        {isEscort ? 'מלווה' : 'מבקר'}
      </p>

      {isPending && (
        <div className="absolute top-2 left-2 animate-pulse">
          <AlertCircle className="w-4 h-4 text-amber-500" />
        </div>
      )}
    </div>
  );
};

export default EventCard;
