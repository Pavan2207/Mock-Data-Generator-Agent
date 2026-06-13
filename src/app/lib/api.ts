import { Schema } from "./dataGenerator";

const getApiBaseUrl = () => {
  const settings = JSON.parse(localStorage.getItem("appSettings") || "{}");
  const url = settings.apiBaseUrl || import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  return url.replace(/\/$/, "");
};

async function callOllama(baseUrl: string, prompt: string, model: string = "llama3") {
  // Sanitize base URL to ensure we don't double up on /api
  const cleanBase = baseUrl.replace(/\/api$/, "").replace(/\/$/, "");
  
  const response = await fetch(`${cleanBase}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      format: "json"
    }),
  });
  
  if (!response.ok) {
    try {
      const errorJson = await response.json();
      throw new Error(`Ollama Error: ${errorJson.error || response.statusText}`);
    } catch (e: any) {
      if (e.message.startsWith("Ollama Error:")) throw e;
      throw new Error(`Ollama Error: ${response.statusText}`);
    }
  }
  const result = await response.json();
  const cleanJson = result.response.replace(/```json|```/g, "").trim();
  return JSON.parse(cleanJson);
}

export const api = {
  async testDatabaseConnection(config: any, signal?: AbortSignal) {
    const baseUrl = (config?.apiBaseUrl || getApiBaseUrl()).replace(/\/$/, "");
    const response = await fetch(`${baseUrl}/api/db/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
      signal,
    });
    if (!response.ok) throw new Error("Database connection failed");
    return response.json();
  },

  async generateSchemaFromPrompt(prompt: string, settings: any) {
    if (settings.aiProvider === "ollama") {
      return callOllama(
        settings.ollamaUrl.replace(/\/$/, ""),
        `Create a database schema based on this description: "${prompt}". Return ONLY a JSON object with a tableName and fields array. Each field should have name, type, and optionally faker and constraints.`,
        settings.ollamaModel
      );
    }

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

  async generateWithAI(schema: Schema, rowCount: number, settings: any) {
    if (settings.aiProvider === "ollama") {
      const prompt = `Generate ${rowCount} rows of highly realistic mock data for a database table named "${schema.tableName}".
      Fields structure: ${JSON.stringify(schema.fields)}.
      Requirements:
      1. Use deep context for fields like addresses, product names, and company names.
      2. Ensure data across columns is consistent (e.g., city matches state/zip).
      3. Return ONLY a valid JSON array of objects. 
      4. Do not include markdown formatting or explanations.`;

      const content = await callOllama(
        settings.ollamaUrl.replace(/\/$/, ""),
        prompt,
        settings.ollamaModel
      );
      // Handle case where LLM returns an object instead of array
      return Array.isArray(content) ? content : (Object.values(content)[0] || []);
    }

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
    const baseUrl = (settings?.apiBaseUrl || getApiBaseUrl()).replace(/\/$/, "");
    const response = await fetch(`${baseUrl}/api/db/seed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schema, data, config: settings }),
    });
    if (!response.ok) throw new Error("Failed to seed database");
    return response.json();
  },

  async queryDatabase(sql: string, settings: any) {
    const baseUrl = (settings?.apiBaseUrl || getApiBaseUrl()).replace(/\/$/, "");
    const response = await fetch(`${baseUrl}/api/db/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql, config: settings }),
    });
    if (!response.ok) throw new Error("Database query failed");
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
    const response = await fetch(`${getApiBaseUrl()}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schema, rowCount }),
    });
    if (!response.ok) throw new Error("Server-side generation failed");
    return response.json();
  },

  async saveGeneration(record: any) {
    const response = await fetch(`${getApiBaseUrl()}/api/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    return response.json();
  },

  async getHistory() {
    const response = await fetch(`${getApiBaseUrl()}/api/history`);
    if (!response.ok) throw new Error("Failed to fetch history from server");
    return response.json();
  },

  async checkAiStatus(provider: string, url?: string, key?: string, signal?: AbortSignal) {
    try {
      let endpoint = "";
      if (provider === "ollama") {
        const baseUrl = (url || "").replace(/\/$/, "");
        endpoint = `${baseUrl}/api/version`;
      } else if (provider === "gemini" && key) {
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
      } else {
        const baseUrl = (url || getApiBaseUrl()).replace(/\/$/, "");
        endpoint = `${baseUrl}/api/ai/status`;
      }

      const response = await fetch(endpoint, { mode: 'cors', cache: 'no-cache', signal, credentials: 'omit' });
      if (!response.ok) {
        console.warn(`[API] AI Status check failed for ${provider} [${response.status}]:`, response.statusText);
        return false;
      }
      return response.ok;
    } catch (error: any) {
      if (error.name === 'TypeError' && provider === 'ollama') {
        console.error(`[API] Network Error for Ollama. This usually means the service is down OR CORS is blocking the request. Verify OLLAMA_ORIGINS="*" is set and the app is restarted.`);
      } else {
        console.error(`[API] Connection error for ${provider}:`, error);
      }
      return false;
    }
  }
};