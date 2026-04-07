import React, { useState } from "react";
import { LogIn, UploadCloud, Zap, Sparkles, ArrowRight } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { ThemeSwitcher } from "../components/ThemeSwitcher";

export const LandingView: React.FC = () => {
  const { setView, setShowLoginModal } = useGameStore();
  const [showCVUploadModal, setShowCVUploadModal] = useState(false);

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleStartFromScratch = () => {
    setView("onboarding_flow");
  };

  const handleImportCV = () => {
    setShowCVUploadModal(true);
  };

  const handleLinkedInClick = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg-primary transition-colors duration-300 overflow-hidden">
      {/* Grid pattern subtile - les animations custom ont été supprimées pour réduire le "vibe code" */}
      <style>{`
        .grid-pattern {
          background-image:
            linear-gradient(to right, rgba(148, 163, 184, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .dark .grid-pattern {
          background-image:
            linear-gradient(to right, rgba(148, 163, 184, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-theme-bg-primary/80 backdrop-blur-md border-b border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/30 transform -rotate-3 overflow-hidden">
                <img
                  src="/logo.svg"
                  alt="Portfolia"
                  className="w-7 h-7 md:w-9 md:h-9 object-contain"
                />
              </div>
              <span className="font-bold text-xl md:text-2xl tracking-tight text-theme-text-primary">
                Portfolia
              </span>
            </div>

            {/* Actions droite */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeSwitcher variant="icon-only" size="sm" />
              <button
                onClick={() => setView("schools_landing")}
                className="hidden md:flex items-center gap-2 px-3 py-2.5 rounded-xl text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-secondary transition-all text-sm font-medium"
              >
                <span>Écoles</span>
              </button>
              <button
                onClick={() => setView("companies_landing")}
                className="hidden md:flex items-center gap-2 px-3 py-2.5 rounded-xl text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-secondary transition-all text-sm font-medium"
              >
                <span>Entreprises</span>
              </button>
              <button
                onClick={() => setView("pricing")}
                className="hidden md:flex items-center gap-2 px-3 py-2.5 rounded-xl text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-secondary transition-all text-sm font-medium"
              >
                <span>Tarifs</span>
              </button>
              {/* Bouton "Rejoindre mon école" masqué temporairement
              <button
                onClick={() => setView('join_organization')}
                className="hidden sm:flex items-center gap-2 px-3 py-2.5 rounded-xl text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-secondary transition-all text-sm font-medium"
              >
                <span>Rejoindre mon école</span>
              </button>
              */}
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                <LogIn size={18} />
                <span>Connexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="flex-1 pt-16 md:pt-20">
        {/* ========== VERSION MOBILE (< md) : Split Screen Vertical ========== */}
        <div className="md:hidden min-h-[calc(100vh-64px)] flex flex-col">
          {/* ZONE FOX (Orange → Rose) - Premier sur mobile */}
          <button
            onClick={handleStartFromScratch}
            className="group relative flex-1 min-h-[45vh] flex flex-col items-center justify-center p-8 overflow-hidden transition-all duration-500 focus:outline-none bg-gradient-to-br from-orange-400 via-orange-500 to-rose-500"
          >
            {/* Décor background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 -right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-yellow-300 rounded-full blur-3xl"></div>
            </div>

            {/* Pattern dots subtil */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1.5px, transparent 1.5px)",
                backgroundSize: "28px 28px",
              }}
            ></div>

            {/* Contenu */}
            <div className="relative z-10 text-center max-w-md mx-auto">
              <div className="mb-6 relative">
                <div className="w-28 h-28 mx-auto bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-[1.02]">
                  <img
                    src="/logo.svg"
                    alt="Fox"
                    className="w-16 h-16 object-contain drop-shadow-lg"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-11 h-11 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Sparkles size={22} className="text-orange-900" />
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-white mb-3 drop-shadow-lg tracking-tight">
                Coache-moi, Fox !
              </h2>
              <p className="text-base text-white/90 mb-6 leading-relaxed">
                Laissez Fox vous interviewer.
                <br />
                <span className="font-semibold">
                  Votre CV se construit en temps réel.
                </span>
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-orange-600 font-bold text-lg shadow-lg shadow-black/20 transition-all duration-300 hover:scale-[1.02] active:scale-95">
                <span>Démarrer l'entretien</span>
                <ArrowRight
                  size={20}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </div>
          </button>

          {/* ZONE IMPORT CV (Emerald → Teal) - Second sur mobile */}
          <button
            onClick={handleImportCV}
            className="group relative flex-1 min-h-[45vh] flex flex-col items-center justify-center p-8 overflow-hidden transition-all duration-500 focus:outline-none bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600"
          >
            {/* Décor background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/3 -left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/3 -right-20 w-72 h-72 bg-cyan-300 rounded-full blur-3xl"></div>
            </div>

            {/* Pattern grid subtil */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            ></div>

            {/* Contenu */}
            <div className="relative z-10 text-center max-w-md mx-auto">
              <div className="mb-6 relative">
                <div className="w-28 h-28 mx-auto bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:-rotate-3">
                  <UploadCloud
                    size={56}
                    className="text-white drop-shadow-lg"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-11 h-11 bg-gradient-to-br from-emerald-300 to-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Zap
                    size={22}
                    className="text-emerald-900"
                    fill="currentColor"
                  />
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-white mb-3 drop-shadow-lg tracking-tight">
                J'ai déjà un CV
              </h2>
              <p className="text-base text-white/90 mb-6 leading-relaxed">
                Transformez votre PDF en
                <br />
                <span className="font-semibold">
                  portfolio interactif en 30 secondes.
                </span>
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-emerald-600 font-bold text-lg shadow-lg shadow-black/20 transition-all duration-300 hover:scale-[1.02] active:scale-95">
                <span>Importer mon CV</span>
                <ArrowRight
                  size={20}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </div>
          </button>
        </div>

        {/* ========== VERSION DESKTOP (>= md) : Carte Glassmorphism Centrée ========== */}
        <div className="hidden md:flex min-h-[calc(100vh-80px)] items-center justify-center p-8 lg:p-12 relative">
          {/* Fond adapté au thème */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Grid pattern très subtile */}
            <div className="absolute inset-0 grid-pattern"></div>
          </div>

          {/* Lumières d'ambiance très subtiles (statiques) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[150px]"></div>
          </div>

          {/* CARTE GLASSMORPHISM PRINCIPALE */}
          <div className="relative z-10 w-full max-w-5xl">
            {/* La carte conteneur avec glassmorphism - adaptée light/dark */}
            <div className="relative bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-2xl shadow-slate-300/50 dark:shadow-black/20 overflow-hidden">
              {/* Reflet subtil en haut */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/50 dark:via-white/20 to-transparent"></div>

              {/* Container Flex pour les deux moitiés */}
              <div className="flex flex-row">
                {/* ===== MOITIÉ GAUCHE : IMPORT CV (Vert) ===== */}
                <button
                  onClick={handleImportCV}
                  className="group relative flex-1 flex flex-col items-center justify-center p-10 lg:p-14 overflow-hidden transition-all duration-500 focus:outline-none"
                >
                  {/* Dégradé vert interne - plus visible en light mode */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 via-emerald-600/20 to-teal-600/30 dark:from-emerald-500/20 dark:via-emerald-600/15 dark:to-teal-600/20 group-hover:from-emerald-500/40 group-hover:via-emerald-600/30 group-hover:to-teal-600/40 dark:group-hover:from-emerald-500/30 dark:group-hover:via-emerald-600/25 dark:group-hover:to-teal-600/30 transition-all duration-500"></div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-400/20 dark:bg-emerald-400/10 rounded-full blur-[80px]"></div>
                  </div>

                  {/* Contenu */}
                  <div className="relative z-10 text-center max-w-sm">
                    {/* Icône Upload avec Glassmorphism */}
                    <div className="mb-8 relative inline-block">
                      <div className="w-32 h-32 lg:w-36 lg:h-36 bg-emerald-500/20 dark:bg-white/10 backdrop-blur-md border border-emerald-300/30 dark:border-white/20 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-emerald-400/50 dark:group-hover:border-emerald-400/30">
                        <UploadCloud
                          size={64}
                          className="lg:w-20 lg:h-20 text-emerald-600 dark:text-white/90 drop-shadow-lg"
                          strokeWidth={1.5}
                        />
                      </div>
                      {/* Badge éclair - statique par défaut, animé au hover */}
                      <div className="absolute -top-3 -right-3 w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-emerald-300 to-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 transition-transform duration-300 group-hover:scale-[1.02] ">
                        <Zap
                          size={24}
                          className="lg:w-7 lg:h-7 text-emerald-900"
                          fill="currentColor"
                        />
                      </div>
                    </div>

                    {/* Titre */}
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-emerald-800 dark:text-white mb-4 tracking-tight">
                      J'ai déjà un CV
                    </h2>

                    {/* Sous-titre */}
                    <p className="text-lg lg:text-xl text-emerald-700/80 dark:text-white/80 mb-8 leading-relaxed">
                      Transformez votre PDF en
                      <br />
                      <span className="font-semibold text-emerald-800 dark:text-white">
                        portfolio interactif en 30 secondes.
                      </span>
                    </p>

                    {/* CTA */}
                    <div className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-emerald-600 dark:bg-white text-white dark:text-emerald-600 font-bold text-lg shadow-lg shadow-emerald-500/30 dark:shadow-black/20 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-emerald-500/40 dark:group-hover:shadow-emerald-500/20">
                      <span>Importer mon CV</span>
                      <ArrowRight
                        size={22}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </button>

                {/* Séparateur vertical subtil */}
                <div className="w-px bg-slate-200/50 dark:bg-white/10 self-stretch my-10"></div>

                {/* ===== MOITIÉ DROITE : FOX COACH (Orange) ===== */}
                <button
                  onClick={handleStartFromScratch}
                  className="group relative flex-1 flex flex-col items-center justify-center p-10 lg:p-14 overflow-hidden transition-all duration-500 focus:outline-none"
                >
                  {/* Dégradé orange interne - plus visible en light mode */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 via-orange-500/20 to-rose-500/30 dark:from-orange-400/20 dark:via-orange-500/15 dark:to-rose-500/20 group-hover:from-orange-400/40 group-hover:via-orange-500/30 group-hover:to-rose-500/40 dark:group-hover:from-orange-400/30 dark:group-hover:via-orange-500/25 dark:group-hover:to-rose-500/30 transition-all duration-500"></div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-orange-400/20 dark:bg-orange-400/10 rounded-full blur-[80px]"></div>
                  </div>

                  {/* Contenu */}
                  <div className="relative z-10 text-center max-w-sm">
                    {/* Visuel Fox avec Glassmorphism */}
                    <div className="mb-8 relative inline-block">
                      <div className="w-32 h-32 lg:w-36 lg:h-36 bg-orange-500/20 dark:bg-white/10 backdrop-blur-md border border-orange-300/30 dark:border-white/20 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-orange-400/50 dark:group-hover:border-orange-400/30 ">
                        <img
                          src="/logo.svg"
                          alt="Fox"
                          className="w-16 h-16 lg:w-20 lg:h-20 object-contain drop-shadow-lg"
                        />
                      </div>
                      {/* Badge sparkle - statique par défaut, animé au hover */}
                      <div className="absolute -top-3 -right-3 w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40 transition-transform duration-300 group-hover:scale-[1.02] ">
                        <Sparkles
                          size={24}
                          className="lg:w-7 lg:h-7 text-orange-900"
                        />
                      </div>
                    </div>

                    {/* Titre */}
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-orange-800 dark:text-white mb-4 tracking-tight">
                      Coache-moi, Fox !
                    </h2>

                    {/* Sous-titre */}
                    <p className="text-lg lg:text-xl text-orange-700/80 dark:text-white/80 mb-8 leading-relaxed">
                      Laissez Fox vous interviewer.
                      <br />
                      <span className="font-semibold text-orange-800 dark:text-white">
                        Votre CV se construit en temps réel.
                      </span>
                    </p>

                    {/* CTA */}
                    <div className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-orange-600 dark:bg-white text-white dark:text-orange-600 font-bold text-lg shadow-lg shadow-orange-500/30 dark:shadow-black/20 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-orange-500/40 dark:group-hover:shadow-orange-500/20">
                      <span>Démarrer l'entretien</span>
                      <ArrowRight
                        size={22}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* ===== SOCIAL PROOF & STATS ===== */}
            <div className="mt-10 flex flex-col items-center gap-6">
              {/* Headline */}
              <p className="text-center text-slate-600 dark:text-white/60 text-base lg:text-lg font-medium tracking-wide">
                Créez votre identité professionnelle en quelques minutes
              </p>

              {/* Stats badges */}
              <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-full border border-slate-200/50 dark:border-white/10 shadow-sm">
                  <span className="text-lg">🎓</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-white/80">
                    Projet EFREI 2026
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-full border border-slate-200/50 dark:border-white/10 shadow-sm">
                  <span className="text-lg">🤖</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-white/80">
                    Propulsé par IA
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-full border border-slate-200/50 dark:border-white/10 shadow-sm">
                  <span className="text-lg">⚡</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-white/80">
                    CV en 5 min
                  </span>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-white/40">
                <div className="flex -space-x-2 relative">
                  <button
                    onClick={(e) =>
                      handleLinkedInClick(
                        "https://www.linkedin.com/in/mzaliamine/",
                        e,
                      )
                    }
                    className="relative z-10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full p-0 border-0 bg-transparent cursor-pointer"
                    title="Amine - LinkedIn"
                    type="button"
                  >
                    <img
                      src="/team-photos/amine.jpg"
                      alt="Amine"
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 object-cover shadow-md hover:scale-110 cursor-pointer pointer-events-none"
                    />
                  </button>
                  <button
                    onClick={(e) =>
                      handleLinkedInClick(
                        "https://www.linkedin.com/in/yilmaz-arnaud-big-data/",
                        e,
                      )
                    }
                    className="relative z-10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full p-0 border-0 bg-transparent cursor-pointer"
                    title="Arnaud - LinkedIn"
                    type="button"
                  >
                    <img
                      src="/team-photos/arnaud.jpg"
                      alt="Arnaud"
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 object-cover shadow-md hover:scale-110 cursor-pointer pointer-events-none"
                    />
                  </button>
                  <button
                    onClick={(e) =>
                      handleLinkedInClick(
                        "https://www.linkedin.com/in/mesaadi/",
                        e,
                      )
                    }
                    className="relative z-10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full p-0 border-0 bg-transparent cursor-pointer"
                    title="Mehdi - LinkedIn"
                    type="button"
                  >
                    <img
                      src="/team-photos/mehdi.jpg"
                      alt="Mehdi"
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 object-cover shadow-md hover:scale-110 cursor-pointer pointer-events-none"
                    />
                  </button>
                  <button
                    onClick={(e) =>
                      handleLinkedInClick(
                        "https://www.linkedin.com/in/samybouaissa/",
                        e,
                      )
                    }
                    className="relative z-10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full p-0 border-0 bg-transparent cursor-pointer"
                    title="Samy - LinkedIn"
                    type="button"
                  >
                    <img
                      src="/team-photos/samy.jpg"
                      alt="Samy"
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 object-cover shadow-md hover:scale-110 cursor-pointer pointer-events-none"
                    />
                  </button>
                  <button
                    onClick={(e) =>
                      handleLinkedInClick(
                        "https://www.linkedin.com/in/alinahas/",
                        e,
                      )
                    }
                    className="relative z-10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full p-0 border-0 bg-transparent cursor-pointer"
                    title="Ali - LinkedIn"
                    type="button"
                  >
                    <img
                      src="/team-photos/ali.jpg"
                      alt="Ali"
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 object-cover shadow-md hover:scale-110 cursor-pointer pointer-events-none"
                    />
                  </button>
                  <button
                    onClick={(e) =>
                      handleLinkedInClick(
                        "https://www.linkedin.com/in/romain-samson-6486b1221/",
                        e,
                      )
                    }
                    className="relative z-10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full p-0 border-0 bg-transparent cursor-pointer"
                    title="Romain - LinkedIn"
                    type="button"
                  >
                    <img
                      src="/team-photos/romain.jpg"
                      alt="Romain"
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 object-cover shadow-md hover:scale-110 cursor-pointer pointer-events-none"
                    />
                  </button>
                </div>
                <span>Développé par une équipe de 6 passionnés</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal d'upload de CV */}
      {showCVUploadModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-theme-card rounded-2xl p-8 max-w-md w-full shadow-2xl border border-theme-card-border animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
                <UploadCloud size={32} className="text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-theme-text-primary mb-2">
                Importer mon CV
              </h2>
              <p className="text-theme-text-secondary">
                Uploadez votre CV en PDF et laissez notre IA remplir
                automatiquement votre profil.
              </p>
            </div>

            {/* Info */}
            <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <div className="text-2xl">✨</div>
                <div>
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                    Import intelligent
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Notre IA extrait automatiquement vos expériences,
                    formations, compétences et plus encore !
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowCVUploadModal(false);
                  setShowLoginModal(true, "cv_import");
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-4 rounded-xl hover:shadow-lg hover:shadow-emerald-200 dark:hover:shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Continuer avec un compte
              </button>

              <button
                onClick={() => setShowCVUploadModal(false)}
                className="w-full bg-theme-bg-tertiary text-theme-text-secondary font-semibold py-4 rounded-xl hover:bg-theme-card-hover transition-all"
              >
                Annuler
              </button>
            </div>

            <p className="text-xs text-theme-text-muted text-center mt-4">
              Vous devez être connecté pour importer un CV
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
