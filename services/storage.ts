
import { CareEvent, AppSettings, EventType, ChatTopic } from '../types';

// Fix: Add and export ChatUser interface so it can be used in ChatSystem components
export interface ChatUser {
  name: string;
  pass: string;
}

// מפתח ייחודי לאפליקציה של רוחי כדי שלא יתערבב עם נתונים אחרים
const BUCKET_ID = 'ruhi_care_v2_global_sync';
const BASE_URL = `https://kvdb.io/A4rY3qN6u1e5u7y9s9z2r/${BUCKET_ID}`;

// פונקציות עזר לתקשורת עם הענן
async function remoteGet<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}_${key}`);
    if (!response.ok) return defaultValue;
    const text = await response.text();
    return text ? JSON.parse(text) : defaultValue;
  } catch (e) {
    console.error(`Error fetching ${key} from cloud:`, e);
    return defaultValue;
  }
}

async function remoteSave<T>(key: string, data: T): Promise<void> {
  try {
    await fetch(`${BASE_URL}_${key}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // עדכון מקביל ב-LocalStorage לגיבוי ומהירות
    localStorage.setItem(`${BUCKET_ID}_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to cloud:`, e);
  }
}

export const getEvents = async (): Promise<CareEvent[]> => {
  return remoteGet<CareEvent[]>('events', []);
};

export const saveEvents = async (events: CareEvent[]) => {
  await remoteSave('events', events);
};

export const getChatTopics = async (): Promise<ChatTopic[]> => {
  return remoteGet<ChatTopic[]>('chat', []);
};

export const saveChatTopics = async (topics: ChatTopic[]) => {
  await remoteSave('chat', topics);
};

export const getSettings = async (): Promise<AppSettings> => {
  const defaultSettings: AppSettings = {
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
  return remoteGet<AppSettings>('settings', defaultSettings);
};

export const saveSettings = async (settings: AppSettings) => {
  await remoteSave('settings', settings);
};

export const getChatUsers = (): ChatUser[] => {
  const data = localStorage.getItem('ruhi_chat_users_v1');
  return data ? JSON.parse(data) : [];
};

export const saveChatUsers = (users: ChatUser[]) => {
  localStorage.setItem('ruhi_chat_users_v1', JSON.stringify(users));
};
