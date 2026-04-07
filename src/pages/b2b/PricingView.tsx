/**
 * Page Pricing B2B - Tarification pour écoles, entreprises et crédits IA
 *
 * CODE COULEUR UNIFIÉ :
 * - Écoles    : Indigo #6366F1 (indigo-500)  | Icône: GraduationCap
 * - Recruteurs: Orange #FF8C42              | Icône: Building2
 * - Talents   : Émeraude #10B981 (emerald-500) | Icône: User
 */
import React, { useState } from "react";
import {
  GraduationCap,
  Building2,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Zap,
  Shield,
  Gift,
  Star,
  Crown,
  User,
} from "lucide-react";
import { useGameStore } from "../../store/gameStore";
import { B2BLandingNav } from "../../components/B2BLandingNav";

// Couleurs unifiées pour chaque type d'utilisateur
const COLORS = {
  schools: {
    primary: "#6366F1", // indigo-500
    gradient: "from-indigo-600 to-indigo-700",
    bg: "bg-indigo-600",
    bgHover: "hover:bg-indigo-500",
    text: "text-indigo-400",
    border: "border-indigo-400",
    shadow: "shadow-indigo-500/25",
  },
  companies: {
    primary: "#FF8C42", // orange PortfoliA
    gradient: "from-[#FF8C42] to-[#E07230]",
    bg: "bg-[#FF8C42]",
    bgHover: "hover:bg-[#E07230]",
    text: "text-orange-400",
    border: "border-orange-400",
    shadow: "shadow-orange-500/25",
  },
  talents: {
    primary: "#10B981", // emerald-500
    gradient: "from-emerald-600 to-teal-600",
    bg: "bg-emerald-600",
    bgHover: "hover:bg-emerald-500",
    text: "text-emerald-400",
    border: "border-emerald-400",
    shadow: "shadow-emerald-500/25",
  },
};

type PlanType = "schools" | "companies" | "talents";

const PricingView: React.FC = () => {
  const { setView } = useGameStore();
  const [activeTab, setActiveTab] = useState<PlanType>("schools");

  // Plans payants écoles (3 cards principales)
  const schoolPlans = [
    {
      name: "Standard",
      price: "10 000€",
      priceUnit: "/ an",
      description: "Jusqu'à 500 étudiants",
      features: [
        "Jusqu'à 500 étudiants",
        "5 comptes staff",
        "Cohortes illimitées",
        "Dashboard admin complet",
        "Analytics d'insertion",
        "Alertes étudiants inactifs",
        "Premium illimité pour étudiants",
        "Export CSV/Excel",
        "Support prioritaire",
      ],
      notIncluded: ["Rapports accréditation (PDF)", "API REST", "SSO / SAML"],
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
        "Tout du plan Standard",
        "Rapports accréditation (PDF)",
        "API REST",
        "Partenariats entreprises avancés",
        "Analytics par cohorte & promotion",
        "Support dédié 48h",
      ],
      notIncluded: ["SSO / SAML / LDAP", "Intégrations custom"],
      cta: "Demander une démo",
      highlighted: true,
    },
    {
      name: "Institution",
      price: "Sur devis",
      priceUnit: "> 1 500 étudiants",
      description: "Pour les grandes écoles et universités",
      features: [
        "Étudiants illimités",
        "Tout du plan Avancé",
        "SSO / SAML / LDAP",
        "Support dédié 24h",
        "Intégrations custom (SI école)",
        "Marque blanche",
        "SLA garanti 99.9%",
        "Account manager dédié",
        "Formation équipes",
      ],
      notIncluded: [],
      cta: "Nous contacter",
      highlighted: false,
    },
  ];

  // Plan Pilote (affiché séparément en dessous)
  const pilotPlan = {
    name: "Pilote",
    price: "Gratuit",
    priceUnit: "3 mois",
    description:
      "Testez PortfoliA avec votre première promotion - Sans engagement",
    features: [
      "Jusqu'à 100 étudiants",
      "2 comptes staff",
      "Statistiques basiques",
      "1 cohorte",
      "Support email",
      "Étudiants : 2 CV/mois, 2 Fox/mois",
    ],
    cta: "Démarrer le pilote gratuit",
  };

  // Pricing aligné sur FINAL_BUSINESS_MODEL.md
  // Note: Accès GRATUIT si partenariat avec une école cliente
  const companyPlans = [
    {
      name: "Partenaire",
      price: "Gratuit",
      priceUnit: "via école partenaire",
      description: "Accès via vos écoles partenaires",
      features: [
        "3 offres actives",
        "Accès profils étudiants partenaires",
        "2 recruteurs",
        "Matching IA basique",
        "Support email",
      ],
      notIncluded: [
        "Écoles hors partenariat",
        "Analytics avancés",
        "API & webhooks",
      ],
      cta: "Voir mes écoles partenaires",
      highlighted: false,
    },
    {
      name: "Startup",
      price: "99€",
      priceUnit: "/ mois",
      description: "Accès toutes écoles",
      features: [
        "5 offres actives",
        "Accès toutes les écoles",
        "100 profils consultés / mois",
        "3 recruteurs",
        "Matching IA avancé",
        "Stats candidatures",
        "Support prioritaire",
      ],
      notIncluded: ["ATS intégré", "API & webhooks"],
      cta: "Essai gratuit 14 jours",
      highlighted: true,
    },
    {
      name: "Scale",
      price: "299€",
      priceUnit: "/ mois",
      description: "Pour les équipes de recrutement",
      features: [
        "Offres illimitées",
        "Profils illimités",
        "Toutes les écoles",
        "Recruteurs illimités",
        "ATS intégré",
        "API & webhooks",
        "Support dédié",
        "Analytics avancés",
      ],
      notIncluded: [],
      cta: "Nous contacter",
      highlighted: false,
    },
  ];

  // Packs de crédits IA - Accessibles à tous (couleur Talents = émeraude)
  const creditPacks = [
    {
      name: "Starter",
      credits: 50,
      price: "4,99€",
      pricePerCredit: "0,10€",
      icon: Gift,
      description: "Pour essayer les fonctionnalités IA",
      features: [
        "50 crédits IA",
        "~5 imports de CV",
        "~10 reformulations",
        "~3 lettres de motivation",
        "Validité 6 mois",
      ],
      bonus: null,
      highlighted: false,
    },
    {
      name: "Popular",
      credits: 200,
      price: "14,99€",
      pricePerCredit: "0,075€",
      icon: Star,
      description: "Le plus choisi par nos utilisateurs",
      features: [
        "200 crédits IA",
        "~20 imports de CV",
        "~40 reformulations",
        "~12 lettres de motivation",
        "Validité 12 mois",
      ],
      bonus: "+25% de crédits offerts",
      highlighted: true,
    },
    {
      name: "Pro",
      credits: 500,
      price: "29,99€",
      pricePerCredit: "0,06€",
      icon: Crown,
      description: "Pour les power users",
      features: [
        "500 crédits IA",
        "~50 imports de CV",
        "~100 reformulations",
        "~30 lettres de motivation",
        "Validité illimitée",
      ],
      bonus: "+50% de crédits offerts",
      highlighted: false,
    },
  ];

  // Coûts par fonctionnalité IA
  const aiFeatureCosts = [
    { name: "Import CV (parsing IA)", credits: 10, icon: "📄" },
    { name: "Reformulation texte", credits: 5, icon: "✍️" },
    { name: "Génération description", credits: 5, icon: "💡" },
    { name: "Lettre de motivation", credits: 15, icon: "✉️" },
    { name: "Fox Interview (session)", credits: 20, icon: "🦊" },
    { name: "Matching IA (par offre)", credits: 5, icon: "🎯" },
  ];

  const faqs = [
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer:
        "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement, et nous ajustons votre facturation au prorata.",
    },
    {
      question: "Comment fonctionne l'essai gratuit ?",
      answer:
        "Pour les entreprises, l'essai gratuit de 14 jours donne accès à toutes les fonctionnalités du plan Startup. Aucune carte bancaire n'est requise.",
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer:
        "Absolument. Nous sommes conformes RGPD, toutes les données sont chiffrées, et nous effectuons des audits de sécurité réguliers. Hébergement en Europe.",
    },
    {
      question: "Proposez-vous des réductions pour les associations ?",
      answer:
        "Oui, nous offrons des tarifs préférentiels pour les associations étudiantes et les organismes à but non lucratif. Contactez-nous pour en discuter.",
    },
    {
      question: "Comment fonctionnent les crédits IA ?",
      answer:
        "Les crédits IA sont consommés à chaque utilisation d'une fonctionnalité IA (import CV, reformulation, lettre de motivation...). Chaque compte bénéficie de 10 crédits gratuits par jour. Les crédits achetés ne expirent pas ou ont une validité longue selon le pack.",
    },
    {
      question:
        "Les crédits sont-ils partagés entre les membres d'une organisation ?",
      answer:
        "Non, chaque utilisateur a son propre solde de crédits. Cependant, les écoles et entreprises avec un plan payant offrent des crédits bonus à leurs membres.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <B2BLandingNav type="pricing" logoColor="indigo" />

      {/* Hero */}
      <section className="pt-16 md:pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-theme-text-primary mb-6">
            Tarification simple et transparente
          </h1>
          <p className="text-theme-text-secondary text-lg mb-8">
            Choisissez le plan adapté à vos besoins. Commencez gratuitement,
            évoluez selon votre croissance.
          </p>

          {/* Tabs - Code couleur unifié */}
          <div className="inline-flex bg-theme-bg-secondary rounded-xl p-1 border border-theme-border flex-wrap justify-center gap-1">
            <button
              onClick={() => setActiveTab("schools")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === "schools"
                  ? `${COLORS.schools.bg} text-white shadow-lg ${COLORS.schools.shadow}`
                  : "text-theme-text-secondary hover:text-theme-text-primary"
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span className="hidden sm:inline">Écoles</span>
            </button>
            <button
              onClick={() => setActiveTab("companies")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === "companies"
                  ? `${COLORS.companies.bg} text-white shadow-lg ${COLORS.companies.shadow}`
                  : "text-theme-text-secondary hover:text-theme-text-primary"
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span className="hidden sm:inline">Recruteurs</span>
            </button>
            <button
              onClick={() => setActiveTab("talents")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === "talents"
                  ? `${COLORS.talents.bg} text-white shadow-lg ${COLORS.talents.shadow}`
                  : "text-theme-text-secondary hover:text-theme-text-primary"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">Talents</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Grid - Schools Plans */}
      {activeTab === "schools" && (
        <section className="pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            {/* Plan Pilote - En haut (point d'entrée) */}
            <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 rounded-2xl p-8 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
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
                      pendant {pilotPlan.priceUnit}
                    </span>
                  </div>
                  <p className="text-theme-text-secondary mb-4">
                    {pilotPlan.description}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {pilotPlan.features.map((feature, j) => (
                      <span
                        key={j}
                        className="inline-flex items-center gap-1.5 bg-theme-card text-theme-text-secondary text-sm px-3 py-1.5 rounded-full"
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
                    className="w-full lg:w-auto bg-emerald-600 hover:bg-emerald-500 text-theme-text-primary px-8 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                  >
                    {pilotPlan.cta}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Séparateur */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="text-theme-text-muted text-sm font-medium">
                Puis passez à un plan payant
              </span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            {/* 3 Plans payants */}
            <div className="grid md:grid-cols-3 gap-6">
              {schoolPlans.map((plan, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-6 transition-all hover:scale-[1.02] ${
                    plan.highlighted
                      ? "bg-gradient-to-b from-indigo-600 to-indigo-700 border-2 border-indigo-400 shadow-xl shadow-indigo-500/25 ring-2 ring-indigo-400/50"
                      : "bg-theme-card border border-theme-border"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="text-center mb-4">
                      <span className="bg-indigo-400 text-indigo-900 text-xs font-bold px-3 py-1 rounded-full">
                        RECOMMANDÉ
                      </span>
                    </div>
                  )}

                  <h3
                    className={`text-xl font-bold mb-2 ${
                      plan.highlighted
                        ? "text-white"
                        : "text-theme-text-primary"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <div className="mb-2">
                    <span
                      className={`text-3xl font-bold ${
                        plan.highlighted
                          ? "text-white"
                          : "text-theme-text-primary"
                      }`}
                    >
                      {plan.price}
                    </span>
                    {plan.priceUnit && (
                      <span
                        className={`text-sm ${
                          plan.highlighted
                            ? "text-white/80"
                            : "text-theme-text-secondary"
                        }`}
                      >
                        {" "}
                        {plan.priceUnit}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm mb-6 ${
                      plan.highlighted
                        ? "text-white/90"
                        : "text-theme-text-secondary"
                    }`}
                  >
                    {plan.description}
                  </p>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, j) => (
                      <li
                        key={j}
                        className={`flex items-start gap-2 text-sm ${
                          plan.highlighted
                            ? "text-white/90"
                            : "text-theme-text-secondary"
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            plan.highlighted
                              ? "text-white/80"
                              : "text-indigo-400"
                          }`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {plan.notIncluded.length > 0 && (
                    <ul
                      className={`space-y-2 mb-6 pt-4 border-t ${
                        plan.highlighted
                          ? "border-white/30"
                          : "border-slate-600/50"
                      }`}
                    >
                      {plan.notIncluded.map((feature, j) => (
                        <li
                          key={j}
                          className={`flex items-start gap-2 text-sm ${
                            plan.highlighted
                              ? "text-white/70"
                              : "text-theme-text-muted"
                          }`}
                        >
                          <span className="w-4 h-4 flex-shrink-0">—</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => setView("demo_request")}
                    className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      plan.highlighted
                        ? "bg-theme-card text-theme-text-primary hover:bg-theme-card-hover"
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
      )}

      {/* Pricing Grid - Companies Plans */}
      {activeTab === "companies" && (
        <section className="pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {companyPlans.map((plan, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-6 transition-all hover:scale-[1.02] ${
                    plan.highlighted
                      ? "bg-gradient-to-b from-orange-600 to-orange-700 border-2 border-orange-400 shadow-xl shadow-orange-500/25 ring-2 ring-orange-400/50"
                      : "bg-theme-card border border-theme-border"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="text-center mb-4">
                      <span className="bg-orange-400 text-orange-900 text-xs font-bold px-3 py-1 rounded-full">
                        RECOMMANDÉ
                      </span>
                    </div>
                  )}

                  <h3
                    className={`text-xl font-bold mb-2 ${
                      plan.highlighted
                        ? "text-white"
                        : "text-theme-text-primary"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <div className="mb-2">
                    <span
                      className={`text-3xl font-bold ${
                        plan.highlighted
                          ? "text-white"
                          : "text-theme-text-primary"
                      }`}
                    >
                      {plan.price}
                    </span>
                    {plan.priceUnit && (
                      <span
                        className={`text-sm ${
                          plan.highlighted
                            ? "text-white/80"
                            : "text-theme-text-secondary"
                        }`}
                      >
                        {" "}
                        {plan.priceUnit}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm mb-6 ${
                      plan.highlighted
                        ? "text-white/90"
                        : "text-theme-text-secondary"
                    }`}
                  >
                    {plan.description}
                  </p>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, j) => (
                      <li
                        key={j}
                        className={`flex items-start gap-2 text-sm ${
                          plan.highlighted
                            ? "text-white/90"
                            : "text-theme-text-secondary"
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            plan.highlighted
                              ? "text-white/80"
                              : "text-orange-400"
                          }`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {plan.notIncluded.length > 0 && (
                    <ul
                      className={`space-y-2 mb-6 pt-4 border-t ${
                        plan.highlighted
                          ? "border-white/30"
                          : "border-slate-600/50"
                      }`}
                    >
                      {plan.notIncluded.map((feature, j) => (
                        <li
                          key={j}
                          className={`flex items-start gap-2 text-sm ${
                            plan.highlighted
                              ? "text-white/70"
                              : "text-theme-text-muted"
                          }`}
                        >
                          <span className="w-4 h-4 flex-shrink-0">—</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => setView("demo_request")}
                    className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      plan.highlighted
                        ? "bg-theme-card text-theme-text-primary hover:bg-theme-card-hover"
                        : "bg-[#FF8C42] text-white hover:bg-[#E07230]"
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
      )}

      {/* Talents Section (Crédits IA pour utilisateurs individuels) */}
      {activeTab === "talents" && (
        <section className="pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            {/* Intro text */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-sm mb-4">
                <User className="w-4 h-4" />
                Pour les Talents (étudiants & candidats)
              </div>
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                Boostez votre recherche d'emploi avec l'IA
              </h2>
              <p className="text-theme-text-secondary max-w-2xl mx-auto">
                PortfoliA est{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  gratuit
                </strong>{" "}
                pour tous les talents. Les crédits IA vous permettent d'aller
                plus loin : import de CV, reformulation de texte, génération de
                lettres de motivation, et plus encore.
              </p>
            </div>

            {/* Credit Packs Grid - Couleur Talents (émeraude) */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {creditPacks.map((pack, i) => {
                const IconComponent = pack.icon;

                return (
                  <div
                    key={i}
                    className={`rounded-2xl p-8 transition-all ${
                      pack.highlighted
                        ? "bg-gradient-to-b from-emerald-600 to-teal-600 border-2 border-emerald-400 shadow-xl shadow-emerald-500/25 scale-105"
                        : "bg-theme-card border border-theme-border hover:border-emerald-500/50"
                    }`}
                  >
                    {pack.highlighted && (
                      <div className="text-center mb-4">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-400 text-emerald-900">
                          LE PLUS POPULAIRE
                        </span>
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-2xl ${pack.highlighted ? "bg-white/20" : "bg-emerald-500/20"} flex items-center justify-center mb-4`}
                    >
                      <IconComponent
                        className={`w-7 h-7 ${pack.highlighted ? "text-white" : "text-emerald-400"}`}
                      />
                    </div>

                    <h3
                      className={`text-xl font-bold mb-1 ${pack.highlighted ? "text-white" : "text-theme-text-primary"}`}
                    >
                      {pack.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span
                        className={`text-3xl font-bold ${pack.highlighted ? "text-white" : "text-theme-text-primary"}`}
                      >
                        {pack.price}
                      </span>
                      <span
                        className={`text-sm ${pack.highlighted ? "text-white/80" : "text-theme-text-secondary"}`}
                      >
                        ({pack.pricePerCredit} / crédit)
                      </span>
                    </div>
                    <p
                      className={`text-sm mb-4 ${pack.highlighted ? "text-white/90" : "text-theme-text-secondary"}`}
                    >
                      {pack.description}
                    </p>

                    {pack.bonus && (
                      <div
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                          pack.highlighted
                            ? "bg-white/20 text-white"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        <Gift className="w-3 h-3" />
                        {pack.bonus}
                      </div>
                    )}

                    <ul className="space-y-3 mb-6">
                      {pack.features.map((feature, j) => (
                        <li
                          key={j}
                          className={`flex items-start gap-2 text-sm ${pack.highlighted ? "text-white/90" : "text-theme-text-secondary"}`}
                        >
                          <CheckCircle2
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${pack.highlighted ? "text-white/80" : "text-emerald-400"}`}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        // TODO: Intégration paiement - pour l'instant redirection vers login
                        setView("login");
                      }}
                      className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                        pack.highlighted
                          ? "bg-white text-emerald-900 hover:bg-emerald-50"
                          : "bg-emerald-600 hover:bg-emerald-500 text-theme-text-primary"
                      }`}
                    >
                      Acheter {pack.credits} crédits
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* AI Features Cost Table */}
            <div className="bg-theme-card border border-theme-border rounded-2xl p-8">
              <h3 className="text-xl font-bold text-theme-text-primary mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                Coût par fonctionnalité IA
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiFeatureCosts.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-theme-bg-primary/50 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <span className="text-theme-text-secondary text-sm">
                        {feature.name}
                      </span>
                    </div>
                    <span className="text-emerald-400 font-semibold">
                      {feature.credits} cr.
                    </span>
                  </div>
                ))}
              </div>

              {/* Free tier info */}
              <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <Gift className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-emerald-400 font-medium">
                      Crédits gratuits inclus
                    </p>
                    <p className="text-theme-text-secondary text-sm mt-1">
                      Chaque compte bénéficie de{" "}
                      <span className="text-theme-text-primary font-medium">
                        10 crédits gratuits par jour
                      </span>{" "}
                      pour découvrir les fonctionnalités IA. Les étudiants des
                      écoles partenaires bénéficient de limites augmentées.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trust badges */}
      <section className="py-12 px-6 bg-theme-bg-primary/50 border-y border-theme-border">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-theme-text-primary font-medium">
                  RGPD Compliant
                </div>
                <div className="text-theme-text-secondary text-sm">
                  Données hébergées en Europe
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-theme-text-primary font-medium">
                  99.9% Uptime
                </div>
                <div className="text-theme-text-secondary text-sm">
                  Disponibilité garantie
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-theme-text-primary font-medium">
                  Support réactif
                </div>
                <div className="text-theme-text-secondary text-sm">
                  Réponse sous 24h
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-theme-text-primary text-center mb-12">
            Questions fréquentes
          </h2>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-theme-card border border-theme-border rounded-2xl p-6"
              >
                <h3 className="text-theme-text-primary font-semibold mb-2 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  {faq.question}
                </h3>
                <p className="text-theme-text-secondary">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
            Besoin d'un plan personnalisé ?
          </h2>
          <p className="text-theme-text-secondary mb-8">
            Contactez notre équipe pour discuter de vos besoins spécifiques.
          </p>
          <button
            onClick={() => setView("demo_request")}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-theme-text-primary px-8 py-4 rounded-xl font-semibold transition-all"
          >
            Planifier un appel
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-theme-text-secondary text-sm">
            © 2026 PortfoliA - Projet Étudiant EFREI
          </span>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setView("schools_landing")}
              className="text-theme-text-secondary hover:text-indigo-400 text-sm transition-colors flex items-center gap-1"
            >
              <GraduationCap className="w-4 h-4" />
              Écoles
            </button>
            <button
              onClick={() => setView("companies_landing")}
              className="text-theme-text-secondary hover:text-orange-400 text-sm transition-colors flex items-center gap-1"
            >
              <Building2 className="w-4 h-4" />
              Recruteurs
            </button>
            <button
              onClick={() => setView("landing")}
              className="text-theme-text-secondary hover:text-emerald-400 text-sm transition-colors flex items-center gap-1"
            >
              <User className="w-4 h-4" />
              Talents
            </button>
            <button
              onClick={() => setView("legal")}
              className="text-theme-text-secondary hover:text-theme-text-primary text-sm transition-colors"
            >
              Mentions légales
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingView;
