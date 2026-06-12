import { Schema } from "../lib/dataGenerator";

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