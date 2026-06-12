import { Schema } from "./dataGenerator";

const getApiBaseUrl = () => {
  const settings = JSON.parse(localStorage.getItem("appSettings") || "{}");
  return settings.apiBaseUrl || import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
};

export const api = {
  async testDatabaseConnection(config: any) {
    const response = await fetch(`${getApiBaseUrl()}/api/db/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error("Database connection failed");
    return response.json();
  },

  async generateWithLLM(schema: Schema, rowCount: number) {
    const settings = JSON.parse(localStorage.getItem("appSettings") || "{}");
    
    if (settings.aiProvider === "ollama") {
      const response = await fetch(`${settings.ollamaUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3", // or settings.model
          prompt: `Generate ${rowCount} rows of realistic mock data for a table named "${schema.tableName}" with these fields: ${JSON.stringify(schema.fields)}. Return ONLY a JSON array.`,
          stream: false,
          format: "json"
        }),
      });
      const result = await response.json();
      // Ollama returns the string in 'response' field
      return JSON.parse(result.response);
    } 
    
    if (settings.aiProvider === "openai") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${settings.openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { 
              role: "system", 
              content: "You are a data generation expert. Always return data as a valid JSON array of objects." 
            },
            { 
              role: "user", 
              content: `Generate ${rowCount} rows for table "${schema.tableName}" based on schema: ${JSON.stringify(schema.fields)}` 
            }
          ],
          response_format: { type: "json_object" }
        }),
      });
      const result = await response.json();
      const content = JSON.parse(result.choices[0].message.content);
      // Return the array regardless of if GPT wrapped it in an object
      return Array.isArray(content) ? content : Object.values(content)[0];
    }
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

  async checkAiStatus(provider: string, url?: string) {
    const endpoint = provider === "ollama" ? `${url}/api/tags` : `${getApiBaseUrl()}/api/ai/status`;
    try {
      const response = await fetch(endpoint);
      return response.ok;
    } catch (e) {
      return false;
    }
  }
};