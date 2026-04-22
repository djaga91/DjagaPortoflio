/**
 * SkillIcon — Affiche une icône colorée pour chaque compétence.
 * Priorité : SVG officiel local → Icône Lucide colorée.
 * Ne disparaît JAMAIS (plus de display:none sur erreur).
 */

import React, { useState } from "react";
import * as LucideIcons from "lucide-react";

interface SkillIconProps {
  skillName: string;
  className?: string;
  size?: number;
}

interface SkillConfig {
  icon: keyof typeof LucideIcons;
  color: string;
  svgFile?: string;
}

// ─────────────────────────────────────────────────────────────
// Config des icônes — Ordonné du plus spécifique au plus générique
// Chaque entrée : [ [patterns à chercher dans le nom], config ]
// ─────────────────────────────────────────────────────────────
const SKILL_CONFIGS: Array<[string[], SkillConfig]> = [
  // ── SVG officiels disponibles ──────────────────────────────
  [["python"],              { icon: "Code",        color: "#3776ab", svgFile: "python.svg" }],
  [["docker"],              { icon: "Box",         color: "#0db7ed", svgFile: "docker.svg" }],
  [["kubernetes", "k8s"],   { icon: "Settings2",   color: "#326ce5", svgFile: "kubernetes.svg" }],
  [["sonarqube"],           { icon: "Activity",    color: "#4e9bcd", svgFile: "sonarqube.svg" }],
  [["grype"],               { icon: "ScanLine",    color: "#ef4444", svgFile: "grype.svg" }],
  [["jenkins"],             { icon: "Settings",    color: "#d33833", svgFile: "jenkins.svg" }],
  [["terraform"],           { icon: "Layers",      color: "#7b42bc", svgFile: "terraform.svg" }],
  [["gitlab"],              { icon: "GitBranch",   color: "#fc6d26", svgFile: "gitlab.svg" }],
  [["ansible"],             { icon: "Terminal",    color: "#e00", svgFile: "ansible.svg" }],
  [["linux"],               { icon: "Terminal",    color: "#f9c642", svgFile: "linux.svg" }],

  // ── AWS / Azure : SVG + couleurs brand ────────────────────
  [["amazon web services", "aws"],  { icon: "Cloud",  color: "#ff9900", svgFile: "aws.svg" }],
  [["microsoft azure", "azure"],    { icon: "Cloud",  color: "#0078d4", svgFile: "azure.svg" }],

  // ── Concept & Domaines ─────────────────────────────────────
  [["cybersécurité", "cybersecurite", "cybersecurity"],        { icon: "Shield",      color: "#ef4444", svgFile: "cyber-security.svg" }],
  [["devsecops"],                                               { icon: "GitMerge",    color: "#f97316", svgFile: "devsecops.svg" }],
  [["gouvernance", "governance", "grc", "conformit"],           { icon: "ShieldCheck", color: "#22c55e", svgFile: "grc.svg" }],
  [["intelligence artificielle", "artificial intelligence"],    { icon: "Brain",       color: "#a855f7", svgFile: "ia.svg" }],
  [["analyse de données", "data analysis", "statistique", "calcul numérique", "numerical"], { icon: "BarChart2", color: "#14b8a6" }],
  [["réseau", "network", "vlan", "subnet"],                    { icon: "Network",     color: "#3b82f6", svgFile: "network.svg" }],
  [["asset management"],                                        { icon: "Database",    color: "#06b6d4", svgFile: "asset-management.svg" }],
  [["iso 27001", "iso27001"],                                   { icon: "FileCheck",   color: "#22c55e" }],

  // ── Langages & Scripts ─────────────────────────────────────
  [["bash", "shell"],           { icon: "Terminal",   color: "#4ade80", svgFile: "bash.svg" }],
  [["yaml"],                    { icon: "FileCode",   color: "#f59e0b", svgFile: "yaml.svg" }],
  [["prompt engineering"],      { icon: "Sparkles",   color: "#a855f7" }],

  // ── Cloud & DevOps (spécifiques) ──────────────────────────
  [["hyperviseur", "hypervisor", "vmware", "virtualbox", "vm &"], { icon: "Monitor",  color: "#10b981" }],
  [["malware", "sandbox"],                                          { icon: "Microscope", color: "#dc2626" }],
  [["depscan"],                                                     { icon: "ScanLine",   color: "#fc6d26" }],
  [["semgrep"],                                                     { icon: "Search",     color: "#f97316" }],
  [["defectdojo"],                                                  { icon: "Bug",        color: "#ef4444" }],

  // ── Business & Opérations ─────────────────────────────────
  [["marketing", "stratégie commerciale", "commercial strategy"],     { icon: "TrendingUp",    color: "#22c55e" }],
  [["vente", "sale", "relation client", "customer relation"],         { icon: "ShoppingBag",   color: "#f97316" }],
  [["financ", "trésorerie", "caisse", "budget"],                      { icon: "Wallet",        color: "#22c55e", svgFile: "finance.svg" }],
  [["logistique", "logistics", "stock", "inventory"],                 { icon: "Package",       color: "#6366f1" }],
  [["contrat", "contract", "rh", " hr ", "ressources humaines", "human resources"], { icon: "FileText", color: "#94a3b8" }],

  // ── Management & Leadership ───────────────────────────────
  [["pack office", "excel", "word"],                              { icon: "FileSpreadsheet", color: "#22c55e" }],
  [["gestion de projet", "project management"],                   { icon: "Briefcase",       color: "#3b82f6", svgFile: "project-management.svg" }],
  [["management d'équipe", "team management", "supervision", "coordination"], { icon: "Users", color: "#6366f1", svgFile: "management.svg" }],
  [["événementiel", "evenementiel", "event planning", "festival"],            { icon: "Calendar", color: "#f97316", svgFile: "event.svg" }],

  // ── Soft Skills ───────────────────────────────────────────
  [["intelligence relationnelle", "interpersonal", "communication efficace"],  { icon: "MessageCircle", color: "#a855f7" }],
  [["aisance relationnelle", "networking", "fédérer", "liens de confiance"],   { icon: "Share2",        color: "#3b82f6" }],
  [["leadership", "autonomi", "décision", "direc"],                            { icon: "Target",        color: "#ef4444" }],
  [["analyse et résolution", "résolution de problèmes", "problem solving", "approche méthodique"], { icon: "Lightbulb", color: "#f59e0b" }],
  [["adaptabilité", "interculturel", "international", "adaptability"],         { icon: "Globe",         color: "#22c55e" }],
  [["rigueur", "rigor", "documentation", "normes", "precision"],               { icon: "CheckSquare",   color: "#3b82f6" }],
  [["vulgarisation", "expliquer", "populariz", "schéma", "guides", "technical communication"], { icon: "BookOpen", color: "#14b8a6" }],

  // ── Génériques ────────────────────────────────────────────
  [["cloud", "infra"],      { icon: "Cloud",     color: "#3b82f6" }],
  [["security", "sécurité"],{ icon: "Shield",    color: "#ef4444" }],
  [["management", "gestion"],{ icon: "Briefcase", color: "#6366f1" }],
  [["data", "donnée"],      { icon: "Database",  color: "#06b6d4" }],
  [["soft skill"],          { icon: "Heart",     color: "#a855f7", svgFile: "soft-skills.svg" }],
];

function getSkillConfig(skillName: string): SkillConfig {
  const n = skillName.toLowerCase().trim();

  // IA / AI : exact word match uniquement pour éviter faux positifs dans "financière", etc.
  const isIA = n === "ia" || n === "ai" || n.startsWith("ia ") || n.startsWith("ai ");
  if (isIA) return { icon: "Brain", color: "#a855f7", svgFile: "ia.svg" };

  for (const [patterns, config] of SKILL_CONFIGS) {
    if (patterns.some((p) => n.includes(p))) {
      return config;
    }
  }

  return { icon: "Code", color: "#64748b" };
}

// ─────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────
export const SkillIcon: React.FC<SkillIconProps> = ({
  skillName,
  className = "",
  size = 22,
}) => {
  const [svgFailed, setSvgFailed] = useState(false);
  const config = getSkillConfig(skillName);

  // ── Rendu partagé (SVG ou Lucide) ────────────────────────
  const renderIcon = () => {
    if (config.svgFile && !svgFailed) {
      return (
        <img
          src={`/icons/skills/${config.svgFile}`}
          alt={skillName}
          style={{ width: size, height: size, objectFit: "contain" }}
          onError={() => setSvgFailed(true)}
        />
      );
    }
    const IconComponent = (LucideIcons as any)[config.icon] || LucideIcons.Code;
    return (
      <IconComponent
        size={size}
        strokeWidth={2}
        style={{ color: config.color }}
      />
    );
  };

  return (
    <div
      className={`flex items-center justify-center ${className} p-2 rounded-xl transition-all duration-300 shadow-sm`}
      style={{ 
        background: `${config.color}25`, // Plus vibrant (15%)
        border: `1px solid ${config.color}40`, // Bordure subtile assortie
      }}
    >
      {renderIcon()}
    </div>
  );
};
