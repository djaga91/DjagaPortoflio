/**
 * B2BNavigation - Navigation latérale pour les pages B2B
 *
 * Affiche les liens de navigation pour les admins d'école ou d'entreprise.
 */

import React from "react";
import {
  Building2,
  LayoutDashboard,
  GraduationCap,
  Users,
  Link2,
  UserPlus,
  Briefcase,
  Search,
  BarChart3,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { ViewType } from "../types";

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
}

interface B2BNavigationProps {
  orgType: "school" | "company";
  orgName?: string;
  orgLogo?: string;
  currentView: ViewType;
}

export const B2BNavigation: React.FC<B2BNavigationProps> = ({
  orgType,
  orgName,
  orgLogo,
  currentView,
}) => {
  const { setView } = useGameStore();

  const schoolNavItems: NavItem[] = [
    {
      id: "school_dashboard",
      label: "Tableau de bord",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: "cohorts",
      label: "Cohortes",
      icon: <GraduationCap className="w-5 h-5" />,
    },
    {
      id: "partnerships",
      label: "Partenariats",
      icon: <Link2 className="w-5 h-5" />,
    },
    {
      id: "invite_members",
      label: "Inviter",
      icon: <UserPlus className="w-5 h-5" />,
    },
  ];

  const companyNavItems: NavItem[] = [
    {
      id: "company_dashboard",
      label: "Tableau de bord",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: "jobs",
      label: "Offres d'emploi",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      id: "student_search",
      label: "Recherche talents",
      icon: <Search className="w-5 h-5" />,
    },
    {
      id: "partnerships",
      label: "Écoles partenaires",
      icon: <GraduationCap className="w-5 h-5" />,
    },
    {
      id: "invite_members",
      label: "Équipe",
      icon: <Users className="w-5 h-5" />,
    },
  ];

  const navItems = orgType === "school" ? schoolNavItems : companyNavItems;

  return (
    <div className="w-64 bg-gray-900/50 border-r border-gray-800 min-h-screen p-4">
      {/* Retour au dashboard personnel */}
      <button
        onClick={() => setView("dashboard")}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition w-full px-3 py-2 rounded-lg hover:bg-gray-800"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Retour à mon espace</span>
      </button>

      {/* Organisation header */}
      <div className="flex items-center gap-3 p-3 mb-6 bg-gray-800/50 rounded-xl">
        {orgLogo ? (
          <img
            src={orgLogo}
            alt={orgName}
            className="w-10 h-10 rounded-lg object-cover"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              orgType === "school"
                ? "bg-gradient-to-br from-blue-500 to-cyan-600"
                : "bg-gradient-to-br from-purple-500 to-pink-600"
            }`}
          >
            <Building2 className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">
            {orgName || "Organisation"}
          </p>
          <p className="text-xs text-gray-400">
            {orgType === "school" ? "École" : "Entreprise"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition ${
                isActive
                  ? "bg-orange-500/20 text-orange-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Stats rapides */}
      <div className="mt-8 p-4 bg-gray-800/50 rounded-xl">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
          Accès rapide
        </p>
        <div className="space-y-2">
          <button
            onClick={() =>
              setView(orgType === "school" ? "cohorts" : "partnerships")
            }
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            <BarChart3 className="w-4 h-4" />
            Voir les analytics
          </button>
          <button
            onClick={() => setView("settings")}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            <Settings className="w-4 h-4" />
            Paramètres
          </button>
        </div>
      </div>
    </div>
  );
};

export default B2BNavigation;
