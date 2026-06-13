import { Outlet, Link, useLocation } from "react-router";
import { motion } from "motion/react";
import {
  Database,
  FileCode,
  Sparkles,
  History,
  Settings,
  Users,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useTheme } from "next-themes";

const navItems = [
  { path: "/", label: "Dashboard", icon: Database },
  { path: "/schema", label: "Schema Editor", icon: FileCode },
  { path: "/generate", label: "Generate", icon: Sparkles },
  { path: "/history", label: "History", icon: History },
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/teams", label: "Teams", icon: Users },
];

export function RootLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative flex h-screen">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 280 : 80 }}
          className="relative bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col"
        >
          {/* Logo */}
          <div className="p-6 border-b border-slate-800/50">
            <motion.div
              className="flex items-center gap-3"
              animate={{ justifyContent: sidebarOpen ? "flex-start" : "center" }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg blur-md opacity-50" />
                <div className="relative bg-gradient-to-r from-purple-500 to-cyan-500 p-2 rounded-lg">
                  <Database className="w-6 h-6 text-white" />
                </div>
              </div>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col"
                >
                  <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    DataForge AI
                  </span>
                  <span className="text-xs text-slate-400">Mock Data Generator</span>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg"
                      />
                    )}
                    <Icon className="w-5 h-5 relative z-10" />
                    {sidebarOpen && (
                      <span className="relative z-10 font-medium">{item.label}</span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Toggle Sidebar */}
          <div className="p-4 border-t border-slate-800/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full justify-center hover:bg-slate-800/50"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-slate-900/30 backdrop-blur-xl border-b border-slate-800/50 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {navItems.find((item) => item.path === location.pathname)?.label ||
                    "Dashboard"}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  AI-powered realistic test data generation
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="border-slate-700 hover:bg-slate-800/50"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </Button>
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">AI Ready</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-8">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
