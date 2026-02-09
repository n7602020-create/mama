
import { GoogleGenAI } from "@google/genai";
import { CareEvent, EventType } from "../types";
import { getSettings } from "./storage";

export const analyzeScheduleWithAI = async (events: CareEvent[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Fix: Await the promise returned by getSettings() to access its properties like slots and safetyNote
    const settings = await getSettings();

    // Group events by date for a clearer summary
    const grouped = events.reduce((acc, e) => {
      if (!acc[e.date]) acc[e.date] = [];
      acc[e.date].push(e);
      return acc;
    }, {} as Record<string, CareEvent[]>);

    const scheduleSummary = Object.entries(grouped)
      .map(([date, dayEvents]) => {
        const eventDetails = dayEvents.map(e => {
          const slot = settings.slots.find(s => s.id === e.slotId);
          const personnel = `${e.registrationData.firstName || ''} ${e.registrationData.lastName || ''}`.trim();
          const typeLabel = slot?.type === EventType.Escort ? 'מלווה' : 'מבקר';
          const slotLabel = slot?.label || 'משבצת';
          return `- ${slotLabel} (${typeLabel}): ${personnel || 'טרם נרשמו'}`;
        }).join('\n');
        return `תאריך ${date}:\n${eventDetails}`;
      })
      .join('\n\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `אתה עוזר אישי למתאמת טיפול ושיקום עבור "רוחי". 
      עליך לנתח את סידור העבודה השבועי המצורף ולזהות פערים קריטיים.
      
      דגשים לניתוח:
      1. האם יש משבצות "מלווה" (Escort) ריקות? (זהו פער קריטי).
      2. האם יש ימים ללא מבקרים כלל?
      3. האם הנחיות הבטיחות מתקיימות? הנחיית בטיחות: ${settings.safetyNote}
      
      כתוב סיכום קצר, מעודד ומקצועי בעברית בלבד. 
      בסוף, הצע הודעה קצרה שאפשר להעתיק לוואטסאפ של המשפחה/קהילה כדי לגייס מתנדבים למשבצות החסרות.
      
      הסידור:
      ${scheduleSummary || 'אין אירועים רשומים כרגע.'}`,
      config: {
        systemInstruction: "You are an expert care coordinator assistant named Ruhi-AI. Your tone is warm, professional, and efficient. You only speak Hebrew.",
      }
    });

    return response.text || "לא הצלחתי להפיק תובנות כרגע.";
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "חלה שגיאה בחיבור לשירות ה-AI. אנא נסו שוב מאוחר יותר.";
  }
};
