import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  History,
  Search,
  Download,
  Trash2,
  FileJson,
  FileCode,
  Database,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { 
  getGenerationHistory, 
  deleteGenerationRecord, 
  type GenerationRecord 
} from "../lib/storage";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<GenerationRecord[]>([]);

  useEffect(() => {
    setHistory(getGenerationHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteGenerationRecord(id);
    setHistory(getGenerationHistory());
    toast.success("Record deleted");
  };

  const weeklyData = useMemo(() => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const generationsByDay: Record<string, number> = {};
    daysOfWeek.forEach(day => (generationsByDay[day] = 0)); // Initialize all days to 0

    // Filter for records within the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    history.filter(record => new Date(record.timestamp) >= sevenDaysAgo).forEach(record => {
      const date = new Date(record.timestamp);
      const dayIndex = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
      const dayName = daysOfWeek[dayIndex];
      generationsByDay[dayName]++;
    });

    return daysOfWeek.map(day => ({ day, generations: generationsByDay[day] }));
  }, [history]);

  // Derive statistics from real data
  const formatDistribution = useMemo(() => {
    const counts = history.reduce((acc: any, curr) => {
      acc[curr.format] = (acc[curr.format] || 0) + 1;
      return acc;
    }, {});
    return [
      { name: "CSV", value: counts.csv || 0, color: "#8b5cf6" },
      { name: "JSON", value: counts.json || 0, color: "#06b6d4" },
      { name: "SQL", value: counts.sql || 0, color: "#10b981" },
    ].filter(d => d.value > 0);
  }, [history]);

  const filteredHistory = history.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tableName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case "csv":
        return <FileCode className="w-4 h-4" />;
      case "json":
        return <FileJson className="w-4 h-4" />;
      case "sql":
        return <Database className="w-4 h-4" />;
      default:
        return <FileCode className="w-4 h-4" />;
    }
  };

  const getFormatColor = (format: string) => {
    switch (format.toLowerCase()) {
      case "csv":
        return "from-purple-500 to-purple-600";
      case "json":
        return "from-cyan-500 to-cyan-600";
      case "sql":
        return "from-green-500 to-green-600";
      default:
        return "from-slate-500 to-slate-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Generation History</h2>
          <p className="text-slate-400 mt-1">View and manage your data generation history</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Generations</p>
              <p className="text-3xl font-bold text-white">{history.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <History className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Rows</p>
              <p className="text-3xl font-bold text-white">
                {history.reduce((sum, item) => sum + item.rows, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600">
              <Database className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">This Week</p>
              <p className="text-3xl font-bold text-white">
                {weeklyData.reduce((sum, item) => sum + item.generations, 0)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Growth</p>
              <p className="text-3xl font-bold text-white">+24.5%</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart can be updated similarly to use real timestamps */}

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Format Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={formatDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {formatDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            {formatDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-400">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Search and List */}
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Generations</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-10 bg-slate-950/50 border-slate-700"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors group"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${getFormatColor(item.format)}`}>
                  {getFormatIcon(item.format)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">{item.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="font-mono">{item.tableName}</span>
                    <span>•</span>
                    <span>{item.rows.toLocaleString()} rows</span>
                    <span>•</span>
                    <span>{item.size}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-2">
                    {item.format.toUpperCase()}
                  </Badge>
                  <p className="text-xs text-slate-500">{item.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                <Button size="sm" variant="ghost" className="hover:bg-slate-700/50">
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Search className="w-12 h-12 mb-3 opacity-20" />
            <p>No results found</p>
          </div>
        )}
      </Card>
    </div>
  );
}
