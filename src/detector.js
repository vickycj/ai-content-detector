import { model } from "./firebase-config.js";

const AI_DETECTION_PROMPT = `You are an expert AI-generated content detector. Analyze this {mediaType} carefully and determine whether it was created by AI or is authentic/real.

Examine the following aspects thoroughly:

FOR IMAGES:
- Unnatural smoothness, plastic-like skin textures, or overly perfect features
- Inconsistent lighting, shadows, or reflections
- Distorted or malformed hands, fingers, teeth, ears, or accessories
- Background anomalies: warped lines, inconsistent architecture, blending artifacts
- Text rendering issues: garbled, misspelled, or oddly styled text
- Repeating patterns or symmetry that looks procedurally generated
- Unusual bokeh or depth-of-field artifacts
- Overly uniform color gradients or unnatural color transitions
- Signs of inpainting or outpainting seams

FOR VIDEOS:
- Frame-to-frame consistency issues (flickering, morphing)
- Unnatural motion or physics (hair, clothing, water, smoke)
- Temporal artifacts: objects appearing/disappearing between frames
- Lip-sync issues or unnatural facial movements
- Inconsistent lighting across frames
- Resolution inconsistencies within the same frame
- Audio-visual desynchronization if audio is present

You MUST respond in this exact JSON format and nothing else:
{
  "verdict": "AI_GENERATED" | "LIKELY_AI" | "UNCERTAIN" | "LIKELY_REAL" | "REAL",
  "confidence": <number between 0 and 100>,
  "summary": "<2-3 sentence summary of the overall finding>",
  "indicators": [
    {
      "type": "ai" | "real",
      "detail": "<specific observation>"
    }
  ]
}

Be thorough but honest. If genuinely uncertain, say so. Do not guess — provide well-reasoned analysis.`;

function fileToGenerativePart(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(",")[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.readAsDataURL(file);
  });
}

export async function analyzeContent(file) {
  const isVideo = file.type.startsWith("video/");
  const mediaType = isVideo ? "video" : "image";

  const prompt = AI_DETECTION_PROMPT.replace("{mediaType}", mediaType);
  const mediaPart = await fileToGenerativePart(file);

  const result = await model.generateContent([prompt, mediaPart]);
  const responseText = result.response.text();

  // Extract JSON from the response (handle markdown code blocks)
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : responseText.trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    // If JSON parsing fails, return a structured fallback
    return {
      verdict: "UNCERTAIN",
      confidence: 50,
      summary: responseText,
      indicators: [],
    };
  }
}
