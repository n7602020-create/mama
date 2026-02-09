
import { CareEvent, AppSettings, EventType, ChatTopic } from '../types';

export interface ChatUser {
  name: string;
  pass: string;
}

// מזהה ייחודי למניעת התנגשויות
const BUCKET_ID = 'ruhi_final_stable_sync_v5';
const BASE_URL = `https://kvdb.io/A4rY3qN6u1e5u7y9s9z2r/${BUCKET_ID}`;

// פונקציה שמבטיחה שהמידע תמיד טרי מהענן
async function remoteGet<T>(key: string, defaultValue: T): Promise<T> {
  try {
    // הוספת timestamp כדי למנוע מהדפדפן לשמור גרסה ישנה של המידע
    const cacheBuster = `?t=${Date.now()}`;
    const response = await fetch(`${BASE_URL}_${key}${cacheBuster}`, { 
      method: 'GET',
      headers: { 
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    if (!response.ok) return defaultValue;
    const text = await response.text();
    return text ? JSON.parse(text) : defaultValue;
  } catch (e) {
    console.error(`Error fetching ${key}:`, e);
    return defaultValue;
  }
}

async function remoteSave<T>(key: string, data: T): Promise<void> {
  try {
    await fetch(`${BASE_URL}_${key}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
}

export const getEvents = async (): Promise<CareEvent[]> => remoteGet<CareEvent[]>('events', []);

export const saveEvents = async (newEvents: CareEvent[]) => {
  await remoteSave('events', newEvents);
};

export const getChatTopics = async (): Promise<ChatTopic[]> => remoteGet<ChatTopic[]>('chat', []);

export const saveChatTopics = async (updatedTopics: ChatTopic[]) => {
  await remoteSave('chat', updatedTopics);
};

export const getSettings = async (): Promise<AppSettings> => {
  const defaultSettings: AppSettings = {
    coordinatorName: "פדר רבקי",
    coordinatorPhone: "052-7626549",
    safetyNote: "חשוב מאד ביציאה לשים לב שהלחצן מצוקה בהשג ידה!",
    systemNote: "העדכון בטבלה חשוב ביותר כדי למנוע עומסים ואי נעימויות מצד אחד, וחוסר מבקרים מהצד השני.",
    fridayMessage: "זמן התארגנות לשבת.",
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
      { id: 'n1', text: "מלווה יחיד אחראי להיות לצד רוחי.", type: 'escort' },
      { id: 'n2', text: "שימו לב ללחצן מצוקה!", type: 'safety' }
    ],
    ads: [
      { id: 'a1', title: "ברוכים הבאים", description: "תודה לכל הקהילה על העזרה.", link: "#" }
    ]
  };
  return remoteGet<AppSettings>('settings', defaultSettings);
};

export const saveSettings = async (settings: AppSettings) => remoteSave('settings', settings);

export const getChatUsers = (): ChatUser[] => {
  const data = localStorage.getItem('ruhi_chat_users_v5');
  return data ? JSON.parse(data) : [];
};

export const saveChatUsers = (users: ChatUser[]) => {
  localStorage.setItem('ruhi_chat_users_v5', JSON.stringify(users));
};
