import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Shared connection pool logic
const getPool = (c: any) => {
  // Prioritize Vercel Environment Variables
  const pgHost = process.env.PG_HOST || c.pgHost;
  const pgPort = process.env.PG_PORT ? parseInt(process.env.PG_PORT) : (c.pgPort ? parseInt(c.pgPort) : 5432);
  const pgUser = process.env.PG_USER || c.pgUser;
  const pgPassword = process.env.PG_PASSWORD || c.pgPassword;
  const pgDatabase = process.env.PG_DATABASE || c.pgDatabase;
  const pgSsl = process.env.PG_SSL === 'true' || c.pgSsl;

  if (!pgHost || !pgUser || !pgDatabase) return null;

  return new Pool({
    host: pgHost,
    port: pgPort,
    user: pgUser,
    password: pgPassword,
    database: pgDatabase,
    ssl: pgSsl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = req.query.path as string[];
  const endpoint = path.join('/'); 

  try {
    switch (endpoint) {
      case 'test':
        const testPool = getPool(req.body);
        if (!testPool) return res.status(400).json({ success: false, message: 'Missing database configuration' });
        const r = await testPool.query('SELECT NOW()');
        await testPool.end();
        return res.json({ success: true, message: 'Connected successfully!', time: r.rows[0].now });

      case 'query':
        const queryPool = getPool(req.body.config);
        if (!queryPool) return res.status(400).json({ success: false, message: 'Missing database configuration' });
        const result = await queryPool.query(req.body.sql);
        await queryPool.end();
        return res.json({ success: true, rows: result.rows, rowCount: result.rowCount });

      case 'seed':
        const { schema, data, config: seedConfig } = req.body;
        const seedPool = getPool(seedConfig);
        if (!seedPool) return res.status(400).json({ success: false, message: 'Missing database configuration' });
        const client = await seedPool.connect();
        const cols = schema.fields.map((f: any) => `"${f.name}"`).join(', ');
        const values = data.map((row: any) => '(' + schema.fields.map((f: any) => {
          const v = row[f.name];
          if (v === null || v === undefined) return 'NULL';
          if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
          return v;
        }).join(', ') + ')').join(', ');
        await client.query(`INSERT INTO "${schema.tableName}" (${cols}) VALUES ${values}`);
        client.release();
        await seedPool.end();
        return res.json({ success: true, message: 'Data seeded successfully!' });

      case 'status':
      case 'health':
        const healthPool = getPool(req.query);
        if (!healthPool) return res.json({ status: 'ok', database: 'not_configured' });
        await healthPool.query('SELECT NOW()');
        await healthPool.end();
        return res.json({ status: 'ok', database: 'connected', time: new Date() });

      case 'history':
        return res.json([]); 

      case 'generate':
        return res.status(501).json({ message: 'Use local faker engine for performance' });

      default:
        return res.status(404).json({ message: 'Not Found' });
    }
  } catch (error: any) {
    console.error(`[Vercel Function Error] ${endpoint}:`, error.message);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
}