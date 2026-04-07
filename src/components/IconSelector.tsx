/**
 * Composant de sélection d'icônes Lucide React avec barre de recherche
 */

import React, { useState, useMemo } from "react";
import { Search, LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";

// Liste des icônes populaires pour les projets (noms d'icônes Lucide)
const POPULAR_ICONS: Array<{
  name: string;
  icon: LucideIcon;
  keywords: string[];
}> = [
  {
    name: "Rocket",
    icon: LucideIcons.Rocket,
    keywords: ["rocket", "lancement", "démarrage", "startup"],
  },
  {
    name: "Code",
    icon: LucideIcons.Code,
    keywords: ["code", "programmation", "dev", "développement"],
  },
  {
    name: "Globe",
    icon: LucideIcons.Globe,
    keywords: ["globe", "web", "internet", "site"],
  },
  {
    name: "Smartphone",
    icon: LucideIcons.Smartphone,
    keywords: ["mobile", "app", "application", "téléphone"],
  },
  {
    name: "Palette",
    icon: LucideIcons.Palette,
    keywords: ["design", "créatif", "art", "couleur"],
  },
  {
    name: "Wrench",
    icon: LucideIcons.Wrench,
    keywords: ["outil", "maintenance", "config"],
  },
  {
    name: "Zap",
    icon: LucideIcons.Zap,
    keywords: ["rapide", "éclair", "performance", "speed"],
  },
  {
    name: "Target",
    icon: LucideIcons.Target,
    keywords: ["cible", "objectif", "goal", "focus"],
  },
  {
    name: "BarChart",
    icon: LucideIcons.BarChart,
    keywords: ["analytics", "stats", "données", "graphique"],
  },
  {
    name: "Lock",
    icon: LucideIcons.Lock,
    keywords: ["sécurité", "security", "protéger", "safe"],
  },
  {
    name: "Bot",
    icon: LucideIcons.Bot,
    keywords: ["bot", "ia", "ai", "automatisation", "robot"],
  },
  {
    name: "Lightbulb",
    icon: LucideIcons.Lightbulb,
    keywords: ["idée", "innovation", "créatif", "idea"],
  },
  {
    name: "Gamepad",
    icon: LucideIcons.Gamepad,
    keywords: ["jeu", "game", "gaming", "ludique"],
  },
  {
    name: "Book",
    icon: LucideIcons.Book,
    keywords: ["livre", "documentation", "doc", "apprentissage"],
  },
  {
    name: "Building",
    icon: LucideIcons.Building,
    keywords: ["entreprise", "business", "corporate"],
  },
  {
    name: "Database",
    icon: LucideIcons.Database,
    keywords: ["base", "données", "data", "stockage"],
  },
  {
    name: "Cloud",
    icon: LucideIcons.Cloud,
    keywords: ["cloud", "nuage", "serveur", "server"],
  },
  {
    name: "Server",
    icon: LucideIcons.Server,
    keywords: ["serveur", "backend", "api", "infrastructure"],
  },
  {
    name: "Shield",
    icon: LucideIcons.Shield,
    keywords: ["sécurité", "protection", "shield", "secure"],
  },
  {
    name: "FileCode",
    icon: LucideIcons.FileCode,
    keywords: ["fichier", "code", "script", "file"],
  },
  {
    name: "Terminal",
    icon: LucideIcons.Terminal,
    keywords: ["terminal", "cli", "ligne", "command"],
  },
  {
    name: "Box",
    icon: LucideIcons.Box,
    keywords: ["package", "paquet", "container", "box"],
  },
  {
    name: "Layers",
    icon: LucideIcons.Layers,
    keywords: ["couches", "layers", "stack", "pile"],
  },
  {
    name: "Cpu",
    icon: LucideIcons.Cpu,
    keywords: ["cpu", "processeur", "hardware", "performance"],
  },
  {
    name: "HardDrive",
    icon: LucideIcons.HardDrive,
    keywords: ["stockage", "disque", "storage", "drive"],
  },
  {
    name: "Network",
    icon: LucideIcons.Network,
    keywords: ["réseau", "network", "connexion", "connect"],
  },
  {
    name: "Video",
    icon: LucideIcons.Video,
    keywords: ["vidéo", "video", "média", "streaming"],
  },
  {
    name: "Image",
    icon: LucideIcons.Image,
    keywords: ["image", "photo", "picture", "visuel"],
  },
  {
    name: "Music",
    icon: LucideIcons.Music,
    keywords: ["musique", "music", "audio", "son"],
  },
  {
    name: "GraduationCap",
    icon: LucideIcons.GraduationCap,
    keywords: ["éducation", "education", "école", "school"],
  },
  {
    name: "Award",
    icon: LucideIcons.Award,
    keywords: ["récompense", "award", "prix", "trophy"],
  },
  {
    name: "Settings",
    icon: LucideIcons.Settings,
    keywords: ["paramètres", "settings", "config", "options"],
  },
  {
    name: "GitBranch",
    icon: LucideIcons.GitBranch,
    keywords: ["git", "version", "code", "repo"],
  },
  {
    name: "Package",
    icon: LucideIcons.Package,
    keywords: ["package", "npm", "module", "library"],
  },
  {
    name: "Container",
    icon: LucideIcons.Container,
    keywords: ["container", "docker", "conteneur"],
  },
  {
    name: "Activity",
    icon: LucideIcons.Activity,
    keywords: ["activité", "activity", "monitoring", "stats"],
  },
  {
    name: "Briefcase",
    icon: LucideIcons.Briefcase,
    keywords: ["business", "travail", "work", "pro"],
  },
  {
    name: "Users",
    icon: LucideIcons.Users,
    keywords: ["utilisateurs", "users", "équipe", "team"],
  },
  {
    name: "MessageSquare",
    icon: LucideIcons.MessageSquare,
    keywords: ["message", "chat", "communication"],
  },
  {
    name: "Mail",
    icon: LucideIcons.Mail,
    keywords: ["email", "mail", "courrier", "contact"],
  },
  {
    name: "Calendar",
    icon: LucideIcons.Calendar,
    keywords: ["calendrier", "calendar", "date", "événement"],
  },
  {
    name: "Clock",
    icon: LucideIcons.Clock,
    keywords: ["temps", "time", "horloge", "schedule"],
  },
  {
    name: "Star",
    icon: LucideIcons.Star,
    keywords: ["favori", "star", "étoile", "featured"],
  },
  {
    name: "Heart",
    icon: LucideIcons.Heart,
    keywords: ["favori", "heart", "like", "aimer"],
  },
  {
    name: "TrendingUp",
    icon: LucideIcons.TrendingUp,
    keywords: ["croissance", "trend", "croissant", "up"],
  },
  {
    name: "ShoppingCart",
    icon: LucideIcons.ShoppingCart,
    keywords: ["ecommerce", "shop", "achat", "cart"],
  },
  {
    name: "CreditCard",
    icon: LucideIcons.CreditCard,
    keywords: ["paiement", "payment", "card", "money"],
  },
  {
    name: "Wallet",
    icon: LucideIcons.Wallet,
    keywords: ["portefeuille", "wallet", "argent", "money"],
  },
];

interface IconSelectorProps {
  selectedIcon: string | null;
  onSelectIcon: (iconName: string | null) => void;
  className?: string;
}

export const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  onSelectIcon,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrer les icônes selon la recherche
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return POPULAR_ICONS;
    }
    const query = searchQuery.toLowerCase();
    return POPULAR_ICONS.filter(
      ({ name, keywords }) =>
        name.toLowerCase().includes(query) ||
        keywords.some((keyword) => keyword.toLowerCase().includes(query)),
    );
  }, [searchQuery]);

  // Récupérer l'icône sélectionnée
  const SelectedIconComponent = selectedIcon
    ? POPULAR_ICONS.find(({ name }) => name === selectedIcon)?.icon ||
      LucideIcons.Code
    : null;

  return (
    <div className={className}>
      {/* Barre de recherche */}
      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted"
          size={18}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une icône (ex: code, web, mobile...)"
          className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl pl-10 pr-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
        />
      </div>

      {/* Icône sélectionnée actuelle */}
      {SelectedIconComponent && (
        <div className="mb-4 p-3 bg-theme-bg-secondary rounded-xl border border-[#6366F1]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-[#6366F1]/10 rounded-lg">
                <SelectedIconComponent size={24} className="text-[#6366F1]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-theme-text-primary">
                  {selectedIcon}
                </p>
                <p className="text-xs text-theme-text-muted">
                  Icône sélectionnée
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectIcon(null)}
              className="px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              Retirer
            </button>
          </div>
        </div>
      )}

      {/* Grille d'icônes */}
      <div className="max-h-64 overflow-y-auto">
        {filteredIcons.length === 0 ? (
          <div className="text-center py-8 text-theme-text-muted">
            <p className="text-sm">Aucune icône trouvée</p>
            <p className="text-xs mt-1">Essayez un autre terme de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-2">
            {filteredIcons.map(({ name, icon: IconComponent }) => (
              <button
                key={name}
                type="button"
                onClick={() =>
                  onSelectIcon(selectedIcon === name ? null : name)
                }
                className={`w-full aspect-square flex items-center justify-center rounded-xl border-2 transition-all hover:scale-110 ${
                  selectedIcon === name
                    ? "border-[#6366F1] bg-[#6366F1]/10 scale-110"
                    : "border-theme-border hover:border-[#6366F1]/50 bg-theme-bg-secondary"
                }`}
                title={name}
              >
                <IconComponent
                  size={24}
                  className={
                    selectedIcon === name
                      ? "text-[#6366F1]"
                      : "text-theme-text-primary"
                  }
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
