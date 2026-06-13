import { motion } from "motion/react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Users, Mail, Github, Linkedin, ShieldCheck } from "lucide-react";

const teamMembers = [
  { id: "23u41a4236", name: "Malla Hemanjali", role: "Lead Developer" },
  { id: "23U41A0544", name: "Pentakota Charishma", role: "AI Engineer" },
  { id: "23U41A0541", name: "Padala Kuladeep Satya Kishore", role: "Database Architect" },
  { id: "24u45a0419", name: "MADISA THANU SRI", role: "UI/UX Designer" },
];

export function TeamsPage() {
  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-2xl" />
        <div className="relative">
          <h2 className="text-3xl font-bold text-white">Project Team</h2>
          <p className="text-slate-400 mt-2">
            The brilliant minds behind the DataForge AI generation engine.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6 hover:border-indigo-500/50 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                    <Users className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {member.name}
                    </h4>
                    <p className="text-sm text-slate-500 font-mono mt-1">{member.id}</p>
                  </div>
                </div>
                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  {member.role}
                </Badge>
              </div>

              <div className="pt-4 border-t border-slate-800/50 flex gap-4">
                <button className="text-slate-500 hover:text-white transition-colors">
                  <Github className="w-4 h-4" />
                </button>
                <button className="text-slate-500 hover:text-white transition-colors">
                  <Linkedin className="w-4 h-4" />
                </button>
                <button className="text-slate-500 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/10 p-8 text-center">
        <h3 className="text-white font-medium mb-2">Academic Project 2026</h3>
        <p className="text-slate-500 text-sm">
          DataForge AI was developed as a collaborative effort to simplify realistic mock data generation for engineering teams.
        </p>
      </Card>
    </div>
  );
}