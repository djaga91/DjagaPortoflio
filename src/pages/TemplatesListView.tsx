import React, { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { ArrowLeft, Crown, Sparkles } from "lucide-react";

interface Template {
  id: string;
  title: string;
  description: string;
  image: string;
  color: string;
  baseTheme: "light" | "dark" | "blue" | "purple";
}

// Template 6 : miniature servie en SVG (contient l'image de profil template6-profile.jpg)
const TEMPLATE6_THUMBNAIL_URL = "/templates/thumbnails/template6.svg";

// Fonction helper pour obtenir l'URL de la miniature (comme pour les 5 autres : path local ou fallback)
const getTemplateThumbnail = (templateId: string): string => {
  if (templateId === "template6") {
    return TEMPLATE6_THUMBNAIL_URL;
  }
  return `/templates/thumbnails/${templateId}.jpg`;
};

// URLs de fallback (Unsplash) pour chaque template
const FALLBACK_IMAGES: Record<string, string> = {
  template1:
    "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=2069&auto=format&fit=crop",
  template2:
    "https://images.unsplash.com/photo-1541462608143-0afed437dd78?q=80&w=2069&auto=format&fit=crop",
  template3:
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop",
  template4:
    "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=2070&auto=format&fit=crop",
  template5:
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
  template6: TEMPLATE6_THUMBNAIL_URL,
  book: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop",
};

const TEMPLATES: Template[] = [
  {
    id: "template1",
    title: "Template Moderne",
    description:
      "Design moderne avec animations et sections complètes. Parfait pour tous les profils.",
    image: getTemplateThumbnail("template1"),
    color: "bg-stone-100",
    baseTheme: "dark",
  },
  {
    id: "template2",
    title: "Template Minimaliste",
    description:
      "Design épuré et professionnel. Focus sur la clarté et la lisibilité.",
    image: getTemplateThumbnail("template2"),
    color: "bg-orange-50",
    baseTheme: "light",
  },
  {
    id: "template3",
    title: "Template Créatif",
    description:
      "Design créatif avec masonry layout. Idéal pour les portfolios visuels.",
    image: getTemplateThumbnail("template3"),
    color: "bg-blue-50",
    baseTheme: "light",
  },
  {
    id: "template4",
    title: "Template Artistique",
    description:
      "Design artistique et moderne. Parfait pour les créateurs de contenu.",
    image: getTemplateThumbnail("template4"),
    color: "bg-indigo-50",
    baseTheme: "light",
  },
  {
    id: "template5",
    title: "Template Système",
    description:
      "Style HUD / terminal avec grille, lime et sections type Runtime_History.",
    image: getTemplateThumbnail("template5"),
    color: "bg-slate-900",
    baseTheme: "dark",
  },
  {
    id: "template6",
    title: "Template Élégant",
    description:
      "Design marron/beige avec timeline bifurquée et bulles de chat. Parfait pour un style professionnel et chaleureux.",
    image: getTemplateThumbnail("template6"),
    color: "bg-amber-50",
    baseTheme: "light",
  },
  {
    id: "book",
    title: "Book Portfolio",
    description:
      "Portfolio visuel interactif avec pages tournantes. Idéal pour architectes, designers et artistes.",
    image: "/templates/thumbnails/book.jpg",
    color: "bg-stone-50",
    baseTheme: "light",
  },
];

function TemplateCard({ template }: { template: Template }) {
  const { selectTemplate, setView } = useGameStore();
  const [imageSrc, setImageSrc] = useState(template.image);
  const fallbackImage = FALLBACK_IMAGES[template.id] || template.image;
  const isBook = template.id === "book";

  const handleSelect = () => {
    if (isBook) {
      setView("book_editor");
    } else {
      selectTemplate(template.id);
      setView("template_editor");
    }
  };

  const handleImageError = () => {
    if (imageSrc !== fallbackImage) {
      const pngPath = `/templates/thumbnails/${template.id}.png`;
      const svgPath = `/templates/thumbnails/${template.id}.svg`;
      if (imageSrc.includes(".jpg")) {
        setImageSrc(pngPath);
      } else if (imageSrc.includes(".png")) {
        setImageSrc(template.id === "template6" ? svgPath : fallbackImage);
      } else {
        setImageSrc(fallbackImage);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 group cursor-default">
      <div
        className={`relative aspect-[4/3] rounded-2xl overflow-hidden ${template.color} transition-all duration-300 shadow-sm hover:shadow-md ${isBook ? "ring-2 ring-amber-400/50" : ""}`}
      >
        {/* Badge Premium pour le Book */}
        {isBook && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold shadow-lg">
            <Crown className="w-3 h-3" />
            Premium
          </div>
        )}

        <div className="absolute inset-0 p-6 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full relative transform transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:rotate-0 rotate-[-12deg] scale-110 translate-x-4 translate-y-8">
            <img
              src={imageSrc}
              alt={template.title}
              onError={handleImageError}
              className="w-full h-full object-cover object-top rounded-lg shadow-2xl"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 backdrop-blur-[2px] z-10">
          <button
            onClick={handleSelect}
            className={`px-6 py-3 rounded-lg font-bold text-sm transition-transform hover:scale-[1.02] active:scale-95 shadow-lg ${
              isBook
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            {isBook ? "Créer mon Book" : "Choisir ce template"}
          </button>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {template.title}
          </h3>
          {isBook && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-semibold">
              <Sparkles className="w-2.5 h-2.5" />
              Nouveau
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {template.description}
        </p>
      </div>
    </div>
  );
}

export const TemplatesListView: React.FC = () => {
  const { profile, setView, fetchProfile, user } = useGameStore();

  // Charger le profil si nécessaire
  useEffect(() => {
    if (user && !profile) {
      fetchProfile();
    }
  }, [user, profile, fetchProfile]);

  // Vérifier si l'utilisateur a un site portfolio externe (pas généré par PortfoliA)
  const hasExternalPortfolio = (() => {
    if (!profile?.portfolio_url || !profile.portfolio_url.trim()) {
      return false;
    }
    const url = profile.portfolio_url.trim().toLowerCase();

    // Vérifier si c'est une URL PortfoliA générée
    // Format attendu : http(s)://domain/portfolio/username ou domain/portfolio/username
    const portfoliaDomainPattern = /(portfolia\.fr|localhost|127\.0\.0\.1)/;
    const portfoliaPathPattern = /\/portfolio\/[^\/]+$/;

    // Vérifier si l'URL contient le domaine PortfoliA ET le chemin /portfolio/username
    const hasPortfoliaDomain = portfoliaDomainPattern.test(url);
    const hasPortfoliaPath = portfoliaPathPattern.test(url);

    // C'est une URL PortfoliA si elle contient le domaine ET le chemin /portfolio/username
    // OU si elle commence par /portfolio/ (URL relative)
    const isPortfoliAUrl =
      (hasPortfoliaDomain && hasPortfoliaPath) ||
      url.startsWith("/portfolio/") ||
      url.startsWith("portfolio/");

    // Si ce n'est pas une URL PortfoliA, c'est un portfolio externe
    return !isPortfoliAUrl;
  })();

  useEffect(() => {
    if (hasExternalPortfolio) {
      // Rediriger vers la page portfolio avec un message
      setView("portfolio");
    }
  }, [hasExternalPortfolio, setView]);

  // Si l'utilisateur a un portfolio externe, afficher un message
  if (hasExternalPortfolio) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 pb-20 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-orange-800 dark:text-orange-200 mb-4">
              ⚠️ Vous avez déjà votre propre site portfolio
            </h2>
            <p className="text-orange-700 dark:text-orange-300 mb-6">
              Vous utilisez déjà un site portfolio externe (
              {profile?.portfolio_url}). Pour créer un portfolio PortfoliA,
              veuillez d'abord supprimer votre URL portfolio personnalisée dans
              les paramètres de votre profil.
            </p>
            <button
              onClick={() => setView("portfolio")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Choisissez votre style
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
          Démarrez avec un template conçu par des experts et personnalisez-le en
          temps réel.
        </p>
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {TEMPLATES.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </div>
  );
};
