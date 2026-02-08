
import { CareEvent, AppSettings, EventType, ChatTopic } from '../types';

const EVENTS_KEY = 'ruhi_care_events_v3';
const SETTINGS_KEY = 'ruhi_care_settings_v3';
const CHAT_KEY = 'ruhi_chat_v1';
const CHAT_USERS_KEY = 'ruhi_chat_users_v1';

export interface ChatUser {
  name: string;
  pass: string;
}

export const getEvents = (): CareEvent[] => {
  const data = localStorage.getItem(EVENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEvents = (events: CareEvent[]) => {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
};

export const getChatTopics = (): ChatTopic[] => {
  const data = localStorage.getItem(CHAT_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveChatTopics = (topics: ChatTopic[]) => {
  localStorage.setItem(CHAT_KEY, JSON.stringify(topics));
};

export const getChatUsers = (): ChatUser[] => {
  const data = localStorage.getItem(CHAT_USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveChatUsers = (users: ChatUser[]) => {
  localStorage.setItem(CHAT_USERS_KEY, JSON.stringify(users));
};

export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (data) return JSON.parse(data);

  return {
    coordinatorName: "פדר רבקי",
    coordinatorPhone: "052-7626549",
    safetyNote: "חשוב מאד ביציאה לשים לב שהלחצן מצוקה בהשג ידה!",
    systemNote: "העדכון בטבלה חשוב ביותר כדי למנוע עומסים ואי נעימויות מצד אחד, וחוסר מבקרים מהצד השני.",
    fridayMessage: "לאחר משמרת הבוקר - זמן התארגנות לשבת.",
    saturdayMessage: "שבת שלום! אין ביקורים ביום זה.",
    slots: [
      { id: 's1', label: 'בוקר', startTime: '09:00', endTime: '14:00', type: EventType.Escort },
      { id: 's2', label: 'צהריים', startTime: '14:00', endTime: '16:00', type: EventType.Visitor },
      { id: 's3', label: 'ערב (ליווי)', startTime: '16:00', endTime: '22:00', type: EventType.Escort },
      { id: 's4', label: 'ערב 1 (ביקור)', startTime: '16:00', endTime: '19:00', type: EventType.Visitor },
      { id: 's5', label: 'ערב 2 (ביקור)', startTime: '19:00', endTime: '22:00', type: EventType.Visitor },
    ],
    fields: [
      { id: 'firstName', label: 'שם פרטי', isRequired: true, isPublic: true, type: 'text' },
      { id: 'lastName', label: 'שם משפחה', isRequired: true, isPublic: true, type: 'text' },
      { id: 'phone', label: 'טלפון', isRequired: true, isPublic: false, type: 'tel' },
      { id: 'relation', label: 'קרבה', isRequired: false, isPublic: true, type: 'text' },
      { id: 'arrivalStatus', label: 'האם ההגעה סופית?', isRequired: true, isPublic: true, type: 'select', options: ['סופי', 'ייתכנו שינויים'] },
      { id: 'notes', label: 'הערות', isRequired: false, isPublic: false, type: 'textarea' },
    ],
    notices: [
      { id: 'n1', text: "מלווה יחיד אחראי/ת להיות לצד רוחי ולדאוג לכל צרכיה ולהיות בשטח עם המבקרים שיגיעו.", type: 'escort' },
      { id: 'n2', text: "חשוב מאד ביציאה לשים לב שהלחצן מצוקה בהשג ידה!", type: 'safety' }
    ],
    ads: [
      { id: 'a1', title: "תודה לתומכים", description: "כאן ניתן לפרסם הודעות תודה או פרסומות של הקהילה.", link: "#" }
    ]
  };
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
