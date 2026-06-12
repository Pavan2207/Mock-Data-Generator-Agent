import { Link } from "react-router";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="relative">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            404
          </h1>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 blur-3xl opacity-20" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">Page Not Found</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link to="/">
            <Button className="bg-gradient-to-r from-purple-500 to-cyan-500">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
