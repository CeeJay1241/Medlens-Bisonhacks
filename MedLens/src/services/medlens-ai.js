// medlens-ai.js
// Lightweight AI service layer for MedLens
// Exports: extractText, processDocument, analyzeMedicalDocument

import { createWorker } from 'tesseract.js';

// ============================================
// OCR — Image to text via Tesseract.js v5
// ============================================
async function extractText(imageFile) {
  // v5+ API: pass language to createWorker directly
  console.log('[OCR] Starting Tesseract worker...');
  console.log('[OCR] Input type:', typeof imageFile, imageFile instanceof Blob ? 'Blob' : imageFile instanceof File ? 'File' : typeof imageFile === 'string' ? 'string/dataURL' : 'unknown');
  const worker = await createWorker('eng');
  const { data } = await worker.recognize(imageFile);
  console.log('[OCR] Result text length:', data.text?.length, 'confidence:', data.confidence);
  console.log('[OCR] First 200 chars:', data.text?.slice(0, 200));
  await worker.terminate();
  return {
    text: data.text || '',
    confidence: data.confidence ?? null
  };
}

// ============================================
// Prompt builder
// ============================================
function buildPrompt(documentText, language = 'English') {
  const languageInstruction = language !== 'English' 
    ? `\n\nIMPORTANT: Translate ALL output text into ${language}. Every field value (summaries, medication purposes, diagnoses explanations, action items, warnings, disclaimer) must be written in ${language}. Keep medication names in their original English/medical form.`
    : '';

  return `You are a medical document translator designed to help patients understand their healthcare documents.

Given the following medical document text, return a JSON object with:

1. "summary": An OBJECT with three keys, each a plain-language explanation at a different reading level:
   - "simple": 5th grade reading level — short sentences, no medical terms at all
   - "standard": 8th grade reading level — some medical terms with definitions in parentheses
   - "detailed": 12th grade reading level — preserves more clinical detail with explanations
2. "medications": An array of objects, each with:
   - "name": medication name
   - "dosage": dosage as written
   - "frequency": how often to take it
   - "purpose": plain-language explanation of what it's for
   - "warnings": any warnings mentioned (empty string if none)
3. "diagnoses": An array of objects with:
   - "name": diagnosis name
   - "plain_language": what this means in simple terms
4. "action_items": An array of strings — specific things the patient needs to do (appointments, medications, lifestyle changes, follow-ups)
5. "dates": An array of objects with "event" and "date" fields for any important dates mentioned
6. "warnings": An array of strings — any critical warnings or red flags in the document
7. "medication_schedule": An object organizing medications by time of day:
   - "morning": array of strings (e.g., "Metformin 500mg — take with breakfast")
   - "afternoon": array of strings (empty array if none)
   - "evening": array of strings (e.g., "Metformin 500mg — take with dinner")
   - "bedtime": array of strings (e.g., "Insulin glargine 20 units — inject under the skin")
   Base this on the frequency and instructions for each medication.
8. "disclaimer": Always include this exact string: "This summary is for informational purposes only and is not a substitute for professional medical advice. Always consult your healthcare provider with questions about your care."

If the document does not appear to be a medical document, return:
{"error": "not_medical", "message": "This does not appear to be a medical document."}
${languageInstruction}

Return ONLY valid JSON. No markdown fences, no explanation outside the JSON.

DOCUMENT TEXT:
${documentText}`;
}

// ============================================
// MOCK MODE — set to true to bypass API calls during development
// Switch to false once rate limits clear
// ============================================
const MOCK_MODE = false;

function getMockResponse() {
  return {
    summary: {
      simple: "You were seen for diabetes and high blood pressure. You need to take three medicines and see your doctor again in two weeks.",
      standard: "You were discharged with diagnoses of Type 2 Diabetes Mellitus and Hypertension. Three medications were prescribed, and a follow-up appointment is scheduled.",
      detailed: "This discharge summary documents treatment for Type 2 Diabetes Mellitus and Hypertension. A regimen of Metformin (500mg BID), Lisinopril (10mg daily), and low-dose Aspirin (81mg daily) was prescribed, with follow-up in 2 weeks."
    },
    medications: [
      { name: "Metformin", dosage: "500mg", frequency: "twice a day with meals", purpose: "Helps control blood sugar levels", warnings: "May cause stomach upset" },
      { name: "Lisinopril", dosage: "10mg", frequency: "once daily", purpose: "Lowers blood pressure", warnings: "May cause dizziness" },
      { name: "Aspirin", dosage: "81mg", frequency: "once daily", purpose: "Helps prevent blood clots", warnings: "Do not take on an empty stomach" }
    ],
    diagnoses: [
      { name: "Type 2 Diabetes Mellitus", plain_language: "Your body has trouble managing blood sugar" },
      { name: "Hypertension", plain_language: "Your blood pressure is higher than normal" }
    ],
    action_items: [
      "Take Metformin 500mg twice daily with meals",
      "Take Lisinopril 10mg once daily",
      "Take Aspirin 81mg once daily",
      "Check blood sugar every morning before eating",
      "Follow a low sodium diet",
      "Follow up with Dr. Williams by March 7, 2026",
      "Go to the ER if you have chest pain, severe headache, or blood sugar over 400"
    ],
    dates: [
      { event: "Follow-up appointment", date: "March 7, 2026 at 10:00 AM" }
    ],
    warnings: [
      "Return to ER if experiencing chest pain, severe headache, or blood glucose above 400 mg/dL"
    ],
    medication_schedule: {
      morning: ["Metformin 500mg — take with breakfast", "Lisinopril 10mg", "Aspirin 81mg"],
      afternoon: [],
      evening: ["Metformin 500mg — take with dinner"],
      bedtime: []
    },
    disclaimer: "This summary is for informational purposes only and is not a substitute for professional medical advice. Always consult your healthcare provider with questions about your care."
  };
}

// ============================================
// LLM Processing — Gemini (primary) or OpenAI (fallback)
// ============================================

// For Node.js testing: reads from process.env
// For browser/React: override with getApiKey() or pass key directly
function getGeminiKey() {
  // Browser (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  // Node.js
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  return null;
}

function getOpenAIKey() {
  // Browser (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY) {
    return import.meta.env.VITE_OPENAI_API_KEY;
  }
  // Node.js
  if (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }
  return null;
}

async function callGemini(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2000
      }
    })
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`Gemini API error (${resp.status}): ${errBody}`);
  }

  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No content returned from Gemini API');

  // Gemini often wraps JSON in markdown fences — strip them
  const clean = text.replace(/```json\n?|```\n?/g, '').trim();
  return JSON.parse(clean);
}

async function callOpenAI(prompt, apiKey) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a medical document translator. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 2000
    })
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`OpenAI API error (${resp.status}): ${errBody}`);
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content returned from OpenAI');

  const clean = content.replace(/```json\n?|```\n?/g, '').trim();
  return JSON.parse(clean);
}

async function processDocument(rawText, language = 'English') {
  if (MOCK_MODE) {
    console.log('[MOCK MODE] Returning mock response — set MOCK_MODE = false to use real API');
    return getMockResponse('simple');
  }

  const prompt = buildPrompt(rawText, language);

  // Try Gemini first, then OpenAI
  const geminiKey = getGeminiKey();
  if (geminiKey) {
    return await callGemini(prompt, geminiKey);
  }

  const openaiKey = getOpenAIKey();
  if (openaiKey) {
    return await callOpenAI(prompt, openaiKey);
  }

  throw new Error('No API key found. Set GEMINI_API_KEY or OPENAI_API_KEY.');
}

// ============================================
// Main entry point — full pipeline
// ============================================
async function analyzeMedicalDocument(input, language = 'English') {
  let rawText;
  let ocrConfidence = null;
  let ocrWarning = null;

  if (typeof input === 'string' && !input.startsWith('data:image')) {
    rawText = input;
  } else {
    // Image input — data URL, Blob, or File — run OCR
    // Tesseract.js accepts data URLs directly, no conversion needed
    const ocrResult = await extractText(input);
    rawText = ocrResult.text;
    ocrConfidence = ocrResult.confidence;

    // Flag low-confidence OCR so the UI can warn the user
    if (ocrConfidence !== null && ocrConfidence < 60) {
      ocrWarning = 'We had trouble reading this document clearly. For best results, try a clearer photo or type the text directly.';
    } else if (ocrConfidence !== null && ocrConfidence < 80) {
      ocrWarning = 'Some parts of this document were difficult to read. Please verify the information below.';
    }
  }

  if (!rawText || rawText.trim().length === 0) {
    return { error: 'empty_text', message: 'No text found in document.' };
  }

  const analysis = await processDocument(rawText, language);

  return {
    rawText,
    ocrConfidence,
    ocrWarning,
    language,
    ...analysis
  };
}

export { extractText, processDocument, analyzeMedicalDocument, extractMedicationNames };

// Utility for Person 3 — extracts medication names for OpenFDA lookup
function extractMedicationNames(analysisResult) {
  if (!analysisResult?.medications) return [];
  return analysisResult.medications.map(med => med.name);
}