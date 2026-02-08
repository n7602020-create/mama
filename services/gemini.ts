
import { GoogleGenAI } from "@google/genai";
import { CareEvent, EventType } from "../types";
import { getSettings } from "./storage";

// Using the Google GenAI SDK to analyze the care schedule.
export const analyzeScheduleWithAI = async (events: CareEvent[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Fetch current settings to resolve slot labels and types, as they are not stored directly on the CareEvent.
    const settings = getSettings();

    // Map events to a descriptive summary, resolving missing properties from registrationData and settings.
    const scheduleSummary = events.map(e => {
      const slot = settings.slots.find(s => s.id === e.slotId);
      const personnel = `${e.registrationData.firstName || ''} ${e.registrationData.lastName || ''}`.trim();
      const typeLabel = slot?.type === EventType.Escort ? 'מלווה' : 'מבקר';
      const slotLabel = slot?.label || 'משבצת';
      return `${e.date}: ${slotLabel} (${typeLabel}) - ${personnel || 'ריק'}`;
    }).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an assistant for a rehabilitation care coordinator. 
      Analyze the following weekly schedule and identify critical gaps (missing escorts or days with no visitors). 
      Keep it brief and in Hebrew. Mention if safety rules are being met.
      
      Safety Note: ${settings.safetyNote}
      
      Schedule:
      ${scheduleSummary}`,
      config: {
        systemInstruction: "You are a professional care assistant. Respond only in Hebrew. Be helpful and encouraging.",
      }
    });

    // The result text is accessed via the .text property (not a method).
    return response.text || "לא הצלחתי לנתח את הלוח כרגע.";
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "שגיאה בחיבור לבינה המלאכותית.";
  }
};
