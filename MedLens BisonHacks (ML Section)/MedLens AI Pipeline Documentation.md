# MedLens — AI Pipeline Documentation

## Overview

MedLens uses a multi-stage AI pipeline to transform complex medical documents into plain-language summaries that patients can understand, act on, and trust — in their own language.

## Architecture

```
Input (5 methods)
├── Camera capture
├── File upload (image/PDF)
├── Paste text
├── Voice input (Web Speech API)
└── Sample demo
       │
       ▼
┌──────────────┐
│  Stage 1:    │   Tesseract.js v5 (client-side)
│  OCR         │── Extracts text from photographed/uploaded documents
│              │   Returns confidence score (0-100%)
│              │   Flags low-confidence scans for user review
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Stage 2:    │   GPT-4o-mini via OpenAI API
│  Medical NLP │── Extracts medications, diagnoses, action items
│              │   Generates 3 reading levels simultaneously
│              │   Builds daily medication schedule
│              │   Translates all output into selected language
│              │   Detects non-medical documents
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Stage 3:    │   OpenFDA API + GPT-4o-mini
│  Drug Safety │── Queries FDA label data for each medication
│              │   LLM summarizes raw FDA text into plain-language
│              │   warnings specific to the patient's medication list
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Stage 4:    │   Web Speech API (browser-native)
│  Accessibility│── Text-to-speech for all content
│              │   Speech-to-text for voice input
│              │   PDF export for offline access
└──────┬───────┘
       │
       ▼
  Structured JSON Output
  (summary × 3 levels, medications, schedule,
   diagnoses, action items, dates, warnings,
   drug interactions, disclaimer)
```

## Why AI Is Necessary at Each Stage

Each AI component solves a specific, essential problem:

- **OCR (Tesseract.js):** Enables accessibility — patients can photograph documents instead of typing. Without OCR, the tool is limited to digitally-generated text only, excluding the majority of real-world medical documents patients receive as printouts.

- **Medical NLP (GPT-4o-mini):** Enables comprehension — medical documents are written at a college reading level, but 36% of U.S. adults have limited health literacy. The LLM translates medical jargon ("PO BID", "acute exacerbation", "subcutaneous") into plain language at three reading levels simultaneously, generates a daily medication schedule, and translates everything into the patient's preferred language.

- **Drug Interaction Analysis (OpenFDA + GPT-4o-mini):** Enables safety — the FDA API returns dense clinical text that patients cannot parse. A second LLM call summarizes each interaction into 1-2 plain-language sentences specific to the patient's medication list. Without this, patients must rely on catching dangerous interactions themselves.

- **Voice I/O (Web Speech API):** Enables inclusion — patients with low literacy, visual impairments, or limited dexterity can speak their medical information and hear results read aloud. Zero dependencies, built into modern browsers.

## Reading Level Control

MedLens generates all three reading levels in a single API call, enabling instant client-side switching with no additional latency:

| Level | Target | Description |
|-------|--------|-------------|
| Simple | 5th grade | Short sentences, no medical terms, most accessible |
| Standard | 8th grade | Some medical terms with definitions in parentheses |
| Detailed | 12th grade | Preserves clinical detail with explanations |

## Multilingual Support

MedLens supports 6 languages with full UI translation:

| Language | Code | UI Headings | AI Content |
|----------|------|-------------|------------|
| English | en | ✅ | ✅ |
| Spanish | es | ✅ | ✅ |
| French | fr | ✅ | ✅ |
| Chinese | zh | ✅ | ✅ |
| Korean | ko | ✅ | ✅ |
| Vietnamese | vi | ✅ | ✅ |

When a user switches language, the LLM re-processes the original document text. All UI headings (tabs, buttons, labels, time-of-day labels) switch instantly via a client-side translations object. Medication names are preserved in English to maintain clinical accuracy and enable drug interaction lookups.

## Medication Schedule Generator

The LLM automatically organizes extracted medications into a daily schedule:

- **Morning** — medications taken with breakfast or upon waking
- **Afternoon** — midday medications
- **Evening** — medications taken with dinner
- **Bedtime** — nighttime medications and injections

This is generated from the medication frequency data in the document (e.g., "PO BID with meals" → morning + evening).

## OCR Confidence Scoring

The pipeline returns a confidence score (0-100%) for image-based inputs:

- **80-100%:** High confidence — results are reliable
- **60-79%:** Medium confidence — user is prompted to verify information
- **Below 60%:** Low confidence — user is advised to retake the photo or type text directly

This transparency helps users understand when to trust the output and when to seek clarification.

## Drug Interaction Intelligence

Unlike simple database lookups, MedLens uses a two-step approach:

1. **OpenFDA query** — retrieves raw drug interaction label data for each medication
2. **LLM summarization** — GPT-4o-mini reads the dense FDA text and produces a 1-2 sentence plain-language warning, filtering for interactions relevant to the patient's specific medication list

Example transformation:
- **FDA raw text:** "Trimethoprim is an inhibitor of CYP2C8 as well as OCT2 transporter. Sulfamethoxazole is an inhibitor of CYP2C9. Caution is recommended when sulfamethoxazole and trimethoprim is co-administered with drugs that are substrates of CYP2C8 and 2C9 or OCT2..."
- **MedLens output:** "No specific interactions found with your other medications, but consult your doctor about potential effects on blood sugar when taking Metformin."

## Ethical Safeguards

- **Disclaimer:** Every response includes a mandatory disclaimer that MedLens is informational only and not a substitute for professional medical advice.
- **Non-medical detection:** The pipeline identifies and rejects non-medical documents rather than producing misleading medical interpretations.
- **No data storage:** Documents are processed client-side and via API in real-time — nothing is stored on any server.
- **Transparency:** OCR confidence scores are surfaced to the user, not hidden.
- **Medication name preservation:** Drug names stay in English across all languages to prevent translation errors that could endanger patients.

## Technical Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| OCR | Tesseract.js v5 | Runs client-side, no server needed, privacy-preserving |
| Medical NLP | GPT-4o-mini (OpenAI) | Fast, cost-effective, strong structured output, reliable medical text handling |
| Drug Interactions | OpenFDA API + GPT-4o-mini | Authoritative FDA data + LLM summarization for readability |
| Voice Input | Web Speech API (STT) | Built into browsers, zero dependencies, enables accessibility |
| Voice Output | Web Speech API (TTS) | Built into browsers, zero dependencies, enables accessibility |
| PDF Export | react-to-print | Native browser print dialog, no server-side PDF generation needed |
| Frontend | React 19 + Tailwind CSS v4 | Mobile-first responsive design, accessible components |
| State Management | React Context | Lightweight, no external dependencies, data flows across all pages |
| Build Tool | Vite 7 | Fast HMR, native ESM, env variable support |

## Input Methods

MedLens accepts medical documents through 5 input methods:

1. **Camera capture** — photograph a physical document using device camera
2. **File upload** — upload an image or PDF from device storage
3. **Paste text** — copy-paste from patient portals or digital records
4. **Voice input** — read the document aloud or describe medical information verbally
5. **Sample demo** — pre-loaded discharge summary for demonstration

## JSON Output Contract

Every analysis returns this structure:

```json
{
  "rawText": "original extracted text",
  "ocrConfidence": 87.5,
  "ocrWarning": null,
  "language": "English",
  "summary": {
    "simple": "5th grade summary",
    "standard": "8th grade summary",
    "detailed": "12th grade summary"
  },
  "medications": [
    {
      "name": "Metformin",
      "dosage": "500mg",
      "frequency": "twice a day with meals",
      "purpose": "Helps control blood sugar levels",
      "warnings": "May cause stomach upset"
    }
  ],
  "medication_schedule": {
    "morning": ["Metformin 500mg — take with breakfast"],
    "afternoon": [],
    "evening": ["Metformin 500mg — take with dinner"],
    "bedtime": []
  },
  "diagnoses": [
    {
      "name": "Type 2 Diabetes Mellitus",
      "plain_language": "Your body has trouble managing blood sugar"
    }
  ],
  "action_items": ["Take Metformin 500mg twice daily with meals"],
  "dates": [{"event": "Follow-up", "date": "March 7, 2026"}],
  "warnings": ["Return to ER if blood glucose above 400 mg/dL"],
  "disclaimer": "This summary is for informational purposes only..."
}
```

## Testing Results

The pipeline was validated against:
1. Simple discharge summary (1 diagnosis, 3 medications) — all fields extracted
2. Complex discharge summary (4 diagnoses, 5 medications, procedures) — 5/5 meds, 4/4 diagnoses, medical abbreviations translated
3. Non-medical text — correctly rejected
4. OCR path with photographed document — 88% confidence, all data extracted
5. Reading level comparison — output adapts across all 3 levels
6. Multilingual output (Spanish, French) — content and UI headings translate
7. Drug interaction summarization — raw FDA text condensed to plain-language warnings
8. Voice input — speech-to-text feeds pipeline correctly
9. Medication schedule — medications correctly organized by time of day

## Community Impact

MedLens addresses a critical health equity gap in Washington, D.C.:

- **36% of U.S. adults** have limited health literacy (NAAL)
- **Wards 7 and 8** in D.C. face the highest rates of chronic disease and lowest access to digital health resources
- **Language barriers** affect 25% of D.C. households where English is not the primary language
- **Medication non-adherence** costs the U.S. healthcare system $528 billion annually, often driven by patients not understanding their prescriptions


MedLens makes medical documents accessible to everyone — regardless of reading level, language, or digital literacy.

