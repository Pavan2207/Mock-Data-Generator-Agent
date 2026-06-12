import { useState } from "react";
import { motion } from "motion/react";
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
} from "lucide-react";
import { toast } from "sonner";
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from "../lib/storage";
import { api } from "../lib/api";

export function SettingsPage() {
  const defaultSettings = {
    // Database Settings
    dbType: "sqlite",
    pgHost: "localhost",
    pgPort: "5432",
    pgDatabase: "mockdata",
    pgUser: "postgres",
    pgPassword: "",
    apiBaseUrl: "http://localhost:3000",

    // AI Settings
    aiProvider: "ollama",
    ollamaUrl: "http://localhost:11434",
    openaiKey: "",

    // API Settings
    publicApiEnabled: true,
    apiKey: "sk_test_1234567890abcdef",

    // Export Settings
    defaultFormat: "csv",
    includeHeaders: true,
    timestampFormat: "ISO",

    // Notifications
    notifyOnComplete: true,
    notifyOnError: true,
    discordWebhook: "",
  };

  const [settings, setSettings] = useState(() => loadFromStorage(STORAGE_KEYS.SETTINGS, defaultSettings));

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSave = () => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    toast.success("Settings saved successfully!");
  };

  const testConnection = async () => {
    setIsConnecting(true);
    setConnectionStatus("idle");

    try {
      await api.testDatabaseConnection(settings);
      setConnectionStatus("success");
      toast.success("Connection successful!");
    } catch (error) {
      setConnectionStatus("error");
      toast.error("Connection failed. Please check your settings.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 mt-1">Configure your data generation environment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6 h-fit">
          <nav className="space-y-2">
            {[
              { icon: Database, label: "Database", count: 6 },
              { icon: Sparkles, label: "AI Models", count: 3 },
              { icon: Key, label: "API Keys", count: 2 },
              { icon: Globe, label: "Export", count: 3 },
              { icon: Bell, label: "Notifications", count: 3 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors text-left"
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

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Database Settings */}
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Database className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Database Configuration</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Database Type</Label>
                  <select
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

              {settings.dbType === "postgresql" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4"
                >
                  <Separator className="bg-slate-800" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Host</Label>
                      <Input
                        value={settings.pgHost}
                        onChange={(e) =>
                          setSettings({ ...settings, pgHost: e.target.value })
                        }
                        className="bg-slate-950/50 border-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Port</Label>
                      <Input
                        value={settings.pgPort}
                        onChange={(e) =>
                          setSettings({ ...settings, pgPort: e.target.value })
                        }
                        className="bg-slate-950/50 border-slate-700"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Database Name</Label>
                    <Input
                      value={settings.pgDatabase}
                      onChange={(e) =>
                        setSettings({ ...settings, pgDatabase: e.target.value })
                      }
                      className="bg-slate-950/50 border-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>User</Label>
                      <Input
                        value={settings.pgUser}
                        onChange={(e) =>
                          setSettings({ ...settings, pgUser: e.target.value })
                        }
                        className="bg-slate-950/50 border-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input
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
                  <span className="text-sm text-red-400">Connection failed. Check your credentials.</span>
                </div>
              )}
            </div>
          </Card>

          {/* AI Settings */}
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">AI Model Configuration</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>AI Provider</Label>
                <select
                  value={settings.aiProvider}
                  onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none"
                >
                  <option value="ollama">Ollama (Local)</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                </select>
              </div>

              {settings.aiProvider === "ollama" && (
                <div className="space-y-2">
                  <Label>Ollama URL</Label>
                  <Input
                    value={settings.ollamaUrl}
                    onChange={(e) =>
                      setSettings({ ...settings, ollamaUrl: e.target.value })
                    }
                    className="bg-slate-950/50 border-slate-700"
                    placeholder="http://localhost:11434"
                  />
                  <p className="text-xs text-slate-500">
                    Make sure Ollama is running locally
                  </p>
                </div>
              )}

              {settings.aiProvider === "openai" && (
                <div className="space-y-2">
                  <Label>OpenAI API Key</Label>
                  <Input
                    type="password"
                    value={settings.openaiKey}
                    onChange={(e) =>
                      setSettings({ ...settings, openaiKey: e.target.value })
                    }
                    className="bg-slate-950/50 border-slate-700"
                    placeholder="sk-..."
                  />
                </div>
              )}

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-400">
                    <p className="font-medium mb-1">Using Free Tier</p>
                    <p className="text-blue-300/80">
                      Currently using Faker.js for data generation. Connect an AI model for more intelligent, context-aware data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* API & Integration Settings */}
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6">
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
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <Input
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
                <Label>Discord Webhook (Optional)</Label>
                <Input
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

          {/* Export Settings */}
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Export Settings</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Default Export Format</Label>
                <select
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
                <Label>Timestamp Format</Label>
                <select
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

          {/* Save Button */}
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
