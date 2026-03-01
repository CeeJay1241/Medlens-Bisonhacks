// Base API URL (backend routes are prefixed with /api)
export const apiUrl = "http://localhost:8000/api";

async function request(endpoint, options = {}) {
  const res = await fetch(`${apiUrl}${endpoint}`, {
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Health check
export async function checkHealth() {
  return request("/health");
}

// Main pipeline processing
export async function processPipeline(data) {
  return request("/pipeline/process", {
    method: "POST",
    body:
      data instanceof FormData
        ? data
        : JSON.stringify(data),
  });
}

// PDF export
export async function exportSummaryPdf(data) {
  return request("/pdf/export", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// TTS Audio generation (THIS fixes your current error)
export async function generateTtsAudio(data) {
  return request("/tts/audio", {
    method: "POST",
    body: JSON.stringify(data),
  });
}