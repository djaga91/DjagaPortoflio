/**
 * Affiche une icône officielle locale (SVG) pour une compétence/techno.
 * Si le logo local n'est pas disponible, bascule sur une icône Lucide stylisée.
 */

import React from "react";
import * as LucideIcons from "lucide-react";

interface SkillIconProps {
  skillName: string;
  className?: string;
  size?: number;
  showLabel?: boolean;
  useBadge?: boolean;
  isDark?: boolean;
}

/**
 * Mapping des technologies vers leurs fichiers SVG officiels stockés dans /public/icons/skills/
 */
const SKILL_LOGOS: Record<string, string> = {
  // --- Langages & Outils Dev ---
  python: "python.svg",
  bash: "bash.svg",
  shell: "bash.svg",
  yaml: "yaml.svg",
  ansible: "ansible.svg",
  terraform: "terraform.svg",
  jenkins: "jenkins.svg",
  linux: "linux.svg",

  // --- Cloud & DevOps ---
  aws: "aws.svg",
  amazon: "aws.svg",
  azure: "azure.svg",
  docker: "docker.svg",
  kubernetes: "kubernetes.svg",
  k8s: "kubernetes.svg",
  gitlab: "gitlab.svg",

  // --- Outils de sécurité ---
  sonarqube: "sonarqube.svg",
  grype: "grype.svg",
  semgrep: "semgrep.svg",
  defectdojo: "defectdojo.svg",

  // --- Domaines & Concepts (SVGs custom) ---
  devsecops: "devsecops.svg",
  "governance": "grc.svg",
  "gouvernance": "grc.svg",
  grc: "grc.svg",
  "conformité": "grc.svg",
  "conformite": "grc.svg",
  "intelligence artificielle": "ia.svg",
  "artificial intelligence": "ia.svg",
  ia: "ia.svg",
  " ai": "ia.svg",
  cybersecurite: "cyber-security.svg",
  "cybersécurité": "cyber-security.svg",
  cybersecurity: "cyber-security.svg",
  "asset management": "asset-management.svg",
  "gestion financière": "finance.svg",
  "financial management": "finance.svg",
  finance: "finance.svg",
  "réseaux": "network.svg",
  "reseau": "network.svg",
  network: "network.svg",
  "gestion de projet": "project-management.svg",
  "project management": "project-management.svg",
  "management d'équipe": "management.svg",
  "team management": "management.svg",
  "intelligence relationnelle": "soft-skills.svg",
  "interpersonal": "soft-skills.svg",
  événementiel: "event.svg",
  evenementiel: "event.svg",
  "event planning": "event.svg",
};

/**
 * Retourne une icône Lucide appropriée en fallback
 */
function getFallbackIcon(skillName: string): keyof typeof LucideIcons {
  const n = skillName.toLowerCase().trim();

  // Concepts & domaines
  if (n.includes("grc") || n.includes("gouvernance") || n.includes("governance") || n.includes("conformit")) return "ShieldCheck";
  if (n.includes("devsecops")) return "GitMerge";
  if (n.includes("cybersec") || n.includes("sécurité") || n.includes("security")) return "Lock";
  if (n.includes("intelligence artificielle") || n.includes("artificial intelligence") || n === "ia" || n === "ai") return "Brain";
  if (n.includes("réseau") || n.includes("network")) return "Network";
  if (n.includes("asset management")) return "Database";
  if (n.includes("financial") || n.includes("financière") || n.includes("finance")) return "TrendingUp";
  if (n.includes("iso 27001") || n.includes("iso27001")) return "FileCheck";

  // Cloud & DevOps
  if (n.includes("cloud") || n.includes("infra")) return "Cloud";
  if (n.includes("jenkins")) return "Settings";
  if (n.includes("pipeline") || n.includes("ci/cd") || n.includes("cicd")) return "GitBranch";

  // Management & Soft Skills
  if (n.includes("project management") || n.includes("gestion de projet")) return "Briefcase";
  if (n.includes("team management") || n.includes("management d'équipe") || n.includes("management")) return "Users";
  if (n.includes("interpersonal") || n.includes("intelligence relationnelle")) return "Heart";
  if (n.includes("event") || n.includes("événementiel")) return "Calendar";

  // Langages
  if (n.includes("prompt")) return "Sparkles";
  if (n.includes("code") || n.includes("dev")) return "Code";
  if (n.includes("data")) return "Database";
  if (n.includes("team") || n.includes("équipe")) return "Users";

  return "Code";
}

export const SkillIcon: React.FC<SkillIconProps> = ({
  skillName,
  className = "",
  size = 20,
  isDark = true,
}) => {
  const normalized = skillName.toLowerCase().trim();
  
  // 1. Chercher si un logo officiel local existe
  let logoFile = null;
  for (const [key, file] of Object.entries(SKILL_LOGOS)) {
    if (normalized.includes(key)) {
      logoFile = file;
      break;
    }
  }

  if (logoFile) {
    return (
      <div className={`flex items-center justify-center ${className} p-1 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
        <img 
          src={`/icons/skills/${logoFile}`} 
          alt={skillName}
          style={{ width: size, height: size, objectFit: 'contain' }}
          className="transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            // Fallback si l'image ne charge pas (404)
            (e.target as any).parentElement.style.display = 'none';
          }}
        />
      </div>
    );
  }

  // 2. Fallback sur Lucide
  const IconName = getFallbackIcon(skillName);
  const IconComponent = (LucideIcons as any)[IconName] || LucideIcons.Code;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <IconComponent 
        size={size} 
        strokeWidth={2} 
        className={className} 
      />
    </div>
  );
};

