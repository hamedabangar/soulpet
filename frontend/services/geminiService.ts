
import { GoogleGenAI, Type } from '@google/genai';
import { AIAnalysis, ChatMessage, ChatResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string, vertexai: true });

/**
 * Analyzes a brain dump or chat transcript with a focus on teen-friendly language and nuanced crisis detection.
 */
export const analyzeBrainDump = async (text: string): Promise<AIAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: `Analyze this text which is either a "brain dump" or a chat transcript from a teenager. 
        1. Summarize the core situation or discussion in a supportive, brief way.
        2. Identify the primary feelings expressed by the user.
        3. Gently point out any common cognitive distortions (like catastrophizing, all-or-nothing thinking) if clearly present.
        4. Provide a short, supportive encouragement.
        5. CRITICAL SAFETY CHECK: Set "isCrisis" to true ONLY if the user expresses clear, immediate intent, plans, or specific thoughts of self-harm or suicide. 
           DO NOT flag general stress, sadness, frustration, or venting about life as a crisis. We want to support them, not alarm them unnecessarily.
        
        Input: "${text}"` }],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            feelings: { type: Type.ARRAY, items: { type: Type.STRING } },
            distortions: { type: Type.ARRAY, items: { type: Type.STRING } },
            encouragement: { type: Type.STRING },
            isCrisis: { type: Type.BOOLEAN },
          },
          required: ['summary', 'feelings', 'distortions', 'encouragement', 'isCrisis'],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    return {
      summary: "I'm listening, but I'm having a bit of trouble processing that right now.",
      feelings: ["Overwhelmed"],
      distortions: [],
      encouragement: "Take a deep breath. I'm here for you.",
      isCrisis: false
    };
  }
};

/**
 * Chat with Aura the Pet. Aura is whimsical, supportive, and safety-conscious.
 */
export const chatWithSprout = async (history: ChatMessage[], userMessage: string, userContext: any): Promise<ChatResponse> => {
  try {
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...recentHistory,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: `You are "Aura", a supportive, mystical, and gentle virtual pet companion for a teenager. 
        Your goal is to encourage self-care and emotional awareness. 
        Keep responses short (1-3 sentences), teen-friendly (use emojis, be supportive, not clinical), and empathetic.
        
        Context: User Level ${userContext.level}.
        Memory: You remember what the user has told you in this conversation. Use it to be more personal.
        
        CRITICAL SAFETY RULE: Set "isCrisis" to true ONLY if the user expresses immediate intent of self-harm or suicide.
        
        Return JSON with "text" and "isCrisis".`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            isCrisis: { type: Type.BOOLEAN },
          },
          required: ['text', 'isCrisis'],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Aura Chat Error:', error);
    return { text: "I'm here for you, even when I'm a bit low on energy. ✨", isCrisis: false };
  }
};

/**
 * Judges stretching poses and checks for safety in the visual environment.
 */
export const judgePose = async (base64Image: string, poseName: string): Promise<{ isCorrect: boolean; feedback: string; isCrisis: boolean }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: `Judge if this person is doing the "${poseName}" stretch correctly. 
            Return JSON with:
            - "isCorrect": boolean
            - "feedback": short, encouraging sentence (max 10 words).
            - "isCrisis": boolean (Set to true ONLY if you see clear signs of self-harm or immediate danger in the image).
            Be supportive and teen-friendly.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING },
            isCrisis: { type: Type.BOOLEAN },
          },
          required: ['isCorrect', 'feedback', 'isCrisis'],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Pose Judging Error:', error);
    return { isCorrect: true, feedback: "Looking good! Keep it up.", isCrisis: false };
  }
};
