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
  python: "python.svg",
  aws: "aws.svg",
  amazon: "aws.svg",
  azure: "azure.svg",
  docker: "docker.svg",
  kubernetes: "kubernetes.svg",
  k8s: "kubernetes.svg",
  gitlab: "gitlab.svg",
  bash: "bash.svg",
  shell: "bash.svg",
  sonarqube: "sonarqube.svg",
  yaml: "yaml.svg",
  ansible: "ansible.svg",
  terraform: "terraform.svg",
  jenkins: "jenkins.svg",
  linux: "linux.svg",
  grype: "grype.svg",
  // Concepts & Gouvernance (Vrais logos/symboles créés)
  "devsecops": "devsecops.svg",
  "gouvernance": "grc.svg",
  "grc": "grc.svg",
  "conformité": "grc.svg",
  "intelligence artificielle": "ia.svg",
  "ia": "ia.svg",
  "cybersecurite": "cyber-security.svg",
  "cybersécurité": "cyber-security.svg",
  "asset management": "asset-management.svg",
  "gestion financière": "finance.svg",
  "finance": "finance.svg",
  "réseaux": "network.svg",
  "network": "network.svg",
  "gestion de projet": "project-management.svg",
  "management d'équipe": "management.svg",
  "intelligence relationnelle": "soft-skills.svg",
  "événementiel": "event.svg",
  "evenementiel": "event.svg",
};

/**
 * Retourne une icône Lucide appropriée en fallback
 */
function getFallbackIcon(skillName: string): keyof typeof LucideIcons {
  const normalized = skillName.toLowerCase().trim();

  // Spécifiques (pour garantir l'unicité)
  if (normalized.includes("gouvernance") || normalized.includes("grc")) return "ShieldCheck";
  if (normalized.includes("devsecops") || normalized.includes("analyse")) return "Activity";
  if (normalized.includes("cybersécurité") || normalized.includes("cybersecurite")) return "Lock";
  if (normalized.includes("intelligence artificielle") || normalized.includes("(ia)")) return "Brain";
  if (normalized.includes("réseaux") || normalized.includes("network")) return "Network";
  if (normalized.includes("asset management")) return "Database";
  if (normalized.includes("gestion financière")) return "PieChart";
  if (normalized.includes("gestion de projet")) return "Briefcase";
  if (normalized.includes("management d'équipe")) return "Users";
  if (normalized.includes("intelligence relationnelle")) return "Heart";
  if (normalized.includes("événementiel") || normalized.includes("evenementiel")) return "Calendar";

  // Génériques
  if (normalized.includes("security") || normalized.includes("sécurité")) return "Shield";
  if (normalized.includes("management") || normalized.includes("gestion")) return "Briefcase";
  if (normalized.includes("ai") || normalized.includes("ia")) return "Sparkles";
  if (normalized.includes("cloud")) return "Cloud";
  if (normalized.includes("code") || normalized.includes("dev")) return "Code";
  if (normalized.includes("data")) return "Database";
  if (normalized.includes("team") || normalized.includes("équipe")) return "Users";
  if (normalized.includes("asset")) return "Layers";
  
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

