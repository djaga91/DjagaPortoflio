/**
 * Navigation uniforme pour les landing pages B2B
 * Inclut : Menu burger (mobile), liens navigation, connexion, toggle theme
 */
import React, { useState } from "react";
import {
  Menu,
  X,
  GraduationCap,
  Building2,
  DollarSign,
  LogIn,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { ThemeSwitcher } from "./ThemeSwitcher";

interface B2BLandingNavProps {
  /** Type de landing page pour personnaliser le logo */
  type?: "schools" | "companies" | "pricing";
  /** Label à afficher après "PortfoliA" */
  label?: string;
  /** Couleur du logo (indigo pour écoles, orange pour entreprises) */
  logoColor?: "indigo" | "orange";
}

export const B2BLandingNav: React.FC<B2BLandingNavProps> = ({
  type = "pricing",
  label,
  logoColor = "indigo",
}) => {
  const { setView } = useGameStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getLogoIcon = () => {
    if (type === "schools")
      return <GraduationCap className="w-5 h-5 text-white" />;
    if (type === "companies")
      return <Building2 className="w-5 h-5 text-white" />;
    return <DollarSign className="w-5 h-5 text-white" />;
  };

  const getLogoGradient = () => {
    if (logoColor === "orange") {
      return "bg-gradient-to-br from-[#FF8C42] to-[#FF6B2B]";
    }
    return "bg-gradient-to-br from-indigo-500 to-indigo-600";
  };

  const getLabelColor = () => {
    if (logoColor === "orange") {
      return "text-orange-600 dark:text-orange-400";
    }
    return "text-indigo-600 dark:text-indigo-400";
  };

  const navLinks = [
    {
      id: "schools_landing",
      label: "Écoles",
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      id: "companies_landing",
      label: "Entreprises",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: "pricing",
      label: "Tarifs",
      icon: <DollarSign className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (viewId: string) => {
    setView(viewId as never);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-theme-card/80 backdrop-blur-xl border-b border-theme-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button
            onClick={() => setView("landing")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div
              className={`w-8 h-8 rounded-lg ${getLogoGradient()} flex items-center justify-center`}
            >
              {getLogoIcon()}
            </div>
            <span className="text-theme-text-primary font-bold text-lg">
              PortfoliA
            </span>
            {label && (
              <span
                className={`${getLabelColor()} text-sm font-medium hidden sm:inline`}
              >
                {label}
              </span>
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="px-3 py-2 rounded-xl text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-secondary transition-all text-sm font-medium"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                if (type === "schools") setView("login_school");
                else if (type === "companies") setView("login_company");
                else setView("login");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Se connecter</span>
            </button>
            <ThemeSwitcher variant="icon-only" size="sm" />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeSwitcher variant="icon-only" size="sm" />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-theme-text-secondary hover:text-theme-text-primary transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-theme-border bg-theme-card/95 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-secondary rounded-xl transition-all"
                >
                  {link.icon}
                  {link.label}
                </button>
              ))}
              <div className="border-t border-theme-border my-2"></div>
              <button
                onClick={() => {
                  if (type === "schools") setView("login_school");
                  else if (type === "companies") setView("login_company");
                  else setView("login");
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Se connecter</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
