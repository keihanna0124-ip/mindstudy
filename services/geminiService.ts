
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StudyProfile, StudyPlan, QuizResult } from "../types";
import { STUDY_SYSTEM_INSTRUCTION } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. Tạo lộ trình với Thinking Mode (Gemini 3 Pro)
export const generateDetailedStudyPlan = async (profile: StudyProfile, quiz: QuizResult, isThinking: boolean): Promise<StudyPlan> => {
  const prompt = `
    Student Profile:
    - Grade: ${profile.grade}
    - Strengths: ${profile.strengths}
    - Weaknesses: ${profile.weaknesses}
    - Challenges: ${profile.challenges}
    - Goals: ${profile.goals}
    - Focus Stamina: ${profile.focusTime} hours/day
    - Sleep: ${profile.sleepDuration} hours/day
    - Quiz: Focus=${quiz.focusLevel}, Style=${quiz.style}

    Instructions: Generate a 4-node roadmap. If Thinking is enabled, provide extremely deep strategic insights.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: STUDY_SYSTEM_INSTRUCTION + " Provide a powerful motivationalQuote in Vietnamese.",
      responseMimeType: "application/json",
      thinkingConfig: isThinking ? { thinkingBudget: 32768 } : undefined,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
              },
              required: ["title", "content"]
            }
          },
          summary: { type: Type.STRING },
          advice: { type: Type.STRING },
          motivationalQuote: { type: Type.STRING },
        },
        required: ["roadmap", "summary", "advice", "motivationalQuote"]
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

// 2. Tạo Audio sống động (Gemini 2.5 Flash TTS)
export const generateVividAudio = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Đọc diễn cảm lời khuyên học tập sau đây: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio || "";
};

// 3. Chatbot với Search Grounding & Thinking
export const chatWithAssistant = async (message: string, useSearch: boolean) => {
  const response = await ai.models.generateContent({
    model: useSearch ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview',
    contents: message,
    config: {
      tools: useSearch ? [{ googleSearch: {} }] : undefined,
      thinkingConfig: !useSearch ? { thinkingBudget: 32768 } : undefined,
      systemInstruction: "Bạn là MindStudy AI, trợ lý học tập thông minh. Trả lời bằng tiếng Việt, thân thiện và chính xác."
    },
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

// 4. Phản hồi nhanh (Gemini 3 Flash)
export const fastSummary = async (content: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tóm tắt cực ngắn nội dung sau trong 1 câu: ${content}`,
  });
  return response.text;
};

// 5. Gợi ý thư giãn (Gemini 3 Flash)
// Fix: Added missing export for generateRelaxSuggestions as requested by the error report.
export const generateRelaxSuggestions = async (stressSource: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Người dùng đang cảm thấy mệt mỏi hoặc căng thẳng do: ${stressSource}. Hãy đưa ra lời khuyên thư giãn ngắn gọn, ấm áp và hiệu quả bằng tiếng Việt.`,
  });
  return response.text || "Hãy dành chút thời gian hít thở sâu và nghỉ ngơi nhé.";
};
