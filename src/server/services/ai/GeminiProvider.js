const { GoogleGenAI } = require('@google/genai');

class GeminiProvider {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    this.client = null;

    if (this.apiKey && this.apiKey.trim()) {
      try {
        this.client = new GoogleGenAI({ apiKey: this.apiKey.trim() });
      } catch (err) {
        console.warn('[GeminiProvider] Warning during client initialization:', err.message);
      }
    }
  }

  isConfigured() {
    const key = process.env.GEMINI_API_KEY || this.apiKey;
    return Boolean(key && key.trim() && key.trim() !== 'YOUR_GEMINI_API_KEY_HERE');
  }

  getClient() {
    const key = process.env.GEMINI_API_KEY || this.apiKey;
    if (!this.client || this.apiKey !== key) {
      this.apiKey = key;
      this.client = new GoogleGenAI({ apiKey: this.apiKey.trim() });
    }
    return this.client;
  }

  getModelName() {
    return process.env.GEMINI_MODEL || this.modelName;
  }

  /**
   * Generates text content with system instruction, prompt injection defenses,
   * automatic retry, and fallback across verified active flash models.
   */
  async generateContent({ systemInstruction, prompt, temperature = 0.2, jsonMode = false }) {
    if (!this.isConfigured()) {
      const err = new Error('AI Service Unavailable: GEMINI_API_KEY is not configured in backend environment.');
      err.code = 'GEMINI_NOT_CONFIGURED';
      err.statusCode = 503;
      throw err;
    }

    const primaryModel = this.getModelName();
    const candidateModels = Array.from(
      new Set([primaryModel, 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-lite-latest'])
    );

    let lastError = null;

    for (const model of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const ai = this.getClient();
          const config = { temperature };

          if (systemInstruction) {
            config.systemInstruction = systemInstruction;
          }

          if (jsonMode) {
            config.responseMimeType = 'application/json';
          }

          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config,
          });

          let rawText = '';
          if (response) {
            if (typeof response.text === 'function') {
              rawText = response.text();
            } else if (typeof response.text === 'string') {
              rawText = response.text;
            } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
              rawText = response.candidates[0].content.parts[0].text;
            }
          }

          if (!rawText) {
            throw new Error('Gemini returned an empty response.');
          }

          if (jsonMode) {
            try {
              const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
              return JSON.parse(cleaned);
            } catch (jsonErr) {
              console.warn('[GeminiProvider] JSON parse fallback. Raw response:', rawText);
              throw new Error('Failed to parse structured JSON response from Gemini.');
            }
          }

          return rawText;
        } catch (err) {
          lastError = err;
          const msg = String(err.message || '');
          const status = err.status || err.statusCode;

          // If API key is fundamentally invalid, fail immediately
          if (status === 401 || msg.includes('API_KEY_INVALID')) {
            return this._handleApiError(err);
          }

          // If it's a 503 high-demand spike or 429 rate limit, wait and retry / failover
          if (status === 503 || status === 429 || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
            console.warn(`[GeminiProvider] Transient ${status || 'demand'} on model ${model} (attempt ${attempt + 1}). Retrying...`);
            await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
            continue;
          }

          // Other unexpected errors: try next candidate model
          break;
        }
      }
    }

    return this._handleApiError(lastError);
  }

  _handleApiError(err) {
    console.error('[GeminiProvider] Error calling Gemini API:', err.message || err);

    const message = err.message || '';
    const status = err.status || err.statusCode;

    if (status === 400 || message.includes('API_KEY_INVALID') || message.includes('API key not valid')) {
      const error = new Error('Invalid Gemini API key. Please verify your GEMINI_API_KEY setting.');
      error.statusCode = 401;
      error.code = 'GEMINI_INVALID_KEY';
      throw error;
    }

    if (status === 429 || message.includes('RESOURCE_EXHAUSTED') || message.includes('quota')) {
      const error = new Error('Gemini API quota exceeded or rate limited. Please try again in a few moments.');
      error.statusCode = 429;
      error.code = 'GEMINI_QUOTA_EXCEEDED';
      throw error;
    }

    if (message.includes('ETIMEDOUT') || message.includes('timeout') || message.includes('ECONNRESET')) {
      const error = new Error('Gemini API request timed out. Please try again.');
      error.statusCode = 504;
      error.code = 'GEMINI_TIMEOUT';
      throw error;
    }

    const fallbackError = new Error(`Gemini AI service error: ${message}`);
    fallbackError.statusCode = 502;
    fallbackError.code = 'GEMINI_ERROR';
    throw fallbackError;
  }
}

const geminiProvider = new GeminiProvider();
module.exports = geminiProvider;
