
export enum EventType {
  Escort = 'Escort',
  Visitor = 'Visitor'
}

export enum EventStatus {
  Confirmed = 'Confirmed',
  Pending = 'Pending'
}

export interface RegistrationField {
  id: string;
  label: string;
  isRequired: boolean;
  isPublic: boolean;
  type: 'text' | 'tel' | 'select' | 'textarea';
  options?: string[];
}

export interface TimeSlotDef {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  type: EventType;
}

export interface CareEvent {
  id: string;
  slotId: string;
  date: string; // ISO date
  status: EventStatus;
  registrationData: Record<string, string>;
  creatorId: string;
}

export interface AppNotice {
  id: string;
  text: string;
  type: 'safety' | 'escort' | 'visitor' | 'general';
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  link?: string;
  imageUrl?: string; // New: support for image content
}

export interface ChatMessage {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

export interface ChatTopic {
  id: string;
  title: string;
  author: string;
  timestamp: number;
  messages: ChatMessage[];
}

export interface AppSettings {
  coordinatorName: string;
  coordinatorPhone: string;
  safetyNote: string;
  systemNote: string;
  fridayMessage: string;
  saturdayMessage: string;
  slots: TimeSlotDef[];
  fields: RegistrationField[];
  notices: AppNotice[];
  ads: Advertisement[];
}
