import React from "react";
import { useGameStore } from "../store/gameStore";
import { Mail, ExternalLink } from "lucide-react";

// Icône Discord
const DiscordIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 16,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

interface FooterProps {
  variant?: "default" | "minimal" | "full";
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  variant = "default",
  className = "",
}) => {
  const { setView } = useGameStore();
  const currentYear = new Date().getFullYear();

  const handleLegalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setView("legal");
  };

  const handleNavClick = (view: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setView(view as never);
  };

  // Footer minimal pour pages de connexion, etc.
  if (variant === "minimal") {
    return (
      <footer className={`text-center py-4 ${className}`}>
        <p className="text-xs text-theme-text-muted">
          © {currentYear} PortfoliA ·{" "}
          <button
            onClick={handleLegalClick}
            className="text-theme-text-muted hover:text-theme-accent-orange transition-colors duration-200 underline-offset-2 hover:underline"
            aria-label="Voir les mentions légales"
          >
            Mentions Légales & Confidentialité
          </button>
        </p>
      </footer>
    );
  }

  // Footer complet pour landing pages
  if (variant === "full") {
    return (
      <footer
        className={`border-t border-theme-border bg-theme-bg-secondary transition-colors duration-200 ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Colonne 1: À propos */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.svg" alt="PortfoliA" className="w-8 h-8" />
                <span className="font-semibold text-theme-text-primary">
                  PortfoliA
                </span>
              </div>
              <p className="text-sm text-theme-text-secondary mb-4 leading-relaxed">
                Plateforme intelligente de gestion d'identité professionnelle.
                CV, Portfolio, Lettres de motivation générés en un clic.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://discord.gg/aNThMsyAhZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-theme-bg-tertiary flex items-center justify-center text-theme-text-tertiary hover:text-[#5865F2] hover:bg-theme-bg-tertiary/80 transition-colors duration-200"
                  aria-label="Rejoindre notre Discord"
                >
                  <DiscordIcon size={18} />
                </a>
                <a
                  href="mailto:contact@portfolia.fr"
                  className="w-9 h-9 rounded-lg bg-theme-bg-tertiary flex items-center justify-center text-theme-text-tertiary hover:text-brand-orange hover:bg-theme-bg-tertiary/80 transition-colors duration-200"
                  aria-label="Nous contacter par email"
                >
                  <Mail size={18} />
                </a>
              </div>
            </div>

            {/* Colonne 2: Produit */}
            <div>
              <h4 className="font-semibold text-theme-text-primary mb-4">
                Produit
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={handleNavClick("landing")}
                    className="text-sm text-theme-text-secondary hover:text-theme-accent-orange transition-colors duration-200"
                  >
                    Fonctionnalités
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleNavClick("pricing")}
                    className="text-sm text-theme-text-secondary hover:text-theme-accent-orange transition-colors duration-200"
                  >
                    Tarifs
                  </button>
                </li>
                <li>
                  <a
                    href="https://portfolia.featurebase.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-theme-text-secondary hover:text-theme-accent-orange transition-colors duration-200"
                  >
                    Roadmap
                    <ExternalLink size={12} />
                  </a>
                </li>
                <li>
                  <a
                    href="https://portfolia.featurebase.app/changelog"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-theme-text-secondary hover:text-theme-accent-orange transition-colors duration-200"
                  >
                    Changelog
                    <ExternalLink size={12} />
                  </a>
                </li>
              </ul>
            </div>

            {/* Colonne 3: Ressources */}
            <div>
              <h4 className="font-semibold text-theme-text-primary mb-4">
                Ressources
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={handleNavClick("schools_landing")}
                    className="text-sm text-theme-text-secondary hover:text-theme-accent-orange transition-colors duration-200"
                  >
                    Pour les Écoles
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleNavClick("companies_landing")}
                    className="text-sm text-theme-text-secondary hover:text-theme-accent-orange transition-colors duration-200"
                  >
                    Pour les Entreprises
                  </button>
                </li>
                <li>
                  <a
                    href="https://portfolia.featurebase.app/help"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-theme-text-secondary hover:text-theme-accent-orange transition-colors duration-200"
                  >
                    Centre d'aide
                    <ExternalLink size={12} />
                  </a>
                </li>
              </ul>
            </div>

            {/* Colonne 4: Légal */}
            <div>
              <h4 className="font-semibold text-theme-text-primary mb-4">
                Légal
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={handleLegalClick}
                    className="text-sm text-theme-text-secondary hover:text-theme-accent-orange transition-colors duration-200"
                  >
                    Mentions légales
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLegalClick}
                    className="text-sm text-theme-text-secondary hover:text-theme-accent-orange transition-colors duration-200"
                  >
                    Politique de confidentialité
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLegalClick}
                    className="text-sm text-theme-text-secondary hover:text-theme-accent-orange transition-colors duration-200"
                  >
                    CGU
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Barre de copyright */}
          <div className="pt-8 border-t border-theme-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-theme-text-muted">
              © {currentYear} PortfoliA. Tous droits réservés.
            </p>
            <p className="text-xs text-theme-text-muted">
              Projet étudiant EFREI Paris · Big Data & Machine Learning
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // Footer par défaut (compact)
  return (
    <footer
      className={`border-t border-theme-border bg-theme-card/50 backdrop-blur-sm transition-colors duration-200 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo et Copyright */}
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="PortfoliA" className="w-8 h-8" />
            <div>
              <p className="text-sm font-medium text-theme-text-secondary">
                PortfoliA
              </p>
              <p className="text-xs text-theme-text-muted">
                © {currentYear} · Projet Étudiant EFREI
              </p>
            </div>
          </div>

          {/* Liens */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={handleLegalClick}
              className="text-sm text-theme-text-tertiary hover:text-theme-accent-orange transition-colors duration-200"
              aria-label="Voir les mentions légales"
            >
              Mentions Légales
            </button>
            <button
              onClick={handleLegalClick}
              className="text-sm text-theme-text-tertiary hover:text-theme-accent-orange transition-colors duration-200"
              aria-label="Voir la politique de confidentialité"
            >
              Confidentialité
            </button>
            <a
              href="mailto:contact@portfolia.fr"
              className="text-sm text-theme-text-tertiary hover:text-theme-accent-orange transition-colors duration-200"
              aria-label="Nous contacter"
            >
              Contact
            </a>
            <a
              href="https://discord.gg/aNThMsyAhZ"
              target="_blank"
              rel="noopener noreferrer"
              className="text-theme-text-tertiary hover:text-[#5865F2] transition-colors duration-200"
              aria-label="Rejoindre notre serveur Discord"
            >
              <DiscordIcon size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
