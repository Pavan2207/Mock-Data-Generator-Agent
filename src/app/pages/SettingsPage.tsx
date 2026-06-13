import { useState } from "react";
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
    dbType: "sqlite",
    sqlitePath: "data/online_store.db",
    pgHost: "localhost",
    pgPort: "5432",
    pgDatabase: "mockdata",
    pgUser: "postgres",
    pgPassword: "",
    apiBaseUrl: "http://localhost:3000",

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

  const handleSave = () => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    toast.success("Settings saved successfully!");
  };

  const testConnection = async () => {
    if (!settings.apiBaseUrl) {
      toast.error("Please provide a Backend API Gateway URL.");
      return;
    }

    if (settings.dbType === "sqlite" && !settings.sqlitePath) {
      toast.error("Please provide a path for the SQLite database.");
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
      let message = error?.response?.data?.message || error?.message || "Connection failed.";
      
      if (error.name === 'AbortError') {
        message = "Connection timed out. The server took too long to respond (8s).";
      } else if (message === "Failed to fetch" || error.name === "TypeError") {
        message = `Network Error: Unable to reach the API Gateway at ${settings.apiBaseUrl}. Ensure the backend service is running and CORS is enabled.`;
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
              { icon: Database, label: "Database", count: 6 },
              { icon: Sparkles, label: "AI Models", count: 2 },
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
                      setSettings({ ...settings, apiBaseUrl: e.target.value })
                    }
                    placeholder="http://localhost:3000"
                    className="bg-slate-950/50 border-slate-700"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-slate-700 h-9 px-4"
                    onClick={async () => {
                      const controller = new AbortController();
                      const timeoutId = setTimeout(() => controller.abort(), 5000);
                      const status = await api.checkAiStatus("gateway", settings.apiBaseUrl, undefined, controller.signal);
                      clearTimeout(timeoutId);
                      if (status) {
                        toast.success("Backend API Gateway is reachable!");
                      } else {
                        toast.error("Gateway unreachable. Ensure your backend server is running and CORS is enabled.");
                      }
                    }}
                  >
                    Test Gateway
                  </Button>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  The target server for real SQL execution and seeding
                </p>
              </div>

              <Separator className="bg-slate-800" />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dbType">Database Type</Label>
                  <select
                    id="dbType"
                    value={settings.dbType}
                    onChange={(e) => setSettings({ ...settings, dbType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/50 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
                  >
                    <option value="sqlite">SQLite</option>
                    <option value="postgresql">PostgreSQL</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={testConnection}
                    disabled={isConnecting}
                    variant="outline"
                    className="w-full border-slate-700"
                  >
                    {isConnecting ? (
                      <>Testing...</>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {settings.dbType === "sqlite" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4"
                >
                  <Separator className="bg-slate-800" />
                  <div className="space-y-2">
                    <Label htmlFor="sqlitePath">SQLite Database File Path</Label>
                    <Input
                      id="sqlitePath"
                      value={settings.sqlitePath}
                      onChange={(e) => setSettings({ ...settings, sqlitePath: e.target.value })}
                      className="bg-slate-950/50 border-slate-700 font-mono"
                      placeholder="e.g., data/online_store.db"
                    />
                    <p className="text-[10px] text-slate-400 italic">
                      Important: Enter a file path (e.g. data/db.sqlite), not a code snippet like sqlite3.connect().
                    </p>
                  </div>
                </motion.div>
              )}

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
                    <p className="font-medium mb-1">Production SQL Mode</p>
                    <p className="text-purple-300/80">
                      Connections are established via the API Gateway. Ensure your 
                      {settings.dbType === "postgresql" ? " Docker container or PostgreSQL instance " : ` SQLite database at "${settings.sqlitePath}" `} 
                      is reachable from the backend.
                    </p>
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
