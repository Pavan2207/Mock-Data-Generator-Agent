import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Shared connection pool logic
const getPool = (c: any) => {
  // Prioritize environment variables for Vercel deployment
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
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.query.path as string[];
  const endpoint = path.join('/'); // e.g., 'db/test', 'db/query'

  console.log(`[Vercel Function] Received ${req.method} request for /api/db/${endpoint}`);

  try {
    switch (endpoint) {
      case 'test':
        if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
        const testConfig = req.body;
        const testPool = getPool(testConfig);
        if (!testPool) return res.status(400).json({ success: false, message: 'Missing database configuration' });
        try {
          const r = await testPool.query('SELECT NOW()');
          await testPool.end();
          return res.json({ success: true, message: 'Connected successfully!', time: r.rows[0].now });
        } catch (e: any) {
          console.error('[Vercel Function] DB Test Error:', e.message);
          return res.status(500).json({ success: false, message: e.message });
        }

      case 'query':
        if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
        const queryConfig = req.body.config;
        const queryPool = getPool(queryConfig);
        if (!queryPool) return res.status(400).json({ success: false, message: 'Missing database configuration' });
        try {
          const result = await queryPool.query(req.body.sql);
          await queryPool.end();
          return res.json({ success: true, rows: result.rows, rowCount: result.rowCount });
        } catch (e: any) {
          console.error('[Vercel Function] DB Query Error:', e.message);
          return res.status(500).json({ success: false, message: e.message });
        }

      case 'seed':
        if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
        const { schema, data, config: seedConfig } = req.body;
        if (!schema || !data) return res.status(400).json({ success: false, message: 'Missing schema or data' });
        const seedPool = getPool(seedConfig);
        if (!seedPool) return res.status(400).json({ success: false, message: 'Missing database configuration' });
        try {
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
        } catch (e: any) {
          console.error('[Vercel Function] DB Seed Error:', e.message);
          return res.status(500).json({ success: false, message: e.message });
        }

      case 'status': // This is for /api/db/status
      case 'health': // This is for /api/db/health
        if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });
        const healthConfig = req.query; // Use query params for health check if needed
        const healthPool = getPool(healthConfig);
        if (!healthPool) return res.json({ status: 'ok', database: 'not_configured', message: 'Gateway Operational (DB not configured)' });
        try {
          await healthPool.query('SELECT NOW()');
          await healthPool.end();
          return res.json({ status: 'ok', database: 'connected', time: new Date(), message: 'Gateway Operational & DB Connected' });
        } catch (e: any) {
          console.error('[Vercel Function] Health Check DB Error:', e.message);
          return res.status(500).json({ status: 'error', database: 'disconnected', message: e.message });
        }

      // History endpoints (in-memory for now, but could be connected to a real DB)
      case 'history':
        if (req.method === 'GET') {
          // In a real app, fetch from a persistent store
          return res.json([]); // Return empty for now
        } else if (req.method === 'POST') {
          // In a real app, save to a persistent store
          console.log('[Vercel Function] History saved (in-memory only):', req.body);
          return res.json({ success: true });
        }
        return res.status(405).json({ message: 'Method Not Allowed' });

      default:
        return res.status(404).json({ message: 'Not Found' });
    }
  } catch (error: any) {
    console.error('[Vercel Function] Unhandled error:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
}