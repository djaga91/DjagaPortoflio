/**
 * Landing B2B Écoles - Page de présentation pour les établissements d'enseignement
 *
 * CODE COULEUR UNIFIÉ :
 * - Écoles    : Indigo #6366F1 (indigo-500)  | Icône: GraduationCap
 * - Recruteurs: Orange #FF8C42              | Icône: Building2
 * - Talents   : Émeraude #10B981 (emerald-500) | Icône: User
 */
import React from "react";
import {
  GraduationCap,
  Users,
  BarChart3,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Star,
  ChevronRight,
  FileText,
  Globe,
  Brain,
  Target,
  Rocket,
  Award,
} from "lucide-react";
import { useGameStore } from "../../store/gameStore";
import { B2BLandingNav } from "../../components/B2BLandingNav";

const SchoolsLandingView: React.FC = () => {
  const { setView } = useGameStore();

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Gestion des cohortes",
      description:
        "Organisez vos étudiants par promotion, filière ou groupe. Suivez leur progression en temps réel.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics avancés",
      description:
        "Taux de complétion des profils, insertion professionnelle, compétences par cohorte.",
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Partenariats entreprises",
      description:
        "Connectez vos étudiants aux entreprises partenaires. Matching IA intelligent.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Contrôle de visibilité",
      description:
        "Décidez quels profils sont visibles aux recruteurs. Protection des données RGPD.",
    },
  ];

  // Stats placeholder - à remplacer par de vraies données une fois en production
  const stats = [
    { value: "XX%", label: "Taux d'insertion" },
    { value: "< X mois", label: "Temps moyen" },
    { value: "XXX+", label: "Entreprises partenaires" },
    { value: "X XXX+", label: "Étudiants accompagnés" },
  ];

  // Plans payants écoles (3 cards principales)
  const plans = [
    {
      name: "Standard",
      price: "10 000€",
      priceUnit: "/ an",
      description: "Jusqu'à 500 étudiants",
      features: [
        "Jusqu'à 500 étudiants",
        "5 comptes staff",
        "Analytics d'insertion",
        "Export CSV/Excel",
        "Support prioritaire",
      ],
      cta: "Demander une démo",
      highlighted: false,
    },
    {
      name: "Avancé",
      price: "18 000€",
      priceUnit: "/ an",
      description: "Jusqu'à 1 500 étudiants",
      features: [
        "Jusqu'à 1 500 étudiants",
        "Staff illimité",
        "Rapports accréditation",
        "API REST",
        "Support dédié 48h",
      ],
      cta: "Demander une démo",
      highlighted: true,
    },
    {
      name: "Institution",
      price: "Sur devis",
      priceUnit: "> 1 500 étudiants",
      description: "Pour les grandes écoles",
      features: [
        "Étudiants illimités",
        "SSO / SAML / LDAP",
        "Intégrations custom",
        "Marque blanche",
        "SLA garanti 99.9%",
      ],
      cta: "Nous contacter",
      highlighted: false,
    },
  ];

  // Plan Pilote (affiché séparément en dessous)
  const pilotPlan = {
    name: "Pilote",
    price: "Gratuit",
    duration: "3 mois",
    description:
      "Testez PortfoliA avec votre première promotion - Sans engagement",
    features: [
      "100 étudiants",
      "2 comptes staff",
      "Stats basiques",
      "Support email",
    ],
    cta: "Démarrer le pilote gratuit",
  };

  // Témoignages placeholder - à remplacer par de vrais avis une fois en production
  const testimonials = [
    {
      quote:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
      author: "Utilisateur 1",
      role: "Rôle exemple",
      school: "École 1",
    },
    {
      quote:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
      author: "Utilisateur 2",
      role: "Rôle exemple",
      school: "École 2",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Navigation */}
      <B2BLandingNav type="schools" label="for Schools" logoColor="indigo" />

      {/* Hero Section */}
      <section className="pt-16 md:pt-20 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-300 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-full text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Propulsé par l'IA</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-theme-text-primary leading-tight mb-6">
                Suivez l'insertion de vos diplômés{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  en temps réel
                </span>
              </h1>

              <p className="text-theme-text-secondary text-lg mb-8">
                PortfoliA aide vos étudiants à créer des profils professionnels
                de qualité, tout en vous donnant les outils pour suivre leur
                employabilité et connecter avec les entreprises partenaires.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setView("demo_request")}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25"
                >
                  Demander une démo gratuite
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setView("pricing")}
                  className="bg-theme-bg-secondary hover:bg-theme-card-hover text-theme-text-primary px-6 py-3 rounded-xl font-medium border border-theme-border transition-colors"
                >
                  Voir les tarifs
                </button>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-16">
              <div className="bg-theme-card/80 backdrop-blur border border-theme-border rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-theme-text-primary font-semibold">
                      Dashboard École
                    </h3>
                    <p className="text-theme-text-secondary text-sm">
                      Vue en temps réel
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {stats.map((stat, i) => (
                    <div
                      key={i}
                      className="bg-theme-bg-secondary rounded-xl p-4"
                    >
                      <div className="text-2xl font-bold text-theme-text-primary mb-1">
                        {stat.value}
                      </div>
                      <div className="text-theme-text-secondary text-sm">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-500/20 dark:to-emerald-500/20 border border-green-300 dark:border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">Tendance positive</span>
                  </div>
                  <p className="text-theme-text-secondary text-sm">
                    +15% d'insertion ce trimestre par rapport à l'année
                    précédente
                  </p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-theme-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-4">
              Tout ce dont vous avez besoin pour accompagner vos étudiants
            </h2>
            <p className="text-theme-text-secondary max-w-2xl mx-auto">
              Une plateforme complète pour suivre, guider et connecter vos
              étudiants aux opportunités professionnelles.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-theme-card backdrop-blur border border-theme-border rounded-2xl p-6 hover:border-indigo-500/50 transition-colors group shadow-sm dark:shadow-none"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/30 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-theme-text-primary font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-theme-text-secondary text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Bénéfices Étudiants */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Bandeau Premium offert */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 mb-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTZzLTItNC0yLTYgMi00IDItNi0yLTQtMi02bTAgMzZjMC0yIDItNCAyLTZzLTItNC0yLTYgMi00IDItNi0yLTQtMi02Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Award className="w-4 h-4" />
                <span>Avantage exclusif école partenaire</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Offrez le Premium à tous vos étudiants
              </h2>
              <p className="text-white/90 max-w-2xl mx-auto text-lg">
                En devenant école partenaire,{" "}
                <strong>
                  tous vos étudiants bénéficient automatiquement des
                  fonctionnalités Premium
                </strong>{" "}
                — sans aucun coût supplémentaire pour eux. Un investissement
                pour l'école, un avantage concurrentiel pour vos diplômés.
              </p>
            </div>
          </div>

          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 px-4 py-2 rounded-full text-sm mb-6">
              <Rocket className="w-4 h-4" />
              <span>Fonctionnalités Premium incluses pour vos étudiants</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-theme-text-primary mb-4">
              Tout ce que vos étudiants débloquent gratuitement
            </h2>
            <p className="text-theme-text-secondary max-w-3xl mx-auto text-lg">
              Vos étudiants accèdent à l'ensemble des outils IA et
              fonctionnalités avancées qui les aident à construire une identité
              professionnelle solide et à décrocher leur premier emploi.
            </p>
          </div>

          {/* Grille des bénéfices étudiants */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                CV PDF professionnel
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Génération automatique de CV au format PDF avec des templates
                premium. Fini les CV Word mal formatés !
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  Templates modernes et ATS-friendly
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  Export PDF en 1 clic
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  Toujours à jour, jamais obsolète
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Portfolio web personnel
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Chaque étudiant obtient son portfolio en ligne, accessible par
                une URL publique. Une vitrine professionnelle instantanée.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  URL personnalisée (portfolia.fr/u/nom)
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Design responsive et moderne
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Partage facile sur LinkedIn
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                IA Coach Carrière
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                L'IA aide vos étudiants à rédiger leurs expériences, reformuler
                leurs descriptions et générer des lettres de motivation
                percutantes.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Reformulation intelligente
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Génération de lettres de motivation
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Conseils personnalisés
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Matching emploi intelligent
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Les offres des entreprises partenaires sont automatiquement
                matchées avec les compétences de vos étudiants.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Offres ciblées par compétences
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Alertes emploi personnalisées
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Accès direct aux recruteurs
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Gamification motivante
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Un système de progression ludique encourage vos étudiants à
                compléter leur profil et à rester actifs sur la plateforme.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Points et niveaux professionnels
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Badges de compétences
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Objectifs guidés étape par étape
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-2xl p-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Import CV existant
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Vos étudiants ont déjà un CV ? L'IA l'analyse et pré-remplit
                leur profil automatiquement. Gain de temps garanti.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  Upload PDF ou Word
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  Extraction IA des données
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  Profil complété en 2 minutes
                </li>
              </ul>
            </div>
          </div>

          {/* Bandeau Premium vs Gratuit */}
          <div className="bg-gradient-to-r from-slate-100 dark:from-slate-800/80 to-indigo-100 dark:to-indigo-900/50 border border-indigo-300 dark:border-indigo-500/30 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-theme-text-primary mb-2">
                Ce que vos étudiants obtiennent avec votre abonnement
              </h3>
              <p className="text-theme-text-secondary">
                Comparez avec un compte étudiant gratuit (sans école partenaire)
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Colonne Gratuit */}
              <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 border border-theme-border shadow-sm dark:shadow-none">
                <div className="text-center mb-4">
                  <span className="text-theme-text-secondary text-sm font-medium">
                    Compte gratuit
                  </span>
                  <div className="text-xl font-bold text-theme-text-secondary">
                    Sans école partenaire
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-theme-text-secondary">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">
                      2
                    </span>
                    CV générés / mois
                  </li>
                  <li className="flex items-center gap-3 text-theme-text-secondary">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">
                      5
                    </span>
                    Reformulations IA / jour
                  </li>
                  <li className="flex items-center gap-3 text-theme-text-secondary">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">
                      1
                    </span>
                    Lettre de motivation / semaine
                  </li>
                  <li className="flex items-center gap-3 text-theme-text-muted dark:text-theme-text-muted line-through">
                    <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-800 flex items-center justify-center text-xs">
                      ✕
                    </span>
                    Templates CV premium
                  </li>
                  <li className="flex items-center gap-3 text-theme-text-muted dark:text-theme-text-muted line-through">
                    <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-800 flex items-center justify-center text-xs">
                      ✕
                    </span>
                    Matching entreprises partenaires
                  </li>
                </ul>
              </div>

              {/* Colonne Premium */}
              <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-500/20 dark:to-red-500/20 rounded-xl p-6 border-2 border-orange-400 dark:border-orange-500/50 relative shadow-sm dark:shadow-none">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    OFFERT PAR VOTRE ÉCOLE
                  </span>
                </div>
                <div className="text-center mb-4 mt-2">
                  <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                    Compte Premium
                  </span>
                  <div className="text-xl font-bold text-theme-text-primary">
                    École partenaire PortfoliA
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-theme-text-primary">
                    <span className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold">
                      ∞
                    </span>
                    CV générés illimités
                  </li>
                  <li className="flex items-center gap-3 text-theme-text-primary">
                    <span className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold">
                      ∞
                    </span>
                    Reformulations IA illimitées
                  </li>
                  <li className="flex items-center gap-3 text-theme-text-primary">
                    <span className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold">
                      ∞
                    </span>
                    Lettres de motivation illimitées
                  </li>
                  <li className="flex items-center gap-3 text-theme-text-primary">
                    <CheckCircle2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    Tous les templates CV premium
                  </li>
                  <li className="flex items-center gap-3 text-theme-text-primary">
                    <CheckCircle2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    Accès aux offres entreprises partenaires
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-theme-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-theme-text-secondary">
              Découvrez comment les écoles utilisent PortfoliA
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800/30 backdrop-blur border border-theme-border rounded-2xl p-8 shadow-sm dark:shadow-none"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-5 h-5 text-yellow-500 fill-yellow-500"
                    />
                  ))}
                </div>
                <blockquote className="text-theme-text-secondary text-lg mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-theme-text-primary font-medium">
                      {testimonial.author}
                    </div>
                    <div className="text-theme-text-secondary text-sm">
                      {testimonial.role}
                    </div>
                    <div className="text-indigo-600 dark:text-indigo-400 text-sm">
                      {testimonial.school}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-theme-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-4">
              Tarification simple et transparente
            </h2>
            <p className="text-theme-text-secondary">
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </div>

          {/* Plan Pilote - Allongé en haut (point d'entrée) */}
          <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 rounded-2xl p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                    🚀 COMMENCEZ ICI
                  </span>
                  <h3 className="text-2xl font-bold text-theme-text-primary">
                    {pilotPlan.name}
                  </h3>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {pilotPlan.price}
                  </span>
                  <span className="text-theme-text-secondary">
                    pendant {pilotPlan.duration}
                  </span>
                </div>
                <p className="text-theme-text-secondary mb-4">
                  {pilotPlan.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  {pilotPlan.features.map((feature, j) => (
                    <span
                      key={j}
                      className="inline-flex items-center gap-1.5 bg-white/50 dark:bg-slate-800/50 text-theme-text-secondary text-sm px-3 py-1.5 rounded-full"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:flex-shrink-0">
                <button
                  onClick={() => setView("demo_request")}
                  className="w-full lg:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                >
                  {pilotPlan.cta}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Séparateur */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700"></div>
            <span className="text-theme-text-muted text-sm font-medium">
              Puis passez à un plan payant
            </span>
            <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700"></div>
          </div>

          {/* 3 Plans payants */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 transition-all hover:scale-[1.02] ${
                  plan.highlighted
                    ? "bg-gradient-to-b from-indigo-600 to-indigo-700 border-2 border-indigo-400 shadow-xl shadow-indigo-500/25 ring-2 ring-indigo-400/50"
                    : "bg-theme-card border border-theme-border shadow-sm dark:shadow-none"
                }`}
              >
                {plan.highlighted && (
                  <div className="text-center mb-4">
                    <span className="bg-indigo-400 text-indigo-900 text-xs font-bold px-3 py-1 rounded-full">
                      RECOMMANDÉ
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-theme-text-primary mb-2">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-theme-text-primary">
                    {plan.price}
                  </span>
                  {plan.priceUnit && (
                    <span className="text-theme-text-secondary text-sm">
                      {" "}
                      {plan.priceUnit}
                    </span>
                  )}
                </div>
                <p className="text-theme-text-secondary text-sm mb-6">
                  {plan.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-theme-text-secondary text-sm"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${plan.highlighted ? "text-indigo-300" : "text-indigo-400"}`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setView("demo_request")}
                  className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                    plan.highlighted
                      ? "bg-white text-indigo-600 hover:bg-slate-100"
                      : "bg-indigo-600 text-white hover:bg-indigo-500"
                  }`}
                >
                  {plan.cta}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl p-12">
            <Zap className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-theme-text-primary mb-4">
              Prêt à transformer l'employabilité de vos étudiants ?
            </h2>
            <p className="text-theme-text-secondary mb-8 max-w-2xl mx-auto">
              Rejoignez les écoles qui utilisent PortfoliA pour accompagner
              leurs étudiants vers l'emploi. Démo gratuite et sans engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setView("demo_request")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25"
              >
                Planifier une démo
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView("login_school")}
                className="bg-theme-bg-secondary hover:bg-theme-card-hover text-theme-text-primary px-8 py-4 rounded-xl font-medium border border-theme-border transition-colors"
              >
                J'ai déjà un compte
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-theme-text-secondary text-sm">
              © 2026 PortfoliA - Projet Étudiant EFREI
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setView("legal")}
              className="text-theme-text-secondary hover:text-theme-text-primary text-sm transition-colors"
            >
              Mentions légales
            </button>
            <button
              onClick={() => setView("landing")}
              className="text-theme-text-secondary hover:text-theme-text-primary text-sm transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SchoolsLandingView;
