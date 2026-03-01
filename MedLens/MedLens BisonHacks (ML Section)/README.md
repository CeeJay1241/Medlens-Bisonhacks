# MedLens — AI Pipeline (local hackathon setup)

Overview
- Lightweight OCR + LLM pipeline for extracting and translating medical documents into structured JSON.
- Files:
  - `medlens-ai.js` — service layer (OCR wrapper, LLM prompt + parsing)
  - `test-script.js` — simple runner that calls `analyzeMedicalDocument()`

Prerequisites
- Node.js 18+ (includes global `fetch`) or a Node runtime with `fetch` polyfill.
- npm

Install
```bash
npm install tesseract.js
```

Environment variables
- Provide an LLM API key via an environment variable. Supported names (checked in that order):
  - `OPENAI_API_KEY` — for OpenAI chat completions
  - `GEMINI_API_KEY` — (optional) for Google Gemini if you adapt endpoints

PowerShell (temporary for current session):
```powershell
$env:OPENAI_API_KEY = 'sk-...replace-with-your-key...'
node test-script.js
```

macOS / Linux (temporary for current session):
```bash
export OPENAI_API_KEY='sk-...replace-with-your-key...'
node test-script.js
```

Notes and tips
- The repo intentionally does not contain API keys. The `medlens-ai.js` module checks `process.env.OPENAI_API_KEY` or `process.env.GEMINI_API_KEY`.
- For hackathon/demo builds you may call the LLM from the client, but for production run it through a backend proxy to keep keys secret.
- If OCR confidence is low (e.g., <60%), prompt the user to retake or manually enter the text.
- `tesseract.js` may require additional native dependencies on some platforms; consult its docs if OCR fails.

License
- (None specified) — this is a hackathon prototype.


