import React, { useState, useEffect } from "react";
import {
  FileText,
  Shield,
  Scale,
  ArrowLeft,
  Mail,
  MapPin,
  Building2,
  Server,
  Cloud,
  Bot,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";

type TabType = "mentions" | "privacy" | "cgu";

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabConfig[] = [
  { id: "mentions", label: "Mentions Légales", icon: <FileText size={18} /> },
  {
    id: "privacy",
    label: "Politique de Confidentialité",
    icon: <Shield size={18} />,
  },
  { id: "cgu", label: "Conditions d'Utilisation", icon: <Scale size={18} /> },
];

export const LegalView: React.FC = () => {
  const { setView, isAuthenticated } = useGameStore();

  // Lire le paramètre tab depuis l'URL
  const getInitialTab = (): TabType => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "cgu" || tab === "privacy" || tab === "mentions") {
      return tab;
    }
    return "mentions";
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);

  // Mettre à jour l'onglet si l'URL change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "cgu" || tab === "privacy" || tab === "mentions") {
      setActiveTab(tab);
    }
  }, []);

  const handleBack = () => {
    if (isAuthenticated) {
      setView("dashboard");
    } else {
      setView("landing");
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg-primary">
      {/* Header */}
      <header className="bg-theme-card border-b border-theme-card-border sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-theme-bg-secondary rounded-xl transition-colors"
            >
              <ArrowLeft size={20} className="text-theme-text-secondary" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30 transform -rotate-3 overflow-hidden">
                <img
                  src="/logo.svg"
                  alt="Portfolia"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="font-bold text-xl tracking-tight text-theme-text-primary">
                Portfolia
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Titre */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-theme-text-primary mb-2">
            Informations Légales
          </h1>
          <p className="text-theme-text-secondary">
            Transparence et protection de vos données
          </p>
        </div>

        {/* Onglets */}
        <div className="bg-theme-card rounded-2xl border border-theme-card-border shadow-theme-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-theme-card-border overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 px-4 py-4 font-medium transition-all ${
                  activeTab === tab.id
                    ? "text-[#FF8C42] border-b-2 border-[#FF8C42] bg-orange-50/50 dark:bg-orange-900/20"
                    : "text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-secondary"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === "mentions" && <MentionsLegalesContent />}
            {activeTab === "privacy" && <PrivacyPolicyContent />}
            {activeTab === "cgu" && <CGUContent />}
          </div>
        </div>

        {/* Date de mise à jour */}
        <div className="text-center mt-8 text-sm text-theme-text-muted">
          Dernière mise à jour :{" "}
          {new Date().toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>
    </div>
  );
};

// ==================== MENTIONS LÉGALES ====================
const MentionsLegalesContent: React.FC = () => (
  <div className="space-y-8">
    {/* Éditeur */}
    <Section
      icon={<Building2 className="text-[#FF8C42]" size={24} />}
      title="Éditeur du site"
    >
      <p className="text-theme-text-secondary mb-4">
        <strong>Portfolia</strong> est un projet étudiant développé dans le
        cadre des Engineering Projects de l'EFREI Paris (2025-2026).
      </p>
      <div className="bg-theme-bg-secondary rounded-xl p-4 space-y-2">
        <div className="flex items-start gap-3">
          <MapPin size={18} className="text-theme-text-muted mt-0.5" />
          <div>
            <p className="font-medium text-theme-text-secondary">
              Adresse de correspondance
            </p>
            <p className="text-theme-text-muted">
              EFREI Paris, 30-32 Avenue de la République, 94800 Villejuif,
              France
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Mail size={18} className="text-theme-text-muted mt-0.5" />
          <div>
            <p className="font-medium text-theme-text-secondary">Contact</p>
            <a
              href="mailto:contact@portfolia.fr"
              className="text-[#FF8C42] hover:underline"
            >
              contact@portfolia.fr
            </a>
          </div>
        </div>
      </div>
    </Section>

    {/* Hébergement */}
    <Section
      icon={<Server className="text-indigo-500" size={24} />}
      title="Hébergement"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-theme-bg-secondary rounded-xl p-4">
          <p className="font-semibold text-theme-text-secondary mb-2">
            Frontend
          </p>
          <p className="text-theme-text-secondary font-medium">Vercel Inc.</p>
          <p className="text-sm text-theme-text-muted">
            440 N Barranca Ave #4133
          </p>
          <p className="text-sm text-theme-text-muted">Covina, CA 91723, USA</p>
        </div>
        <div className="bg-theme-bg-secondary rounded-xl p-4">
          <p className="font-semibold text-theme-text-secondary mb-2">
            Backend & Base de données
          </p>
          <p className="text-theme-text-secondary font-medium">
            DigitalOcean, LLC
          </p>
          <p className="text-sm text-theme-text-muted">101 6th Avenue</p>
          <p className="text-sm text-theme-text-muted">
            New York, NY 10013, USA
          </p>
        </div>
      </div>
    </Section>

    {/* Stockage */}
    <Section
      icon={<Cloud className="text-sky-500" size={24} />}
      title="Stockage des fichiers"
    >
      <div className="bg-theme-bg-secondary rounded-xl p-4">
        <p className="text-theme-text-secondary font-medium">Cloudflare R2</p>
        <p className="text-sm text-theme-text-muted mt-1">
          Cloudflare, Inc. - 101 Townsend St, San Francisco, CA 94107, USA
        </p>
        <p className="text-sm text-theme-text-muted mt-2">
          Vos fichiers (CV, photos de profil) sont stockés de manière sécurisée
          sur l'infrastructure Cloudflare.
        </p>
      </div>
    </Section>

    {/* Propriété intellectuelle */}
    <Section
      icon={<Scale className="text-emerald-500" size={24} />}
      title="Propriété intellectuelle"
    >
      <p className="text-theme-text-secondary">
        Le code source, le design et l'ensemble des contenus originaux de{" "}
        <strong>Portfolia</strong> sont la propriété collective de l'équipe
        projet (EFREI Paris, promotion 2025-2026).
      </p>
      <p className="text-theme-text-secondary mt-3">
        Toute reproduction, représentation ou diffusion, totale ou partielle, du
        contenu de ce site par quelque procédé que ce soit, sans l'autorisation
        expresse de l'équipe projet, est interdite et constituerait une
        contrefaçon.
      </p>
      <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
        <p className="text-emerald-800 dark:text-emerald-300 text-sm">
          🚀 Portfolia est un projet à vocation commerciale. Après validation
          académique, l'équipe prévoit d'incuber et de développer le service
          pour une mise sur le marché.
        </p>
      </div>
    </Section>
  </div>
);

// ==================== POLITIQUE DE CONFIDENTIALITÉ ====================
const PrivacyPolicyContent: React.FC = () => (
  <div className="space-y-8">
    {/* Introduction */}
    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-100 dark:border-orange-800 rounded-xl p-6">
      <h3 className="font-bold text-theme-text-primary text-lg mb-2 flex items-center gap-2">
        <Shield className="text-[#FF8C42]" size={20} />
        Notre engagement
      </h3>
      <p className="text-theme-text-secondary">
        Chez Portfolia, nous prenons la protection de vos données personnelles
        très au sérieux. Cette politique décrit comment nous collectons,
        utilisons et protégeons vos informations, conformément au Règlement
        Général sur la Protection des Données (RGPD).
      </p>
    </div>

    {/* Données collectées */}
    <Section
      icon={<FileText className="text-blue-500" size={24} />}
      title="Données collectées"
    >
      <p className="text-theme-text-secondary mb-4">
        Nous collectons uniquement les données nécessaires au fonctionnement du
        service :
      </p>
      <ul className="space-y-3">
        <DataItem
          title="Informations d'identité"
          description="Nom, prénom, adresse email"
        />
        <DataItem
          title="Données professionnelles"
          description="CV (PDF), expériences, formations, compétences, projets, certifications"
        />
        <DataItem
          title="Données de profil"
          description="Photo de profil, biographie, liens LinkedIn/GitHub/Portfolio"
        />
        <DataItem
          title="Données de connexion"
          description="Tokens OAuth (GitHub, Google, LinkedIn) pour la connexion sécurisée"
        />
      </ul>
    </Section>

    {/* Données vocales - Section importante */}
    <Section
      icon={<Bot className="text-purple-500" size={24} />}
      title="Données vocales (Fox Interview)"
    >
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-5 mb-4">
        <p className="text-purple-900 dark:text-purple-300 font-medium mb-2">
          🎙️ Traitement de la voix
        </p>
        <p className="text-purple-800 dark:text-purple-400 text-sm">
          Nous collectons <strong>temporairement</strong> votre voix via la
          fonctionnalité "Fox Interview" uniquement à des fins de{" "}
          <strong>transcription et d'analyse</strong>.
        </p>
      </div>
      <ul className="space-y-2 text-theme-text-secondary">
        <li className="flex items-start gap-2">
          <span className="text-emerald-500 mt-1">✓</span>
          <span>
            Les fichiers audio sont traités par notre sous-traitant (Google
            Gemini)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-emerald-500 mt-1">✓</span>
          <span>
            Les enregistrements ne sont <strong>pas conservés</strong> au-delà
            du traitement nécessaire
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-emerald-500 mt-1">✓</span>
          <span>
            Seule la transcription textuelle est conservée dans votre profil
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-emerald-500 mt-1">✓</span>
          <span>
            Vous pouvez supprimer ces données à tout moment depuis votre profil
          </span>
        </li>
      </ul>
    </Section>

    {/* Usage de l'IA */}
    <Section
      icon={<Bot className="text-[#FF8C42]" size={24} />}
      title="Utilisation de l'Intelligence Artificielle"
    >
      <p className="text-theme-text-secondary mb-4">
        Vos données sont analysées par une Intelligence Artificielle (Google
        Gemini) pour :
      </p>
      <ul className="space-y-2 text-theme-text-secondary mb-4">
        <li className="flex items-start gap-2">
          <span className="text-blue-500">•</span>
          <span>Extraire automatiquement les informations de votre CV</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-500">•</span>
          <span>Générer des suggestions pour améliorer votre profil</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-500">•</span>
          <span>Analyser vos réponses lors des entretiens simulés</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-500">•</span>
          <span>Proposer des conseils personnalisés via le Coach Carrière</span>
        </li>
      </ul>
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
        <p className="text-emerald-800 dark:text-emerald-300 font-medium">
          🔒 Aucune donnée n'est revendue à des tiers publicitaires.
        </p>
        <p className="text-emerald-700 dark:text-emerald-400 text-sm mt-1">
          L'IA est utilisée uniquement pour vous fournir un meilleur service.
        </p>
      </div>
    </Section>

    {/* Sous-traitant IA */}
    <Section
      icon={<Server className="text-indigo-500" size={24} />}
      title="Sous-traitant IA"
    >
      <div className="bg-theme-bg-secondary rounded-xl p-4">
        <p className="font-semibold text-theme-text-secondary">
          Google Gemini API
        </p>
        <p className="text-theme-text-secondary text-sm mt-1">
          Google LLC - 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA
        </p>
        <p className="text-theme-text-muted text-sm mt-2">
          Les données transmises à Google Gemini sont traitées conformément à
          leur politique de confidentialité et aux clauses contractuelles
          standard (SCC) pour les transferts internationaux de données.
        </p>
      </div>
    </Section>

    {/* Cookies */}
    <Section
      icon={<Shield className="text-amber-500" size={24} />}
      title="Politique des Cookies"
    >
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
        <p className="text-amber-900 dark:text-amber-300 font-medium">
          🍪 Politique "Privacy First"
        </p>
      </div>
      <p className="text-theme-text-secondary mb-3">
        Ce site n'utilise <strong>aucun cookie publicitaire</strong> ou de
        traçage tiers.
      </p>
      <p className="text-theme-text-secondary">
        Seuls des <strong>cookies techniques essentiels</strong> au
        fonctionnement sont utilisés :
      </p>
      <ul className="mt-3 space-y-2 text-theme-text-secondary">
        <li className="flex items-start gap-2">
          <span className="text-theme-text-muted">•</span>
          <span>
            <strong>Token d'authentification</strong> : stocké localement pour
            maintenir votre session
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-theme-text-muted">•</span>
          <span>
            <strong>Préférences utilisateur</strong> : thème, langue (stockage
            local uniquement)
          </span>
        </li>
      </ul>
    </Section>

    {/* Vos droits */}
    <Section
      icon={<Scale className="text-emerald-500" size={24} />}
      title="Vos droits (RGPD)"
    >
      <p className="text-theme-text-secondary mb-4">
        Conformément au RGPD, vous disposez des droits suivants :
      </p>
      <div className="grid md:grid-cols-2 gap-3">
        <RightCard
          title="Droit d'accès"
          description="Consultez toutes vos données depuis votre profil"
        />
        <RightCard
          title="Droit de rectification"
          description="Modifiez vos informations à tout moment"
        />
        <RightCard
          title="Droit à l'effacement"
          description="Supprimez votre compte et toutes vos données"
        />
        <RightCard
          title="Droit à la portabilité"
          description="Exportez vos données au format standard"
        />
      </div>
      <div className="mt-4 bg-theme-bg-secondary rounded-xl p-4">
        <p className="text-theme-text-secondary text-sm">
          Pour exercer vos droits ou pour toute question relative à vos données
          personnelles, contactez-nous à{" "}
          <a
            href="mailto:contact@portfolia.fr"
            className="text-[#FF8C42] hover:underline"
          >
            contact@portfolia.fr
          </a>
        </p>
      </div>
      <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-4">
        <p className="text-red-800 dark:text-red-300 font-medium text-sm">
          🗑️ La suppression de votre compte est disponible directement depuis
          les paramètres de votre profil.
        </p>
      </div>
    </Section>

    {/* Conservation des données */}
    <Section
      icon={<FileText className="text-theme-text-muted" size={24} />}
      title="Conservation des données"
    >
      <ul className="space-y-3 text-theme-text-secondary">
        <li className="flex items-start gap-2">
          <span className="text-theme-text-muted">•</span>
          <span>
            <strong>Données de profil</strong> : conservées tant que votre
            compte est actif
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-theme-text-muted">•</span>
          <span>
            <strong>Fichiers audio</strong> : supprimés immédiatement après
            transcription
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-theme-text-muted">•</span>
          <span>
            <strong>Logs de connexion</strong> : conservés 12 mois pour des
            raisons de sécurité
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-theme-text-muted">•</span>
          <span>
            <strong>Après suppression du compte</strong> : toutes les données
            sont effacées sous 30 jours
          </span>
        </li>
      </ul>
    </Section>
  </div>
);

// ==================== CGU ====================
const CGUContent: React.FC = () => (
  <div className="space-y-8">
    {/* Introduction */}
    <Section
      icon={<Scale className="text-indigo-500" size={24} />}
      title="Objet"
    >
      <p className="text-theme-text-secondary">
        Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès
        et l'utilisation du service <strong>Portfolia</strong>. En utilisant ce
        service, vous acceptez les présentes conditions dans leur intégralité.
      </p>
    </Section>

    {/* Description du service */}
    <Section
      icon={<FileText className="text-blue-500" size={24} />}
      title="Description du service"
    >
      <p className="text-theme-text-secondary mb-4">
        Portfolia est une plateforme de gestion d'identité professionnelle
        permettant de :
      </p>
      <ul className="space-y-2 text-theme-text-secondary">
        <li className="flex items-start gap-2">
          <span className="text-[#FF8C42]">•</span>
          <span>Créer et gérer un profil professionnel unifié</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#FF8C42]">•</span>
          <span>Générer des CV professionnels personnalisés</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#FF8C42]">•</span>
          <span>Importer automatiquement les données d'un CV existant</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#FF8C42]">•</span>
          <span>S'entraîner aux entretiens avec une IA</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#FF8C42]">•</span>
          <span>Bénéficier de conseils personnalisés pour sa carrière</span>
        </li>
      </ul>
    </Section>

    {/* Clause IA importante */}
    <Section
      icon={<Bot className="text-amber-500" size={24} />}
      title="Clause de non-garantie IA"
    >
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 mb-4">
        <p className="text-amber-900 dark:text-amber-300 font-bold text-lg mb-2">
          ⚠️ Avertissement important
        </p>
        <p className="text-amber-800 dark:text-amber-400">
          Les contenus générés par notre service (CV, biographies, suggestions,
          analyses d'entretien) sont produits par une{" "}
          <strong>Intelligence Artificielle</strong>.
        </p>
      </div>
      <div className="space-y-3 text-theme-text-secondary">
        <p>
          <strong>L'utilisateur est seul responsable</strong> de vérifier
          l'exactitude, la pertinence et la véracité des informations générées
          avant de les utiliser dans un contexte professionnel.
        </p>
        <p>
          Portfolia <strong>ne saurait être tenu responsable</strong> :
        </p>
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-red-500">•</span>
            <span>
              D'erreurs, d'inexactitudes ou d'« hallucinations » produites par
              l'IA
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">•</span>
            <span>
              De conséquences résultant de l'utilisation des contenus générés
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">•</span>
            <span>
              De décisions prises sur la base des suggestions ou analyses
              fournies
            </span>
          </li>
        </ul>
      </div>
      <div className="mt-4 bg-theme-bg-secondary rounded-xl p-4">
        <p className="text-theme-text-secondary text-sm">
          💡 <strong>Conseil :</strong> Relisez toujours attentivement les
          contenus générés et ajustez-les selon votre situation réelle avant
          toute utilisation professionnelle.
        </p>
      </div>
    </Section>

    {/* Compte utilisateur */}
    <Section
      icon={<Shield className="text-emerald-500" size={24} />}
      title="Compte utilisateur"
    >
      <ul className="space-y-3 text-theme-text-secondary">
        <li className="flex items-start gap-2">
          <span className="text-emerald-500">•</span>
          <span>
            Vous devez fournir des informations exactes lors de l'inscription
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-emerald-500">•</span>
          <span>
            Vous êtes responsable de la confidentialité de vos identifiants de
            connexion
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-emerald-500">•</span>
          <span>Vous vous engagez à ne pas usurper l'identité d'un tiers</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-emerald-500">•</span>
          <span>
            Vous pouvez supprimer votre compte à tout moment depuis les
            paramètres
          </span>
        </li>
      </ul>
    </Section>

    {/* Comportement interdit */}
    <Section
      icon={<Scale className="text-red-500" size={24} />}
      title="Comportements interdits"
    >
      <p className="text-theme-text-secondary mb-4">
        Il est strictement interdit de :
      </p>
      <ul className="space-y-2 text-theme-text-secondary">
        <li className="flex items-start gap-2">
          <span className="text-red-500">✕</span>
          <span>Utiliser le service à des fins illégales ou frauduleuses</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-red-500">✕</span>
          <span>
            Tenter de compromettre la sécurité ou l'intégrité du service
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-red-500">✕</span>
          <span>
            Automatiser l'accès au service (bots, scraping) sans autorisation
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-red-500">✕</span>
          <span>
            Publier des contenus diffamatoires, offensants ou illicites
          </span>
        </li>
      </ul>
    </Section>

    {/* Limitation de responsabilité */}
    <Section
      icon={<FileText className="text-theme-text-muted" size={24} />}
      title="Limitation de responsabilité"
    >
      <p className="text-theme-text-secondary mb-3">
        Le service est fourni « en l'état », sans garantie d'aucune sorte.
      </p>
      <p className="text-theme-text-secondary mb-3">
        En tant que projet étudiant, Portfolia ne garantit pas :
      </p>
      <ul className="space-y-2 text-theme-text-secondary">
        <li className="flex items-start gap-2">
          <span className="text-theme-text-muted">•</span>
          <span>La disponibilité continue et ininterrompue du service</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-theme-text-muted">•</span>
          <span>L'absence totale de bugs ou d'erreurs</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-theme-text-muted">•</span>
          <span>La pérennité du service au-delà de la phase projet</span>
        </li>
      </ul>
    </Section>

    {/* Modifications */}
    <Section
      icon={<FileText className="text-indigo-500" size={24} />}
      title="Modifications des CGU"
    >
      <p className="text-theme-text-secondary">
        Nous nous réservons le droit de modifier les présentes CGU à tout
        moment. Les utilisateurs seront informés de tout changement significatif
        par email ou via une notification sur le service.
      </p>
      <p className="text-theme-text-secondary mt-3">
        La poursuite de l'utilisation du service après modification vaut
        acceptation des nouvelles conditions.
      </p>
    </Section>

    {/* Droit applicable */}
    <Section
      icon={<Scale className="text-theme-text-muted" size={24} />}
      title="Droit applicable"
    >
      <p className="text-theme-text-secondary">
        Les présentes CGU sont régies par le droit français. En cas de litige,
        les tribunaux français seront seuls compétents.
      </p>
    </Section>

    {/* Contact */}
    <Section
      icon={<Mail className="text-[#FF8C42]" size={24} />}
      title="Contact"
    >
      <p className="text-theme-text-secondary">
        Pour toute question concernant ces conditions d'utilisation,
        contactez-nous à :
      </p>
      <a
        href="mailto:contact@portfolia.fr"
        className="inline-flex items-center gap-2 mt-3 text-[#FF8C42] font-medium hover:underline"
      >
        <Mail size={18} />
        contact@portfolia.fr
      </a>
    </Section>
  </div>
);

// ==================== COMPOSANTS UTILITAIRES ====================

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ icon, title, children }) => (
  <section>
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h2 className="text-xl font-bold text-theme-text-primary">{title}</h2>
    </div>
    {children}
  </section>
);

interface DataItemProps {
  title: string;
  description: string;
}

const DataItem: React.FC<DataItemProps> = ({ title, description }) => (
  <li className="flex items-start gap-3 bg-theme-bg-secondary rounded-lg p-3">
    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
    <div>
      <p className="font-medium text-theme-text-secondary">{title}</p>
      <p className="text-sm text-theme-text-muted">{description}</p>
    </div>
  </li>
);

interface RightCardProps {
  title: string;
  description: string;
}

const RightCard: React.FC<RightCardProps> = ({ title, description }) => (
  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4">
    <p className="font-semibold text-emerald-800 dark:text-emerald-300">
      {title}
    </p>
    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
      {description}
    </p>
  </div>
);
