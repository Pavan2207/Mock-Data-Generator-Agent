import type { Faker } from "@faker-js/faker";

export interface SchemaField {
  name: string;
  type: string;
  faker?: string;
  constraints?: {
    nullable?: boolean;
    unique?: boolean;
    min?: number;
    max?: number;
    enum?: string[];
  };
}

export interface Schema {
  tableName: string;
  fields: SchemaField[];
}

// Helper to infer faker methods based on field name and type
function inferFaker(name: string, type: string): string | undefined {
  const n = name.toLowerCase();
  const t = type.toLowerCase();

  if (n.includes("email")) return "internet.email";
  if (n.includes("name")) {
    if (n.includes("first")) return "person.firstName";
    if (n.includes("last")) return "person.lastName";
    return "person.fullName";
  }
  if (n.includes("phone")) return "phone.number";
  if (n.includes("address")) return "location.streetAddress";
  if (n.includes("city")) return "location.city";
  if (n.includes("country")) return "location.country";
  if (n.includes("company")) return "company.name";
  if (n.includes("price") || n.includes("amount")) return "commerce.price";
  if (n.includes("description")) return "lorem.paragraph";
  
  if (t === "uuid") return "string.uuid";
  if (t === "date") return "date.past";
  if (t === "timestamp" || t === "datetime") return "date.recent";
  
  return undefined;
}

// Map field types to faker methods
export function generateFieldValue(field: SchemaField, fakerInstance: Faker): any {
  const { type, faker: fakerMethod, constraints } = field;

  // Handle custom faker methods
  if (fakerMethod) {
    try {
      const parts = fakerMethod.split(".");
      let method: any = fakerInstance;
      for (const part of parts) {
        method = method[part];
      }
      if (typeof method === "function") {
        return method.bind(fakerInstance)();
      }
    } catch (e) {
      console.warn(`Invalid faker method: ${fakerMethod}`);
    }
  }

  // Handle enum constraints
  if (constraints?.enum && constraints.enum.length > 0) {
    return fakerInstance.helpers.arrayElement(constraints.enum);
  }

  // Default type-based generation
  switch (type.toLowerCase()) {
    // Strings
    case "varchar":
    case "string":
    case "text":
      if (field.name.toLowerCase().includes("email")) {
        return fakerInstance.internet.email();
      }
      if (field.name.toLowerCase().includes("name")) {
        return fakerInstance.person.fullName();
      }
      if (field.name.toLowerCase().includes("phone")) {
        return fakerInstance.phone.number();
      }
      if (field.name.toLowerCase().includes("address")) {
        return fakerInstance.location.streetAddress();
      }
      if (field.name.toLowerCase().includes("city")) {
        return fakerInstance.location.city();
      }
      if (field.name.toLowerCase().includes("country")) {
        return fakerInstance.location.country();
      }
      if (field.name.toLowerCase().includes("company")) {
        return fakerInstance.company.name();
      }
      if (field.name.toLowerCase().includes("description")) {
        return fakerInstance.lorem.paragraph();
      }
      if (field.name.toLowerCase().includes("title")) {
        return fakerInstance.lorem.sentence(3);
      }
      return fakerInstance.lorem.words(3);

    // Numbers
    case "int":
    case "integer":
    case "bigint":
      return fakerInstance.number.int({
        min: constraints?.min ?? 1,
        max: constraints?.max ?? 10000,
      });

    case "float":
    case "real":
    case "numeric":
    case "decimal":
    case "double":
      return fakerInstance.number.float({
        min: constraints?.min ?? 10,
        max: constraints?.max ?? 5000,
        fractionDigits: 2,
      });

    // Boolean
    case "boolean":
    case "bool":
      return fakerInstance.datatype.boolean();

    // Dates
    case "date":
      return fakerInstance.date.past({ years: 1 }).toISOString().split("T")[0];

    case "datetime":
    case "timestamp":
      return fakerInstance.date.recent({ days: 30 }).toISOString();

    // UUID
    case "uuid":
      return fakerInstance.string.uuid();

    // JSON
    case "json":
    case "jsonb":
      return JSON.stringify({
        key: fakerInstance.lorem.word(),
        value: fakerInstance.lorem.sentence(),
      });

    default:
      return fakerInstance.lorem.word();
  }
}

/**
 * Optimized generator factory that resolves field logic once 
 * to avoid expensive switch/regex/string parsing inside loops.
 */
function createFieldGenerator(field: SchemaField, fakerInstance: Faker): () => any {
  // Resolve specific faker method if provided
  if (field.faker) {
    try {
      const parts = field.faker.split(".");
      let method: any = fakerInstance;
      for (const part of parts) {
        method = method[part];
      }
      if (typeof method === "function") {
        return method.bind(fakerInstance);
      }
    } catch (e) {
      console.warn(`Invalid faker method: ${field.faker}`);
    }
  }

  // Fallback to type-based generation
  return () => generateFieldValue(field, fakerInstance);
}

export async function generateMockData(schema: Schema, rowCount: number): Promise<any[]> {
  // Dynamically load faker only when needed
  const { faker } = await import("@faker-js/faker");

  // 1. Pre-resolve generators and metadata outside the loop
  const fieldGenerators = schema.fields.map(field => ({
    name: field.name,
    generate: createFieldGenerator(field, faker),
    isNullable: !!field.constraints?.nullable
  }));

  const data = new Array(rowCount);
  const fieldsCount = fieldGenerators.length;

  // 2. Optimized generation loop
  for (let i = 0; i < rowCount; i++) {
    const row: any = {};
    for (let j = 0; j < fieldsCount; j++) {
      const fg = fieldGenerators[j];
      if (fg.isNullable && Math.random() < 0.1) {
        row[fg.name] = null;
      } else {
        row[fg.name] = fg.generate();
      }
    }
    data[i] = row;
  }
  return data;
}

// Parse DDL to schema
export function parseDDL(ddl: string): Schema {
  // Clean comments and normalize whitespace
  const cleanDDL = ddl.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").trim();
  
  // Extract Table Name
  const tableMatch = cleanDDL.match(/CREATE TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["\`\[]?(\w+)["\`\]]?/i);
  const tableName = tableMatch ? tableMatch[1] : "table";

  // Extract content between the first ( and last )
  const firstParen = cleanDDL.indexOf("(");
  const lastParen = cleanDDL.lastIndexOf(")");
  
  if (firstParen === -1 || lastParen === -1) throw new Error("Invalid DDL: Could not find table body");
  
  const body = cleanDDL.substring(firstParen + 1, lastParen);
  
  // Split by commas, but ignore commas inside parentheses (e.g., DECIMAL(10,2))
  const fieldLines = body.split(/,(?![^(]*\))/);

  const fields: SchemaField[] = [];

  for (const line of fieldLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.toUpperCase().startsWith("PRIMARY KEY") || trimmed.toUpperCase().startsWith("CONSTRAINT")) continue;

    // Match name, type (including parentheses), and the rest
    const match = trimmed.match(/["\`\[]?(\w+)["\`\]]?\s+([\w()]+)([\s\S]*)?/i);
    if (match) {
      let [, name, type, rest] = match;
      const baseType = type.split('(')[0].toUpperCase();
      const restUpper = (rest || "").toUpperCase();
      const nameLower = name.toLowerCase();

      const field: SchemaField = {
        name,
        type: baseType,
        faker: inferFaker(nameLower, baseType),
        constraints: {
          nullable: !restUpper.includes("NOT NULL") && !restUpper.includes("PRIMARY KEY"),
          unique: restUpper.includes("UNIQUE") || restUpper.includes("PRIMARY KEY")
        },
      };

      fields.push(field);
    }
  }

  return { tableName, fields };
}
