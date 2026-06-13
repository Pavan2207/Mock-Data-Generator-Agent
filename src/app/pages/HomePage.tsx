import { Link } from "react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  Database,
  Sparkles,
  TrendingUp,
  Zap,
  Shield,
  Code2,
  FileJson,
  Download,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const stats = [
  { label: "Rows Generated", value: "1.2M+", icon: Database, color: "from-purple-500 to-purple-600" },
  { label: "Schemas Created", value: "350+", icon: Code2, color: "from-cyan-500 to-cyan-600" },
  { label: "Data Exports", value: "5.8K+", icon: Download, color: "from-blue-500 to-blue-600" },
  { label: "AI Accuracy", value: "99.8%", icon: Sparkles, color: "from-green-500 to-green-600" },
];

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description: "Leverage Google Gemini AI to generate contextually relevant, realistic data",
  },
  {
    icon: Shield,
    title: "Schema-Aware",
    description: "Automatically respects constraints, types, and relationships in your schema",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate millions of rows in seconds with optimized algorithms",
  },
  {
    icon: FileJson,
    title: "Multi-Format Export",
    description: "Export to CSV, SQL, JSON, and more with a single click",
  },
];

const chartData = [
  { month: "Jan", generated: 45000 },
  { month: "Feb", generated: 52000 },
  { month: "Mar", generated: 61000 },
  { month: "Apr", generated: 75000 },
  { month: "May", generated: 98000 },
  { month: "Jun", generated: 120000 },
];

const recentActivity = [
  { name: "Users Table", rows: 10000, format: "CSV", time: "2 min ago" },
  { name: "Orders Schema", rows: 25000, format: "SQL", time: "15 min ago" },
  { name: "Products Data", rows: 5000, format: "JSON", time: "1 hour ago" },
  { name: "Customers DB", rows: 8000, format: "CSV", time: "3 hours ago" },
];

export function HomePage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl blur-2xl" />
        <Card className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-slate-700/50 p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-400 font-medium">
                  AI-Powered Data Generation
                </span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Generate Realistic Test Data
                <br />
                in Seconds
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl">
                Transform your schema into production-ready mock data with AI assistance.
                Support for DDL, YAML, and custom formats.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/schema">
                  <Button size="lg" className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600">
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/generate">
                  <Button size="lg" variant="outline" className="border-slate-700 hover:bg-slate-800/50">
                    Quick Generate
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur-xl opacity-20" />
              <div className="relative bg-slate-950/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 w-80">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="generated"
                      stroke="url(#colorGradient)"
                      strokeWidth={3}
                      dot={{ fill: "#8b5cf6", r: 4 }}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-slate-400">Monthly Growth</span>
                  <div className="flex items-center gap-1 text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">+24.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6 h-full hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg border border-purple-500/20">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400">{feature.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div>
                    <p className="font-medium text-white">{activity.name}</p>
                    <p className="text-sm text-slate-400">
                      {activity.rows.toLocaleString()} rows · {activity.format}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Generation Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="generated" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
