import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  Settings,
  Database,
  Sparkles,
  Key,
  Globe,
  Bell,
  Shield,
  Save,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Container,
  Info,
  X,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from "../lib/storage";
import { cn } from "../components/ui/utils";
import { api } from "../lib/api";

export function SettingsPage() {
  const defaultSettings = {
    dbType: "postgresql",
    pgHost: "localhost",
    pgPort: "5432",
    pgDatabase: "mock",
    pgUser: "postgres",
    pgPassword: "StrongPassword123",
    pgSsl: true, // Default to true for cloud providers like Neon
    apiBaseUrl: "http://16.171.39.63:3000",

    aiProvider: "gemini",
    ollamaUrl: "http://localhost:11434",
    ollamaModel: "llama3",

    geminiKey: "",
    geminiModel: "gemini-3.5-flash",

    publicApiEnabled: true,
    apiKey: "sk_test_1234567890abcdef",

    defaultFormat: "csv",
    includeHeaders: true,
    timestampFormat: "ISO",

    notifyOnComplete: true,
    notifyOnError: true,
    discordWebhook: "",
  };

  const [settings, setSettings] = useState(() => loadFromStorage(STORAGE_KEYS.SETTINGS, defaultSettings));
  const [activeTab, setActiveTab] = useState("Database");

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [apiBaseUrlWarning, setApiBaseUrlWarning] = useState<string | null>(null);

  useEffect(() => {
    if (settings.apiBaseUrl.endsWith('/health')) {
      setApiBaseUrlWarning("The API Gateway URL should not end with '/health'. Please remove it.");
    } else {
      setApiBaseUrlWarning(null);
    }
  }, [settings.apiBaseUrl]);

  const handleSave = () => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    toast.success("Settings saved successfully!");
  };

  const testConnection = async () => {
    if (!settings.apiBaseUrl) {
      toast.error("Please provide a Backend API Gateway URL.");
      return;
    }

    if (settings.dbType === "postgresql" && (!settings.pgHost || !settings.pgPort || !settings.pgDatabase)) {
      toast.error("Please fill in all required PostgreSQL fields.");
      return;
    }

    setIsConnecting(true);
    setConnectionStatus("idle");
    setConnectionError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      await api.testDatabaseConnection(settings, controller.signal);
      setConnectionStatus("success");
      toast.success("Connection successful!");
    } catch (error: any) {
      console.error("[Settings] Connection test failed:", error);
      setConnectionStatus("error");
      let message = error.message;
      
      if (error.name === 'AbortError') {
        message = "Connection timed out. The server took too long to respond (8s).";
      } else if (message === "Failed to fetch" || error.name === "TypeError") {
        const isLocalhost = settings.apiBaseUrl.includes('localhost');
        message = `Network Error: Gateway unreachable at ${settings.apiBaseUrl}. ${
          isLocalhost 
            ? "Tip: If your database is on EC2, replace 'localhost' with your EC2 Public IP." 
            : "Check if the Node.js process is running and Port 3000 is open in AWS Security Groups."
        }`;
      }
      
      setConnectionError(message);
      toast.error(message);
    } finally {
      clearTimeout(timeoutId);
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 mt-1">Configure your data generation environment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6 h-fit">
          <nav className="space-y-2">
            {[
              { icon: Database, label: "Database", count: 5 },
              { icon: Sparkles, label: "AI Models", count: 1 },
              { icon: Key, label: "API Keys", count: 2 },
              { icon: Globe, label: "Export", count: 3 },
              { icon: Bell, label: "Notifications", count: 3 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left border",
                    activeTab === item.label 
                      ? "bg-purple-500/10 border-purple-500/30 text-white" 
                      : "border-transparent hover:bg-slate-800/50 text-slate-400"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-purple-400" />
                    <span className="text-white">{item.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {item.count}
                  </Badge>
                </button>
              );
            })}
          </nav>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className={cn("bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6", activeTab !== "Database" && "hidden")}>
            <div className="flex items-center gap-2 mb-6">
              <Database className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Database Configuration</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="apiBaseUrl">Backend API Gateway</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiBaseUrl"
                    value={settings.apiBaseUrl}
                    onChange={(e) =>
                      setSettings({ 
                        ...settings, 
                        apiBaseUrl: e.target.value
                          .trim()
                          .replace(/[.,;/\s]+$/, "") 
                          .replace(/\/health$/, "") 
                      }) 
                    }
                    placeholder="http://localhost:3000"
                    className={cn(
                      "bg-slate-950/50 border-slate-700",
                      settings.apiBaseUrl.includes('localhost') && "border-yellow-500/30",
                      apiBaseUrlWarning && "border-red-500/30" // Highlight if there's a warning
                    )}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-slate-700 h-9 px-4"
                    onClick={async () => {
                      const controller = new AbortController();
                      const timeoutId = setTimeout(() => controller.abort(), 5000);
                      const data = await api.checkAiStatus("gateway", settings.apiBaseUrl, undefined, controller.signal);
                      clearTimeout(timeoutId);
                      
                      if (data && data.status === 'ok') {
                        if (data.database === 'connected') {
                          toast.success("Gateway Reachable & Database Connected!");
                        } else {
                          toast.success("Gateway Reachable (Database pending config)");
                        }
                      } else {
                        const msg = settings.apiBaseUrl.includes('localhost')
                          ? "Gateway unreachable. If using EC2, use the Public IP instead of 'localhost'."
                          : "Gateway unreachable. Ensure your backend server is running and Port 3000 is open.";
                        toast.error(msg);
                      }
                    }}
                  >
                    Test Gateway
                  </Button>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  The target server for real SQL execution and seeding
                </p>
                {apiBaseUrlWarning && (
                  <div className="flex items-center gap-1 text-red-400 text-xs mt-1">
                    <AlertCircle className="w-3 h-3" /> {apiBaseUrlWarning}
                  </div>
                )}
              </div>

              <Separator className="bg-slate-800" />

              <div className="flex justify-between items-center">
                 <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">PostgreSQL (Cloud & Docker)</Badge>
                 <Button
                    onClick={testConnection}
                    disabled={isConnecting}
                    variant="outline"
                    className="border-slate-700"
                  >
                    {isConnecting ? "Testing..." : <><Shield className="w-4 h-4 mr-2" /> Test Connection</>}
                  </Button>
              </div>

              {settings.dbType === "postgresql" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4"
                >
                  <Separator className="bg-slate-800" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pgHost">Host</Label>
                      <Input
                        id="pgHost"
                        value={settings.pgHost}
                        onChange={(e) =>
                          setSettings({ ...settings, pgHost: e.target.value })
                        }
                        className="bg-slate-950/50 border-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pgPort">Port</Label>
                      <Input
                        id="pgPort"
                        value={settings.pgPort}
                        onChange={(e) =>
                          setSettings({ ...settings, pgPort: e.target.value })
                        }
                        className="bg-slate-950/50 border-slate-700"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pgDatabase">Database Name</Label>
                    <Input
                      id="pgDatabase"
                      value={settings.pgDatabase}
                      onChange={(e) =>
                        setSettings({ ...settings, pgDatabase: e.target.value })
                      }
                      className="bg-slate-950/50 border-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pgUser">User</Label>
                      <Input
                        id="pgUser"
                        value={settings.pgUser}
                        onChange={(e) =>
                          setSettings({ ...settings, pgUser: e.target.value })
                        }
                        className="bg-slate-950/50 border-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pgPassword">Password</Label>
                      <Input
                        id="pgPassword"
                        type="password"
                        value={settings.pgPassword}
                        onChange={(e) =>
                          setSettings({ ...settings, pgPassword: e.target.value })
                        }
                        className="bg-slate-950/50 border-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500 uppercase tracking-wider">Internal Connection String Preview</Label>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-[10px] text-slate-400 break-all">
                      postgresql://{settings.pgUser}:****@{settings.pgHost}:{settings.pgPort}/{settings.pgDatabase}{settings.pgSsl ? '?sslmode=require' : ''}
                    </div>
                    <p className="text-[10px] text-slate-500 italic">
                      This string is sent to your local API Gateway for execution.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Enable SSL</p>
                      <p className="text-sm text-slate-400">
                        Required for cloud databases like Neon.
                      </p>
                    </div>
                    <Switch
                      checked={settings.pgSsl}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, pgSsl: checked })
                      }
                    />
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {showTroubleshooting && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4 text-xs overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-wider">
                        <Terminal className="w-3.5 h-3.5" />
                        PostgreSQL Gateway Guide
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 hover:bg-slate-800"
                        onClick={() => setShowTroubleshooting(false)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-slate-300 font-semibold mb-1 flex items-center gap-1">
                          <Info className="w-3 h-3" /> 1. Create Gateway File
                        </p>
                        <p className="text-slate-500 mb-2">Save this as <code className="text-purple-400">gateway.js</code> and run <code className="text-cyan-400">node gateway.js</code></p>
                        <div className="relative group">
                          <pre className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-400 font-mono text-[9px] overflow-x-auto max-h-48">
{`const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();

app.use(cors()); 
app.use(express.json());

// Request Logging for easier debugging
app.use((req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
  next();
});

// Shared connection pool logic
const getPool = (c) => {
  if (!c || !c.pgHost) return null;
  return new Pool({
  host: c.pgHost, port: c.pgPort, user: c.pgUser,
  password: c.pgPassword, database: c.pgDatabase,
  ssl: c.pgSsl ? { rejectUnauthorized: false } : false
  });
};

// Test database connection (supports both prefixed and non-prefixed routes)
app.post(['/api/db/test', '/db/test'], async (req, res) => {
  try {
    const p = getPool(req.body);
    if (!p) return res.status(400).json({ success: false, message: 'Missing database configuration' });
    const r = await p.query('SELECT NOW()'); 
    await p.end();
    res.json({ success: true, message: 'Connected successfully!', time: r.rows[0].now });
  } catch (e) {
    console.error('[Gateway] DB Test Error:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// Execute raw SQL
app.post(['/api/db/query', '/db/query'], async (req, res) => {
  const p = getPool(req.body.config);
  try { 
    const result = await p.query(req.body.sql); 
    res.json({ success: true, rows: result.rows, rowCount: result.rowCount }); 
  }
  catch (e) { res.status(500).json({ message: e.message }); } finally { await p.end(); }
});

// In-memory history store (for demo purposes)
let generationHistory = [];

// Seed data into table
app.post(['/api/db/seed', '/db/seed'], async (req, res) => {
  const { schema, data, config } = req.body;
  if (!schema || !data) return res.status(400).json({ message: 'Missing schema or data' });
  
  const p = getPool(config);
  if (!p) return res.status(400).json({ message: 'Invalid config' });
  try {
    const client = await p.connect();
    const cols = schema.fields.map(f => '"' + f.name + '"').join(', ');
    const values = data.map(row => '(' + schema.fields.map(f => {
      const v = row[f.name];
      if (v === null || v === undefined) return 'NULL';
      if (typeof v === 'string') return "'" + v.replace(/'/g, "''") + "'";
      return v;
    }).join(', ') + ')').join(', ');
    await client.query(\`INSERT INTO "\${schema.tableName}" (\${cols}) VALUES \${values}\`);
    client.release();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); } finally { await p.end(); }
});

// History Endpoints
app.get(['/api/history', '/history'], (req, res) => res.json(generationHistory));
app.post(['/api/history', '/history'], (req, res) => {
  generationHistory.unshift(req.body);
  if (generationHistory.length > 50) generationHistory = generationHistory.slice(0, 50);
  res.json({ success: true });
});

// Server-side Generation Mock
app.post(['/api/generate', '/generate'], (req, res) => res.status(501).json({ message: 'Use local faker engine for performance' }));

// Simple status check for the gateway itself
app.get(['/api/db/status', '/db/status'], (req, res) => res.json({ status: 'ok', message: 'Gateway Operational' }));

app.get('/health', async (req, res) => { 
  const p = getPool(req.query); 
  if (!p) return res.json({ status: 'ok', database: 'not_configured' });
  try {
    await p.query('SELECT NOW()');
    res.json({ status: 'ok', database: 'connected', time: new Date() });
  } catch (e) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: e.message });
  } finally {
    if (p) await p.end();
  }
});

app.get(['/api/ai/status', '/ai/status'], (req, res) => res.json({ status: 'ok', message: 'Gateway operational' })); 

// Catch-all for undefined routes
app.use((req, res) => {
  console.warn(\`[Gateway] 404 - Not Found: \${req.method} \${req.url}\`);
  res.status(404).json({ status: 'error', message: 'Route not found on gateway' });
});

app.listen(3000, '0.0.0.0', () => console.log('Gateway running on port 3000 (Global Access Enabled)'));`}
                          </pre>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-400 font-bold mb-1 flex items-center gap-1 text-[10px] uppercase">
                          <Shield className="w-3 h-3" /> AWS EC2 Deployment
                        </p>
                        <div className="space-y-1 text-slate-400 leading-relaxed">
                          <p>Currently configured for EC2 at <code className="text-cyan-400 font-bold">16.171.39.63</code></p>
                          <p>1. Open AWS Console → Security Groups.</p>
                          <p>2. Add Inbound Rule: <b className="text-white">Custom TCP - Port 3000</b>.</p>
                          <p>3. Set Source to <code className="text-white">0.0.0.0/0</code> or your IP.</p>
                        </div>
                      </div>

                      <div className="pt-2">
                         <p className="text-slate-300 font-semibold mb-1 flex items-center gap-1">
                           <Container className="w-3 h-3" /> 2. Docker Compose Setup (EC2)
                         </p>
                         <p className="text-slate-500 mb-2">Run both DB and Gateway with one command:</p>
                         <pre className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-400 font-mono text-[9px] overflow-x-auto max-h-48">
{`version: '3.8'
services:
  postgres-db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_DB: mock
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: StrongPassword123
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data

  api-gateway:
    image: node:18-alpine
    command: sh -c "npm install express cors pg && node gateway.js"
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    working_dir: /app
volumes:
  pg_data:`}
                         </pre>
                      </div>

                      <div>
                        <p className="text-slate-300 font-semibold mb-1 flex items-center gap-1">
                          <Terminal className="w-3 h-3" /> 2. Test API Gateway
                        </p>
                        <p className="text-slate-500 mb-2">Run this on your EC2 instance to verify connection:</p>
                        <code className="block p-2 bg-slate-900 rounded border border-slate-800 text-cyan-400 font-mono text-[9px]">
                          curl http://localhost:3000/health
                        </code>
                        <p className="text-[9px] text-slate-500 mt-1 italic">Expected: {`{"status":"ok","database":"connected",...}`}</p>
                      </div>

                      <div>
                        <p className="text-slate-300 font-semibold mb-1 flex items-center gap-1">
                          <Save className="w-3 h-3" /> 3. Keep Gateway Running (PM2)
                        </p>
                        <p className="text-slate-500 mb-2">Install PM2 and start your gateway persistently:</p>
                        <code className="block p-2 bg-slate-900 rounded border border-slate-800 text-cyan-400 font-mono text-[9px]">
                          npm install -g pm2<br/>
                          pm2 start gateway.js --name dataforge-gateway<br/>
                          pm2 save<br/>
                          pm2 status
                        </code>
                      </div>

                      <div className="pt-2">
                         <p className="text-slate-500 mb-1 text-[10px]">Install required libraries:</p>
                         <code className="block p-2 bg-slate-900 rounded border border-slate-800 text-slate-400 font-mono text-[10px]">
                           npm install express cors pg
                         </code>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {connectionStatus === "success" && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">Connected successfully!</span>
                </div>
              )}

              {connectionStatus === "error" && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">{connectionError}</span>
                </div>
              )}

              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-purple-400 mt-0.5" />
                  <div className="text-sm text-purple-400">
                    <p className="font-medium mb-1">Production SQL Bridge Required</p>
                    <p className="text-purple-300/80">
                      To connect to Neon or Docker, you <b>must</b> run a local Node.js proxy server. Browsers cannot talk to PostgreSQL directly due to security sandboxing.
                    </p>
                    <Button 
                      variant="link" 
                      className="text-purple-400 p-0 h-auto text-xs mt-2 underline"
                      onClick={() => setShowTroubleshooting(true)}
                    >
                      View Gateway Setup Guide
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className={cn("bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6", activeTab !== "AI Models" && "hidden")}>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">AI Model Configuration</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aiProvider">AI Provider</Label>
                <select
                  id="aiProvider"
                  value={settings.aiProvider}
                  onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none"
                >
                  <option value="ollama">Ollama (Free / Local)</option>
                  <option value="gemini">Google Gemini (Online Free Tier)</option>
                </select>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-slate-700 h-8"
                    onClick={async () => {
                      const controller = new AbortController();
                      const timeoutId = setTimeout(() => controller.abort(), 5000);

                      const status = await api.checkAiStatus(
                        settings.aiProvider, 
                        settings.ollamaUrl,
                        settings.geminiKey,
                        controller.signal
                      );
                      
                      clearTimeout(timeoutId);

                      if (status) {
                        toast.success(`${settings.aiProvider} is reachable!`);
                      } else {
                        toast.error(
                          <div className="space-y-2">
                            <p className="font-semibold">{settings.aiProvider} connection failed.</p>
                            {settings.aiProvider === "ollama" && (
                              <p className="text-[11px] opacity-90">Verify OLLAMA_ORIGINS="*" is set and the service is running.</p>
                            )}
                          </div>,
                          { duration: 6000 }
                        );
                      }
                    }}
                  >
                    Check Service Status
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-slate-400 h-8 hover:bg-slate-800/50"
                    onClick={() => setShowTroubleshooting(true)}
                  >
                    <BookOpen className="w-3 h-3 mr-1.5" />
                    Setup Guide
                  </Button>
                </div>
              </div>

              {settings.aiProvider === "ollama" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ollamaUrl">Ollama URL</Label>
                    <Input
                      id="ollamaUrl"
                      value={settings.ollamaUrl}
                      onChange={(e) =>
                        setSettings({ ...settings, ollamaUrl: e.target.value })
                      }
                      className="bg-slate-950/50 border-slate-700"
                      placeholder="http://localhost:11434"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ollamaModel">Ollama Model</Label>
                    <Input
                      id="ollamaModel"
                      value={settings.ollamaModel}
                      onChange={(e) =>
                        setSettings({ ...settings, ollamaModel: e.target.value })
                      }
                      className="bg-slate-950/50 border-slate-700"
                      placeholder="llama3"
                    />
                  </div>
                </div>
              )}

              {settings.aiProvider === "gemini" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="geminiKey">Gemini API Key</Label>
                    <Input
                      id="geminiKey"
                      type="password"
                      value={settings.geminiKey}
                      onChange={(e) =>
                        setSettings({ ...settings, geminiKey: e.target.value })
                      }
                      className="bg-slate-950/50 border-slate-700"
                      placeholder="Enter Gemini API Key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="geminiModel">Model Name</Label>
                    <Input
                      id="geminiModel"
                      value={settings.geminiModel}
                      onChange={(e) =>
                        setSettings({ ...settings, geminiModel: e.target.value })
                      }
                      className="bg-slate-950/50 border-slate-700"
                      placeholder="gemini-3.5-flash"
                    />
                  </div>
                </div>
              )}

              <div className={cn(
                "p-3 rounded-lg border transition-colors",
                settings.aiProvider === "ollama" 
                  ? "bg-green-500/10 border-green-500/20" 
                  : "bg-blue-500/10 border-blue-500/20"
              )}>
                <div className="flex items-start gap-2">
                  <Sparkles className={cn("w-4 h-4 mt-0.5", settings.aiProvider === "ollama" ? "text-green-400" : "text-blue-400")} />
                  <div className={cn("text-sm", settings.aiProvider === "ollama" ? "text-green-400" : "text-blue-400")}>
                    <p className="font-medium mb-1">
                      {settings.aiProvider === "ollama" ? "Free Local AI Mode" : "Free Online AI Mode"}
                    </p>
                    <p className={cn("opacity-80", settings.aiProvider === "ollama" ? "text-green-300/80" : "text-blue-300/80")}>
                      {settings.aiProvider === "ollama" 
                        ? "Running Ollama locally. No API costs or keys required. Ensure Ollama is running on your machine with 'ollama serve'."
                        : "Using Google Gemini Free Tier. Requires an API key from Google AI Studio. Generous limits for development."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className={cn("bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6", activeTab !== "API Keys" && "hidden")}>
            <div className="flex items-center gap-2 mb-6">
              <Key className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">API & Integrations</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <div>
                  <p className="font-medium text-white">Public API Access</p>
                  <p className="text-sm text-slate-400">Enable REST API endpoints</p>
                </div>
                <Switch
                  checked={settings.publicApiEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, publicApiEnabled: checked })
                  }
                />
              </div>

              {settings.publicApiEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <Label htmlFor="apiKey">Public API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="apiKey"
                      value={settings.apiKey}
                      readOnly
                      className="bg-slate-950/50 border-slate-700 font-mono"
                    />
                    <Button variant="outline" className="border-slate-700">
                      Regenerate
                    </Button>
                  </div>
                </motion.div>
              )}

              <Separator className="bg-slate-800" />

              <div className="space-y-2">
                <Label htmlFor="discordWebhook">Discord Webhook</Label>
                <Input
                  id="discordWebhook"
                  value={settings.discordWebhook}
                  onChange={(e) =>
                    setSettings({ ...settings, discordWebhook: e.target.value })
                  }
                  className="bg-slate-950/50 border-slate-700"
                  placeholder="https://discord.com/api/webhooks/..."
                />
                <p className="text-xs text-slate-500">
                  Receive notifications about data generation in Discord
                </p>
              </div>
            </div>
          </Card>

          <Card className={cn("bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6", activeTab !== "Export" && "hidden")}>
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Export Settings</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultFormat">Default Export Format</Label>
                <select
                  id="defaultFormat"
                  value={settings.defaultFormat}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultFormat: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-700 rounded-lg text-white focus:border-blue-500 outline-none"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="sql">SQL</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <div>
                  <p className="font-medium text-white">Include Headers</p>
                  <p className="text-sm text-slate-400">Add column headers in CSV exports</p>
                </div>
                <Switch
                  checked={settings.includeHeaders}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, includeHeaders: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timestampFormat">Timestamp Format</Label>
                <select
                  id="timestampFormat"
                  value={settings.timestampFormat}
                  onChange={(e) =>
                    setSettings({ ...settings, timestampFormat: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-700 rounded-lg text-white focus:border-blue-500 outline-none"
                >
                  <option value="ISO">ISO 8601</option>
                  <option value="UNIX">Unix Timestamp</option>
                  <option value="US">US Format</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className={cn("bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6", activeTab !== "Notifications" && "hidden")}>
            <div className="flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <div>
                  <p className="font-medium text-white">Notify on Complete</p>
                  <p className="text-sm text-slate-400">Receive alert when data generation finishes</p>
                </div>
                <Switch
                  checked={settings.notifyOnComplete}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, notifyOnComplete: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <div>
                  <p className="font-medium text-white">Notify on Error</p>
                  <p className="text-sm text-slate-400">Receive alert if generation fails</p>
                </div>
                <Switch
                  checked={settings.notifyOnError}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, notifyOnError: checked })
                  }
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save All Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
