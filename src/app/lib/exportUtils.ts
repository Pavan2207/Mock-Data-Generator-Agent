import { format } from "sql-formatter";
import Papa from "papaparse";
import type { Schema } from "./dataGenerator";

export function exportToCSV(data: any[]): string {
  return Papa.unparse(data);
}

export function exportToJSON(data: any[]): string {
  return JSON.stringify(data, null, 2);
}

export function exportToSQL(data: any[], schema: Schema, dialect: "postgresql" | "sqlite" = "postgresql"): string {
  const tableName = schema.tableName;
  const columns = schema.fields.map((f) => f.name);

  const inserts = data.map((row) => {
    const values = columns.map((col) => {
      const value = row[col];
      if (value === null) return "NULL";
      if (typeof value === "string") return `'${value.replace(/'/g, "''")}'`;
      if (typeof value === "boolean") {
        return dialect === "sqlite" ? (value ? "1" : "0") : (value ? "TRUE" : "FALSE");
      }
      return value;
    });

    return `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${values.join(", ")});`;
  });

  const sql = inserts.join("\n");

  try {
    return format(sql, { language: dialect });
  } catch (e) {
    return sql;
  }
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
