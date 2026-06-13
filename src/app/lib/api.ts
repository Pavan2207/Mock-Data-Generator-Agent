import { Schema } from "./dataGenerator";

const sanitizeUrl = (url: string) => {
  if (!url) return "";
  return url
    .trim()
    .replace(/[.,;/\s]+$/, "") // Remove trailing punctuation (like the dot in your screenshot)
    .replace(/\/health$/, "")  // Remove /health if user pasted the full status URL
    .split(/[?#]/)[0]          // Remove query params and fragments
    .replace(/\/+$/, "");      // Final trailing slash cleanup
};

const getApiBaseUrl = () => {
  const settings = JSON.parse(localStorage.getItem("appSettings") || "{}");
  // Priority: 1. User saved settings, 2. Environment variable, 3. Hardcoded fallback
  const url = 
    settings.apiBaseUrl || 
    import.meta.env.VITE_API_BASE_URL || 
    "http://localhost:3000";
    
  return sanitizeUrl(url);
};

export const api = {
  async testDatabaseConnection(config: any, signal?: AbortSignal) {
    const baseUrl = sanitizeUrl(config?.apiBaseUrl || '');
    // Prevent double-pathing if baseUrl already includes /api/db (common for Vercel relative paths)
    const endpoint = baseUrl.startsWith('/api/db') ? `${baseUrl}/test` : `${baseUrl}/api/db/test`;
    
    console.log(`[API] Testing DB connection via gateway at: ${endpoint}`);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
      signal,
    }).catch(err => {
      throw new Error(`Gateway Unreachable: ${err.message}`);
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[API] DB Connection failed at ${endpoint}:`, errorData);
      const errorMsg = errorData.message || errorData.error || response.statusText || `Status ${response.status}`;
      throw new Error(`Connection failed: ${errorMsg}`);
    }
    return response.json();
  },

  async generateSchemaFromPrompt(prompt: string, settings: any) {
    if (settings.aiProvider === "gemini") {
      const model = (settings.geminiModel || "gemini-3.5-flash").replace(/^models\//, "");
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a database architect. Create a database schema based on this description: "${prompt}". 
              Return ONLY a JSON object matching this format: { "tableName": "string", "fields": [{"name": "string", "type": "string", "faker": "string", "constraints": {}}] }. 
              Do not include markdown formatting or backticks.`
            }]
          }]
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Gemini Error: ${response.status}`);
      }
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Invalid response structure from Gemini");
      return JSON.parse(text.replace(/```json|```/g, "").trim());
    }

    throw new Error("No AI provider configured");
  },

  async generateWithAI(schema: Schema, rowCount: number, settings: any, signal?: AbortSignal) {
    if (settings.aiProvider === "gemini") {
      const model = (settings.geminiModel || "gemini-3.5-flash").replace(/^models\//, "");
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate ${rowCount} rows of highly realistic mock data for a database table named "${schema.tableName}".
              Fields structure: ${JSON.stringify(schema.fields)}.
              
              Requirements:
              1. Use deep context for fields like addresses, product names, and company names.
              2. Ensure data across columns is consistent (e.g., city matches state/zip).
              3. Return ONLY a valid JSON array of objects. 
              4. Do not include markdown formatting or explanations.`
            }]
          }]
        }),
        signal,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Gemini Error: ${response.status}`);
      }
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Invalid response structure from Gemini");
      
      const cleanJson = text.replace(/```json|```/g, "").trim();
      const content = JSON.parse(cleanJson);
      return Array.isArray(content) ? content : (Object.values(content)[0] || []);
    }

    throw new Error("No AI provider configured");
  },

  async generateWithLLM(schema: Schema, rowCount: number) {
    const settings = JSON.parse(localStorage.getItem("appSettings") || "{}");
    return this.generateWithAI(schema, rowCount, settings);
  },

  async seedDatabase(schema: Schema, data: any[], settings: any) {
    const baseUrl = sanitizeUrl(settings?.apiBaseUrl || getApiBaseUrl());
    const endpoint = baseUrl.startsWith('/api/db') 
      ? `${baseUrl}/seed` 
      : (baseUrl === "" ? "/api/db/seed" : `${baseUrl}/api/db/seed`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schema, data, config: settings }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[API] Seeding failed:", errorData);
      throw new Error(errorData.message || errorData.error || `Seeding failed: ${response.statusText}`);
    }
    return response.json();
  },

  async queryDatabase(sql: string, settings: any) {
    const baseUrl = sanitizeUrl(settings?.apiBaseUrl || '');
    const endpoint = baseUrl.startsWith('/api/db') ? `${baseUrl}/query` : `${baseUrl}/api/db/query`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql, config: settings }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const status = response.status === 404 ? "Not Found (Check Gateway Routes)" : response.statusText;
      console.error(`[API] Query failed at ${endpoint} [${response.status}]:`, errorData);
      throw new Error(errorData.message || errorData.error || `Query failed: ${status}`);
    }
    return response.json();
  },

  async sendNotification(webhookUrl: string, payload: any) {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: payload.title,
          description: payload.message,
          color: 0x8b5cf6,
          fields: [
            { name: "Table", value: payload.details.tableName, inline: true },
            { name: "Rows", value: payload.details.rows.toString(), inline: true }
          ],
          timestamp: new Date().toISOString()
        }]
      }),
    });
  },

  async generateData(schema: Schema, rowCount: number) {
    const baseUrl = sanitizeUrl(getApiBaseUrl());
    const endpoint = baseUrl.startsWith('/api/db') ? `${baseUrl}/generate` : `${baseUrl}/api/db/generate`;
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schema, rowCount }),
    });
    if (!response.ok) throw new Error("Server-side generation failed");
    return response.json();
  },

  async saveGeneration(record: any) {
    // History is now handled by the Vercel function
    const baseUrl = sanitizeUrl(''); 
    const endpoint = baseUrl.startsWith('/api/db') ? `${baseUrl}/history` : `${baseUrl}/api/db/history`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    return response.json();
  },

  async getHistory() {
    // History is now handled by the Vercel function
    const baseUrl = sanitizeUrl(''); 
    const endpoint = baseUrl.startsWith('/api/db') ? `${baseUrl}/history` : `${baseUrl}/api/db/history`;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Failed to fetch history from server");
    return response.json();
  },

  async checkAiStatus(provider: string, url?: string, key?: string, signal?: AbortSignal) {
    try {
      let endpoint = "";
      // For Vercel Serverless Function, the base is relative
      const base = sanitizeUrl(url || '');

      // AI status checks (Gemini is external, gateway is now Vercel function)
      if (provider === "gemini") {
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${key || ""}`;
      } else if (provider === "gateway") {
        // Check if the Node.js bridge is actually reachable
        endpoint = base.startsWith('/api/db') ? `${base}/health` : `${base}/api/db/health`;
      } else {
        endpoint = `${base}/api/ai/status`;
      }

      const response = await fetch(endpoint, { 
        mode: 'cors', 
        cache: 'no-cache', 
        signal, 
        credentials: 'omit' 
      }).catch(() => null);
      
      if (!response) {
        console.error(`[API] ${provider} is completely unreachable at ${endpoint}`);
        return false;
      }
      
      if (!response.ok) {
        console.warn(`[API] AI Status check failed for ${provider} [${response.status}]:`, response.statusText);
        return false;
      }
      // For the gateway, we want to ensure it's specifically the bridge responding
      const data = await response.json();
      return data; // Return full data object for better UI feedback
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error(`[API] Connection to ${provider} timed out.`);
      } else if (error.name === 'TypeError') {
        const target = url || "service";
        console.error(`[API] Network Error for ${provider}. Browser cannot reach ${target}. Check CORS and Firewalls.`);
      } else {
        console.error(`[API] Connection error for ${provider}:`, error);
      }
      return false;
    }
  }
};