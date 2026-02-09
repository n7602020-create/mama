
import { CareEvent, AppSettings, EventType, ChatTopic } from '../types';

// Fix: Define and export ChatUser interface to satisfy imports in components/ChatSystem.tsx
export interface ChatUser {
  name: string;
  pass: string;
}

// Using an anonymous KV store for true cross-device sync without complex auth for this demo
// In a production app on Vercel, you'd use @vercel/kv with environment variables.
const BUCKET_URL = 'https://kvdb.io/A6j5n5q6H6Q9n5p6A6j5n5'; // Generic persistent bucket for Ruhi app
const EVENTS_KEY = 'events';
const SETTINGS_KEY = 'settings';
const CHAT_KEY = 'chat';
const USERS_KEY = 'users';

// Fallback to local storage if cloud is unavailable
const getLocal = (key: string) => {
  const d = localStorage.getItem(`ruhi_${key}`);
  return d ? JSON.parse(d) : null;
};

const saveLocal = (key: string, data: any) => {
  localStorage.setItem(`ruhi_${key}`, JSON.stringify(data));
};

export const fetchCloudData = async (key: string, fallback: any) => {
  try {
    const response = await fetch(`${BUCKET_URL}/${key}`);
    if (!response.ok) throw new Error('Cloud fetch failed');
    const data = await response.json();
    saveLocal(key, data); // Keep local cache updated
    return data;
  } catch (e) {
    console.warn(`Sync failed for ${key}, using local cache.`);
    return getLocal(key) || fallback;
  }
};

export const saveCloudData = async (key: string, data: any) => {
  saveLocal(key, data); // Update local first for snappy UI
  try {
    await fetch(`${BUCKET_URL}/${key}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.error(`Failed to push ${key} to cloud.`);
  }
};

export const getEvents = () => fetchCloudData(EVENTS_KEY, []);
export const saveEvents = (events: CareEvent[]) => saveCloudData(EVENTS_KEY, events);

export const getSettings = (): Promise<AppSettings> => {
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
  return fetchCloudData(SETTINGS_KEY, defaultSettings);
};
export const saveSettings = (settings: AppSettings) => saveCloudData(SETTINGS_KEY, settings);

export const getChatTopics = () => fetchCloudData(CHAT_KEY, []);
export const saveChatTopics = (topics: ChatTopic[]) => saveCloudData(CHAT_KEY, topics);

// Fix: Added explicit return types using the ChatUser interface
export const getChatUsers = (): Promise<ChatUser[]> => fetchCloudData(USERS_KEY, []);
export const saveChatUsers = (users: ChatUser[]) => saveCloudData(USERS_KEY, users);
