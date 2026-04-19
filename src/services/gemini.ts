/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Assignment, AssignmentVersion, SlideContent, OutputMode, AssignmentFormat } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateAssignment(params: {
  topic: string;
  tone: string;
  language: string;
  marks: number;
  teacherMode: string;
  format: AssignmentFormat;
  numSlides: number;
  sourceImage?: { mimeType: string; data: string };
}): Promise<Assignment> {
  const { topic, tone, language, marks, teacherMode, format, numSlides, sourceImage } = params;
  
  const systemInstruction = `You are an expert education content generator for Indian students (CBSE/ICSE level). Create an exhaustive, high-quality presentation.
${topic ? `Main Topic: "${topic}"` : ''}
${sourceImage ? 'A reference image (possibly hand-written notes, ideas, or questions) has been provided. ANALYZE it thoroughly and use its content as the primary source for the assignment.' : ''}
Language: ${language}
Tone: ${tone}
Target Marks: ${marks}
Teacher Mode: ${teacherMode} (Strict means hard grading/advanced, Easy means simple/foundation).
Style: ${tone} (formal, fun, or simple)
Format: ${format}
Target Slide Count: ${numSlides}

Structural Requirements:
1. Title Slide
2. Introduction
3. Key Concepts (multiple slides)
4. Examples / Explanation
5. Conclusion
6. Summary Points

Educational Rules:
- Use simple student-friendly language relevant to the Indian curriculum.
- Keep each slide short (5-6 bullet points max).
- Add headings clearly.
- Avoid long paragraphs.
- Provide 2 image descriptions per slide (as 'suggestedImages').
- Provide exactly 1 short, engaging speech script per slide (as 'speech').
- Cover the topic/content from historical, current, and future perspectives.
- Include data-driven insights and key definitions.
- Ensure the language is natural and culturally relevant to ${language}.

Generate 3 distinct versions (Normal, Simplified, Detailed).
Each version MUST have the same number of slides but with differing content depth.
Detailed mode should include technical data and deeper analysis.
Simplified mode should use analogies and basic terms.
Normal mode should be perfect for a general audience.

Data requirements:
- At least two slides in Normal/Detailed MUST contain a 'table' with relevant data.
- At least two slides in Normal/Detailed MUST contain 'chartData' (array of {name, value}) representing real-world statistics.`;

  const slideSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      points: { type: Type.ARRAY, items: { type: Type.STRING } },
      speech: { type: Type.STRING, description: "A short speech script for this slide" },
      suggestedImages: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2 descriptions of useful images for this slide" },
      table: { 
        type: Type.OBJECT, 
        properties: {
          headers: { type: Type.ARRAY, items: { type: Type.STRING } },
          rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
        }
      },
      chartData: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            value: { type: Type.NUMBER }
          }
        }
      }
    },
    required: ["title", "points", "speech", "suggestedImages"]
  };

  try {
    const contents: any[] = [];
    
    if (sourceImage) {
      contents.push({
        inlineData: {
          mimeType: sourceImage.mimeType,
          data: sourceImage.data
        }
      });
    }
    
    contents.push({ text: `Generate the full assignment content in JSON format based on the topic: "${topic}" ${sourceImage ? 'and the provided image content.' : ''}` });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: contents },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            Normal: { type: Type.ARRAY, items: slideSchema },
            Simplified: { type: Type.ARRAY, items: slideSchema },
            Detailed: { type: Type.ARRAY, items: slideSchema }
          },
          required: ["Normal", "Simplified", "Detailed"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    const rawData = JSON.parse(text);
    
    const versions: AssignmentVersion[] = Object.keys(rawData).map((mode) => ({
      mode: mode as OutputMode,
      slides: rawData[mode]
    }));

    versions.push({
      mode: 'Handwritten',
      slides: rawData.Normal
    });

    return {
      id: `asst-${Date.now()}`,
      topic,
      tone,
      language,
      marks,
      teacherMode: teacherMode as any,
      versions,
      createdAt: Date.now(),
      format
    };
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    // Re-throw with a more user-friendly message if it's a known error type
    if (error?.message?.includes('API_KEY_INVALID') || error?.message?.includes('403')) {
      throw new Error("Invalid API Key. Please check your Gemini API configuration in the Secrets panel.");
    }
    if (error?.message?.includes('limit') || error?.message?.includes('429')) {
      throw new Error("API Quota exceeded. Please try again in a few minutes.");
    }
    throw new Error(error?.message || "Failed to call Gemini API");
  }
}

export async function improveSlideContent(slide: SlideContent, instruction: string, language: string): Promise<SlideContent> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Improve this slide content.
Current Content: ${JSON.stringify(slide)}
Language: ${language}
Instruction: ${instruction} (e.g. "make easier", "expand", "add more detail")`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            points: { type: Type.ARRAY, items: { type: Type.STRING } },
            speech: { type: Type.STRING, description: "A short speech script for this slide" },
            suggestedImages: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2 descriptions of useful images for this slide" },
            table: { 
              type: Type.OBJECT, 
              properties: {
                headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
              }
            },
            chartData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER }
                }
              }
            }
          },
          required: ["title", "points", "speech", "suggestedImages"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to improve slide:", error);
    return slide;
  }
}
