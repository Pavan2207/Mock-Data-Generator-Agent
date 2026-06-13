import { faker } from "@faker-js/faker";

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

// Map field types to faker methods
export function generateFieldValue(field: SchemaField): any {
  const { type, faker: fakerMethod, constraints } = field;

  // Handle custom faker methods
  if (fakerMethod) {
    try {
      const parts = fakerMethod.split(".");
      let method: any = faker;
      for (const part of parts) {
        method = method[part];
      }
      if (typeof method === "function") {
        return method();
      }
    } catch (e) {
      console.warn(`Invalid faker method: ${fakerMethod}`);
    }
  }

  // Handle enum constraints
  if (constraints?.enum && constraints.enum.length > 0) {
    return faker.helpers.arrayElement(constraints.enum);
  }

  // Default type-based generation
  switch (type.toLowerCase()) {
    // Strings
    case "varchar":
    case "string":
    case "text":
      if (field.name.toLowerCase().includes("email")) {
        return faker.internet.email();
      }
      if (field.name.toLowerCase().includes("name")) {
        return faker.person.fullName();
      }
      if (field.name.toLowerCase().includes("phone")) {
        return faker.phone.number();
      }
      if (field.name.toLowerCase().includes("address")) {
        return faker.location.streetAddress();
      }
      if (field.name.toLowerCase().includes("city")) {
        return faker.location.city();
      }
      if (field.name.toLowerCase().includes("country")) {
        return faker.location.country();
      }
      if (field.name.toLowerCase().includes("company")) {
        return faker.company.name();
      }
      if (field.name.toLowerCase().includes("description")) {
        return faker.lorem.paragraph();
      }
      if (field.name.toLowerCase().includes("title")) {
        return faker.lorem.sentence(3);
      }
      return faker.lorem.words(3);

    // Numbers
    case "int":
    case "integer":
    case "bigint":
      return faker.number.int({
        min: constraints?.min ?? 1,
        max: constraints?.max ?? 10000,
      });

    case "float":
    case "real":
    case "numeric":
    case "decimal":
    case "double":
      return faker.number.float({
        min: constraints?.min ?? 10,
        max: constraints?.max ?? 5000,
        fractionDigits: 2,
      });

    // Boolean
    case "boolean":
    case "bool":
      return faker.datatype.boolean();

    // Dates
    case "date":
      return faker.date.past({ years: 1 }).toISOString().split("T")[0];

    case "datetime":
    case "timestamp":
      return faker.date.recent({ days: 30 }).toISOString();

    // UUID
    case "uuid":
      return faker.string.uuid();

    // JSON
    case "json":
    case "jsonb":
      return JSON.stringify({
        key: faker.lorem.word(),
        value: faker.lorem.sentence(),
      });

    default:
      return faker.lorem.word();
  }
}

export async function generateMockData(schema: Schema, rowCount: number): Promise<any[]> {
  const data: any[] = [];
  for (let i = 0; i < rowCount; i++) {
    const row: any = {};

    for (const field of schema.fields) {
      // Handle nullable
      if (field.constraints?.nullable && Math.random() < 0.1) {
        row[field.name] = null;
      } else {
        row[field.name] = generateFieldValue(field);
      }
    }

    data.push(row);
  }

  return data;
}

// Parse DDL to schema
export function parseDDL(ddl: string): Schema {
  const lines = ddl.trim().split("\n");
  const tableName = lines[0].match(/CREATE TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["\`\[]?(\w+)["\`\]]?/i)?.[1] || "table";

  const fields: SchemaField[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line === "(" || line === ");" || line === ")") continue;

    // Improved regex to capture types with precision like VARCHAR(255) or DECIMAL(10,2)
    const match = line.match(/["\`\[]?(\w+)["\`\]]?\s+([\w()]+)(.+)?/i);
    if (match) {
      let [, name, type, rest] = match;
      
      // Normalize type (e.g., VARCHAR(255) -> VARCHAR)
      const baseType = type.split('(')[0].toUpperCase();

      const field: SchemaField = {
        name,
        type: baseType,
        constraints: {},
      };

      if (rest) {
        if (rest.includes("NOT NULL")) {
          field.constraints!.nullable = false;
        } else {
          field.constraints!.nullable = true;
        }

        if (rest.includes("UNIQUE")) {
          field.constraints!.unique = true;
        }
      }

      fields.push(field);
    }
  }

  return { tableName, fields };
}
