import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Sparkles,
  Download,
  RefreshCw,
  Database,
  FileJson,
  FileCode,
  CheckCircle2,
  Loader2,
  DatabaseZap,
  RefreshCcw,
  Cloud,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import type { Schema } from "../lib/dataGenerator";
import { generateMockData } from "../lib/dataGenerator";
import { api } from "../lib/api";
import { exportToCSV, exportToJSON, exportToSQL, downloadFile } from "../lib/exportUtils";
import { loadFromStorage, STORAGE_KEYS, addGenerationToHistory } from "../lib/storage";
import { cn } from "../components/ui/utils";

export function GeneratorPage() {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [rowCount, setRowCount] = useState(100);
  const [generatedData, setGeneratedData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "sql">("csv");
  const [autoSeed, setAutoSeed] = useState(false);

  useEffect(() => {
    const savedSchema = loadFromStorage<Schema | null>(STORAGE_KEYS.SCHEMA, null);
    setSchema(savedSchema);
    
    if (!savedSchema) {
      const defaultSchema: Schema = {
        tableName: "users",
        fields: [
          { name: "id", type: "UUID", faker: "string.uuid" },
          { name: "full_name", type: "VARCHAR", faker: "person.fullName" },
          { name: "email", type: "VARCHAR", faker: "internet.email" },
          { name: "job_title", type: "VARCHAR", faker: "person.jobTitle" },
          { name: "company", type: "VARCHAR", faker: "company.name" },
          { name: "status", type: "VARCHAR", constraints: { enum: ["Active", "Inactive", "Pending"] } },
        ]
      };
      setSchema(defaultSchema);
      toast.info("Using default 'Users' schema.");
    }
  }, []);

  const handleGenerate = async () => {
    if (!schema) {
      toast.error("Please define a schema first");
      return;
    }

    const settings = loadFromStorage(STORAGE_KEYS.SETTINGS, { aiProvider: "none", ollamaModel: "llama3" });

    setIsGenerating(true);
    setProgress(0);
    setStatusMessage("Initializing engine...");
    setGeneratedData([]);

    const controller = new AbortController();

    try {
      let data: any[] = [];
      let attempts = 0;
      const maxRetries = 3;
      let isValid = false;
      let useFallback = false;
      
      // Auto-fallback if row count is too high for practical LLM generation
      if (settings.aiProvider !== "none" && rowCount > 50) {
        toast.info("Row count high. Using local engine for performance.");
        useFallback = true;
      }

      while (attempts < maxRetries && !isValid) {
        attempts++;
        
        if (settings.aiProvider !== "none" && !useFallback) {
          setStatusMessage(`Attempt ${attempts}: AI Agent generating realistic patterns...`);
          // Simulated progress for AI wait
          const progressInterval = setInterval(() => {
            setProgress(prev => (prev < 90 ? prev + 2 : prev));
          }, 1500);

          try {
            data = await api.generateWithAI(schema, rowCount, settings, controller.signal);
            clearInterval(progressInterval);
          } catch (err) {
            clearInterval(progressInterval);
            throw err;
          }
        } else {
          setStatusMessage(`Attempt ${attempts}: Generating ${rowCount} rows via local Faker...`);
          setProgress(50);
          await new Promise((resolve) => setTimeout(resolve, 100));
          data = await generateMockData(schema, rowCount);
        }

        setStatusMessage(`Attempt ${attempts}: Verifying data integrity via Agent Loop...`);
        
        isValid = data.every(row => {
          return schema.fields.every(field => {
            const value = row[field.name];
            if (field.constraints?.nullable === false && (value === null || value === undefined)) {
              return false;
            }
            if (field.constraints?.enum && field.constraints.enum.length > 0 && !field.constraints.enum.includes(value)) {
              return false;
            }
            if (typeof value === 'number') {
              if (field.constraints?.min !== undefined && value < field.constraints.min) {
                return false;
              }
              if (field.constraints?.max !== undefined && value > field.constraints.max) {
                return false;
              }
            }
            return true;
          });
        });

        if (!isValid && attempts < maxRetries) {
          console.warn(`Validation failed attempt ${attempts}`);
          setStatusMessage(`Self-correcting attempt ${attempts}...`);
        }
      }

      if (!isValid) {
        throw new Error("Self-correction loop failed to validate data.");
      }

      setStatusMessage("Finalizing dataset...");
      setGeneratedData(data);

      const dataSize = (new TextEncoder().encode(JSON.stringify(data)).length / 1024);
      const sizeString = dataSize > 1024 ? `${(dataSize/1024).toFixed(2)} MB` : `${dataSize.toFixed(1)} KB`;

      const record = {
        id: crypto.randomUUID(),
        name: `${schema.tableName} Dataset`,
        tableName: schema.tableName,
        rows: rowCount,
        format: exportFormat,
        timestamp: new Date().toLocaleString(),
        size: sizeString,
      };

      addGenerationToHistory(record);

      setProgress(100);
      setStatusMessage("Generation successful!");
      toast.success(`Generated ${rowCount} rows successfully!`);

      if (autoSeed) {
        await handleSeedToDatabase(data);
      }

      if (settings.notifyOnComplete && settings.discordWebhook) {
        api.sendNotification(settings.discordWebhook, {
          title: "Data Generation Complete",
          message: `Generated ${rowCount} rows for table '${schema.tableName}'`,
          details: record
        }).catch(err => console.error("Webhook failed:", err));
      }
    } catch (error: any) {
      console.error("Generation Error:", error);
      const message = error?.response?.data?.message || error?.message || "Failed to generate data";
      
      let errorMsg = message;
      if (message === "Failed to fetch") {
        errorMsg = window.location.protocol === 'https:' 
          ? "Secure Connection Error: Vercel (HTTPS) cannot reach your HTTP service. Use an HTTPS tunnel." 
          : "Network Error: AI service is unreachable.";
      }
      
      toast.error(errorMsg);
    } finally {
      setTimeout(() => {
        setStatusMessage("");
        setIsGenerating(false);
        setProgress(0);
      }, 500);
    }
  };

  const handleSeedToDatabase = async (dataToSeed?: any[]) => {
    const targetData = dataToSeed || generatedData;
    if (!targetData.length) return;
    setIsSeeding(true);
    try {
      const settings = loadFromStorage(STORAGE_KEYS.SETTINGS, { dbType: "postgresql" });
      await api.seedDatabase(schema!, targetData, settings);
      toast.success(`Successfully saved ${targetData.length} rows to Neon Database!`);
    } catch (error: any) {
      console.error("Seeding Error:", error);
      let message = error.message || "Failed to seed data";
      if (message === "Failed to fetch" || error.name === "TypeError") {
        message = "Network Error: Could not reach the API Gateway. Ensure your backend server is running and configured correctly in Settings.";
      }
      toast.error(`Database Error: ${message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleExport = () => {
    if (!generatedData.length || !schema) {
      toast.error("No data to export");
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;
    
    switch (exportFormat) {
      case "csv":
        content = exportToCSV(generatedData);
        filename = `${schema.tableName}.csv`;
        mimeType = "text/csv";
        break;
      case "json":
        content = exportToJSON(generatedData);
        filename = `${schema.tableName}.json`;
        mimeType = "application/json";
        break;
      case "sql":
        content = exportToSQL(generatedData, schema);
        filename = `${schema.tableName}.sql`;
        mimeType = "text/sql";
        break;
    }

    downloadFile(content, filename, mimeType);
    toast.success(`Exported ${generatedData.length} rows as ${exportFormat.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Data Generator</h2>
          <p className="text-slate-400 mt-1">
            Generate realistic mock data with AI-powered faker
          </p>
        </div>
        {generatedData.length > 0 && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/20 px-4 py-2">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {generatedData.length} rows generated
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            Configuration
          </h3>

          <div className="space-y-6">
            {schema && (
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">Table</span>
                  <Badge variant="outline" className="font-mono">
                    {schema.tableName}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Fields</span>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/20">
                    {schema.fields.length}
                  </Badge>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Number of Rows</Label>
                <Badge variant="secondary">{rowCount.toLocaleString()}</Badge>
              </div>
              <Slider
                value={[rowCount]}
                onValueChange={(value) => setRowCount(value[0])}
                min={10}
                max={10000}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>10</span>
                <span>10,000</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Quick Presets</Label>
              <div className="grid grid-cols-3 gap-2">
                {[100, 1000, 5000].map((count) => (
                  <Button
                    key={count}
                    variant="outline"
                    size="sm"
                    onClick={() => setRowCount(count)}
                    className="border-slate-700 hover:bg-slate-800/50"
                  >
                    {count.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="bg-slate-800" />

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Direct to Database</p>
                    <p className="text-[10px] text-slate-500">Auto-save after generation</p>
                  </div>
                </div>
                <Switch 
                  checked={autoSeed}
                  onCheckedChange={setAutoSeed}
                />
              </div>

              {autoSeed && (
                <div className="flex items-center gap-2 px-1">
                  <ShieldCheck className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-slate-400 italic">
                    Target: {loadFromStorage(STORAGE_KEYS.SETTINGS, {}).apiBaseUrl || "Not Set"}
                  </span>
                </div>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !schema}
              className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Data
                </>
              )}
            </Button>

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-semibold">
                  <span className="text-cyan-400">{statusMessage}</span>
                  <span className="text-slate-500">{Math.round(progress)}%</span>
                </div>
              </motion.div>
            )}

          </div>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileJson className="w-5 h-5 text-cyan-400" />
                Data Preview
              </h3>
              {generatedData.length > 0 && (
                 <Tabs value={exportFormat} onValueChange={(v) => setExportFormat(v as any)} className="w-48">
                    <TabsList className="grid grid-cols-3 bg-slate-800/50 h-8">
                      <TabsTrigger value="csv" className="text-[10px]">CSV</TabsTrigger>
                      <TabsTrigger value="json" className="text-[10px]">JSON</TabsTrigger>
                      <TabsTrigger value="sql" className="text-[10px]">SQL</TabsTrigger>
                    </TabsList>
                 </Tabs>
              )}
            </div>
            <div className="flex items-center gap-2">
              {generatedData.length > 0 && (
                <>
                  <Button
                    onClick={handleExport}
                    variant="outline"
                    size="sm"
                    className="border-slate-700 hover:bg-slate-800/50 h-8 text-xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Export
                  </Button>
                  <Button
                    onClick={handleSeedToDatabase}
                    disabled={isSeeding}
                    size="sm"
                    className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 h-8 text-xs"
                  >
                    {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DatabaseZap className="w-3.5 h-3.5 mr-1.5" />}
                    Seed DB
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating || !schema}
                className="hover:bg-slate-800/50 h-8 text-xs"
              >
                <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", isGenerating && "animate-spin")} />
                {generatedData.length > 0 ? "Regenerate" : "Generate"}
              </Button>
            </div>
          </div>

          {generatedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[500px] text-slate-500">
              <Database className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg mb-2">No data generated yet</p>
              <p className="text-sm">Click "Generate Data" to create mock data</p>
            </div>
          ) : (
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <div className="max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader className="bg-slate-950/50 sticky top-0 z-10">
                    <TableRow>
                      {schema?.fields.map((field) => (
                        <TableHead key={field.name} className="text-slate-300 font-semibold">
                          {field.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedData.slice(0, 50).map((row, rowIndex) => (
                      <TableRow key={rowIndex} className="hover:bg-slate-800/30">
                        {schema?.fields.map((field) => (
                          <TableCell
                            key={field.name}
                            className="font-mono text-sm text-slate-400"
                          >
                            {row[field.name] === null ? (
                              <span className="text-slate-600 italic">null</span>
                            ) : (
                              String(row[field.name])
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {generatedData.length > 50 && (
                <div className="bg-slate-950/50 p-3 text-center border-t border-slate-800">
                  <p className="text-sm text-slate-400">
                    Showing 50 of {generatedData.length} rows
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
