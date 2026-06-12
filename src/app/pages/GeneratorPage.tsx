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
} from "lucide-react";
import { toast } from "sonner";
import type { Schema } from "../lib/dataGenerator";
import { generateMockData } from "../lib/dataGenerator";
import { api } from "../lib/api";
import { exportToCSV, exportToJSON, exportToSQL, downloadFile } from "../lib/exportUtils";
import { loadFromStorage, STORAGE_KEYS, addGenerationToHistory } from "../lib/storage";

export function GeneratorPage() {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [rowCount, setRowCount] = useState(100);
  const [generatedData, setGeneratedData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "sql">("csv");

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

    setIsGenerating(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 100);

    try {
      let data: any[];
      const settings = loadFromStorage(STORAGE_KEYS.SETTINGS, { backendEnabled: false });

      if (settings.backendEnabled) {
        // Use real API if explicitly enabled in settings
        data = await api.generateData(schema, rowCount);
      } else {
        // Fallback to local generation
        await new Promise((resolve) => setTimeout(resolve, 500));
        data = await generateMockData(schema, rowCount);
      }

      setGeneratedData(data);

      // Record this generation in history
      addGenerationToHistory({
        id: crypto.randomUUID(),
        name: `${schema.tableName} Dataset`,
        tableName: schema.tableName,
        rows: rowCount,
        format: exportFormat,
        timestamp: new Date().toLocaleString(),
        size: `${(new TextEncoder().encode(JSON.stringify(data)).length / 1024).toFixed(1)} KB`,
      });

      setProgress(100);
      toast.success(`Generated ${rowCount} rows successfully!`);
    } catch (error) {
      console.error("Generation Error:", error);
      toast.error("Failed to generate data");
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 500);
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
      {/* Header */}
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
        {/* Configuration Panel */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            Configuration
          </h3>

          <div className="space-y-6">
            {/* Schema Info */}
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

            {/* Row Count */}
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

            {/* Quick Presets */}
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

            {/* Generate Button */}
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

            {/* Progress */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-slate-400 text-center">{progress}% Complete</p>
              </motion.div>
            )}

            {/* Export Section */}
            {generatedData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 pt-4 border-t border-slate-800"
              >
                <Label className="text-slate-300">Export Format</Label>
                <Tabs value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
                  <TabsList className="grid grid-cols-3 bg-slate-800/50">
                    <TabsTrigger value="csv">CSV</TabsTrigger>
                    <TabsTrigger value="json">JSON</TabsTrigger>
                    <TabsTrigger value="sql">SQL</TabsTrigger>
                  </TabsList>
                </Tabs>

                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="w-full border-slate-700 hover:bg-slate-800/50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export {exportFormat.toUpperCase()}
                </Button>
              </motion.div>
            )}
          </div>
        </Card>

        {/* Data Preview */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileJson className="w-5 h-5 text-cyan-400" />
              Data Preview
            </h3>
            {generatedData.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                className="hover:bg-slate-800/50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            )}
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
