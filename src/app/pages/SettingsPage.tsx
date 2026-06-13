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
  FileCode,
  Container,
  Cloud,
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
    sqlitePath: "data/mock.db",
    pgHost: import.meta.env.VITE_PG_HOST || "ep-cool-bread-atdv1bo1-pooler.c-9.us-east-1.aws.neon.tech", // Default to Neon host
    pgPort: import.meta.env.VITE_PG_PORT || "5432",
    pgDatabase: import.meta.env.VITE_PG_DATABASE || "neondb", // Default to Neon database
    pgUser: import.meta.env.VITE_PG_USER || "neondb_owner", // Default to Neon user
    pgPassword: import.meta.env.VITE_PG_PASSWORD || "npg_w1gaoATtI3uj",
    pgSsl: import.meta.env.VITE_PG_SSL !== "true", // Default to true for Neon
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "/api/db", // Vercel Serverless Function endpoint

    aiProvider: "gemini",

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
      await api.testDatabaseConnection({ 
        ...settings, 
        apiBaseUrl: settings.apiBaseUrl,
        dbType: settings.dbType 
      }, controller.signal); 
      setConnectionStatus("success");
      toast.success("Connection successful!");
    } catch (error: any) {
      console.error("[Settings] Connection test failed:", error);
      setConnectionStatus("error");
      let message = error.message;
      
      if (error.name === 'AbortError') {
        message = "Connection timed out. The server took too long to respond (8s).";
      } else if (message.includes("Gateway Unreachable") || message === "Failed to fetch" || error.name === "TypeError") {
        const displayUrl = "/api/db"; // Always display the Vercel function path
        message = `Network Error: Vercel Serverless Function unreachable at ${displayUrl}. Ensure the function is deployed at /api/db/ and healthy.`;
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Database Engine</Label>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-green-400 font-medium tracking-tight">System Ready</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 p-1 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <button
                    onClick={() => setSettings({ ...settings, dbType: "postgresql" })}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200",
                      settings.dbType === "postgresql"
                        ? "bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/10 border border-purple-500/30"
                        : "text-slate-500 hover:text-slate-400 hover:bg-slate-800/50"
                    )}
                  >
                    <Database className="w-4 h-4" />
                    PostgreSQL
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, dbType: "sqlite" })}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200",
                      settings.dbType === "sqlite"
                        ? "bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10 border border-blue-500/30"
                        : "text-slate-500 hover:text-slate-400 hover:bg-slate-800/50"
                    )}
                  >
                    <FileCode className="w-4 h-4" />
                    SQLite
                  </button>
                </div>
                <div className="flex items-center gap-2 px-1">
                  <Globe className="w-3 h-3 text-slate-600" />
                  <p className="text-[10px] text-slate-500 tracking-tight">Proxy Gateway: <span className="text-slate-400 font-mono underline decoration-slate-800 underline-offset-4">{settings.apiBaseUrl}</span></p>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              <div className="flex justify-between items-center">
                 <Badge className={cn(
                    "border-transparent",
                    settings.dbType === 'postgresql' ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                 )}>
                    {settings.dbType === 'postgresql' ? 'Neon / PostgreSQL' : 'Local / SQLite'}
                 </Badge>
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
                        This string is sent to your Vercel Serverless Function for execution.
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

                {settings.dbType === "sqlite" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4"
                  >
                    <Separator className="bg-slate-800" />
                    <div className="space-y-2">
                      <Label htmlFor="sqlitePath">Database File Path</Label>
                      <div className="relative">
                        <FileCode className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <Input
                          id="sqlitePath"
                          value={settings.sqlitePath}
                          onChange={(e) =>
                            setSettings({ ...settings, sqlitePath: e.target.value })
                          }
                          className="bg-slate-950/50 border-slate-700 pl-10 font-mono text-sm"
                          placeholder="e.g., data/storage.db"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

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
                        Browsers cannot talk to PostgreSQL directly due to security sandboxing. 
                        DataForge AI uses a Vercel Serverless Function as a secure bridge.
                      </p>
                      <Button 
                        variant="link" 
                        className="text-purple-400 p-0 h-auto text-xs mt-2 underline"
                        onClick={() => setShowTroubleshooting(true)}
                      >
                        View Serverless Function Guide
                      </Button>
                    </div>
                  </div>
                </div>

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
                          Vercel Serverless Function Setup
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
                        <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                          <p className="text-cyan-400 font-bold mb-1 flex items-center gap-1 text-[10px] uppercase">
                            <Cloud className="w-3 h-3" /> Vercel Serverless Gateway
                          </p>
                          <div className="space-y-1 text-slate-400 leading-relaxed">
                            <p>1. Ensure your Serverless Function is located at <code className="text-cyan-400">api/db/[...path].ts</code> in your project root.</p>
                            <p>2. Configure PostgreSQL credentials as <b className="text-white">Environment Variables</b> in your Vercel project (e.g., <code className="text-cyan-400">PG_HOST</code>, <code className="text-cyan-400">PG_USER</code>, <code className="text-cyan-400">PG_PASSWORD</code>).</p>
                            <p>3. The frontend will automatically call this Vercel Serverless Function over HTTPS.</p>
                            <p>4. Install the <code className="text-cyan-400">pg</code> and <code className="text-cyan-400">@vercel/node</code> packages as dependencies.</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                        undefined,
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
                "bg-blue-500/10 border-blue-500/20"
              )}>
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 mt-0.5 text-blue-400" />
                  <div className="text-sm text-blue-400">
                    <p className="font-medium mb-1">Free Online AI Mode</p>
                    <p className="opacity-80 text-blue-300/80">
                      Using Google Gemini Free Tier. Requires an API key from Google AI Studio. Generous limits for development.
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
