// test-script.js — run with: node test-script.js
import { analyzeMedicalDocument, processDocument } from '../medlens-ai.js';
import { readFileSync } from 'fs';

// Small helper to pause between heavy LLM calls to avoid rate limits
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// ============================================
// TEST 1: LLM only (text input, no OCR)
// This should be your FIRST test — isolates the prompt + API connection
// ============================================
async function testLLMOnly() {
  console.log('\n=== TEST 1: LLM ONLY (text input) ===\n');

  const sampleText = `DISCHARGE SUMMARY
Patient: John Doe, DOB: 03/15/1965
Date of Discharge: 02/21/2026
Diagnosis: Type 2 Diabetes Mellitus, Hypertension

Medications:
- Metformin 500mg PO BID with meals
- Lisinopril 10mg PO daily
- Aspirin 81mg PO daily

Instructions:
- Monitor blood glucose levels daily before breakfast
- Follow up with Dr. Williams in 2 weeks
- Low sodium diet recommended
- Return to ER if experiencing chest pain, severe headache, or blood glucose >400mg/dL

Follow-up: Dr. Williams, March 7, 2026 at 10:00 AM`;

  const result = await processDocument(sampleText, 'simple');
  console.log(JSON.stringify(result, null, 2));
  return result;
}

// ============================================
// TEST 2: Reading level comparison
// Same text at all 3 levels — verify output changes
// ============================================
async function testReadingLevels() {
  console.log('\n=== TEST 2: READING LEVEL COMPARISON ===\n');

  const sampleText = `Diagnosis: Acute exacerbation of chronic obstructive pulmonary disease (COPD) with hypoxemic respiratory failure.
Medications: Prednisone 40mg PO daily x5 days. Albuterol 2.5mg nebulizer Q4H PRN. Azithromycin 500mg PO day 1, then 250mg PO days 2-5.
Instructions: Supplemental O2 at 2L/min via nasal cannula. Follow up with pulmonology within 7 days. Smoking cessation counseling recommended.`;

  for (const level of ['simple', 'standard', 'detailed']) {
    console.log(`\n--- ${level.toUpperCase()} ---`);
    const result = await processDocument(sampleText, level);
    console.log('Summary:', result.summary);
    await sleep(2000);
    console.log('');
  }
}

// ============================================
// TEST 3: Edge case — non-medical text
// Should ideally return an error or flag
// ============================================
async function testNonMedical() {
  console.log('\n=== TEST 3: NON-MEDICAL TEXT ===\n');

  const groceryList = `Shopping List:
- 2 lbs chicken breast
- 1 gallon milk
- Bread (whole wheat)
- Bananas
- Laundry detergent`;

  const result = await analyzeMedicalDocument(groceryList, 'simple');
  console.log(JSON.stringify(result, null, 2));
}

// ============================================
// TEST 4: OCR + LLM (full pipeline)
// Only run this if you have a sample image file
// ============================================
async function testFullPipeline() {
  console.log('\n=== TEST 4: FULL PIPELINE (OCR + LLM) ===\n');

  const imagePath = './tests/sample_discharge.png';
  try {
    readFileSync(imagePath); // check file exists
  } catch {
    console.log(`Skipping — no image found at ${imagePath}`);
    console.log('To test OCR, save a screenshot of a medical document as sample_discharge.png');
    return;
  }

  const imageBuffer = readFileSync(imagePath);
  const result = await analyzeMedicalDocument(imageBuffer, 'simple');
  console.log('OCR Confidence:', result.ocrConfidence);
  console.log(JSON.stringify(result, null, 2));
}

// ============================================
// RUN TESTS
// ============================================
async function runAll() {
  try {
    await testLLMOnly();
    await sleep(2000);
    await testReadingLevels();
    await sleep(2000);
    await testNonMedical();
    await sleep(2000);
    await testFullPipeline();
    console.log('\n=== TEST COMPLETE ===');
  } catch (err) {
    console.error('Test failed:', err);
  }
}

runAll();