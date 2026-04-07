/**
 * Landing B2B Entreprises/Recruteurs - Page de présentation pour les recruteurs
 *
 * CODE COULEUR UNIFIÉ :
 * - Écoles    : Indigo #6366F1 (indigo-500)  | Icône: GraduationCap
 * - Recruteurs: Orange #FF8C42              | Icône: Building2
 * - Talents   : Émeraude #10B981 (emerald-500) | Icône: User
 */
import {
  Building2,
  Zap,
  Search,
  Target,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Brain,
  Clock,
  Star,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { useGameStore } from "../../store/gameStore";
import { B2BLandingNav } from "../../components/B2BLandingNav";

const CompaniesLandingView: React.FC = () => {
  const { setView } = useGameStore();

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "CVthèque qualifiée",
      description:
        "Accédez aux profils des étudiants des écoles partenaires. Profils complets et à jour.",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Matching IA",
      description:
        "Notre algorithme trouve les candidats qui correspondent à vos critères en quelques secondes.",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Multi-écoles",
      description:
        "Un seul compte pour accéder aux talents de plusieurs écoles partenaires.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Gain de temps",
      description:
        "Publiez vos offres, recevez des candidatures qualifiées. Fini le tri de CVs.",
    },
  ];

  // Stats placeholder - à remplacer par de vraies données une fois en production
  const stats = [
    { value: "X XXX+", label: "Talents disponibles" },
    { value: "XX+", label: "Écoles partenaires" },
    { value: "XX%", label: "Taux de réponse" },
    { value: "< XXh", label: "Premier contact" },
  ];

  const plans = [
    {
      name: "Discovery",
      price: "Gratuit",
      description: "Pour découvrir la plateforme",
      features: [
        "1 offre active",
        "10 profils / mois",
        "1 école partenaire",
        "Support email",
      ],
      cta: "Commencer gratuitement",
      highlighted: false,
    },
    {
      name: "Startup",
      price: "99€",
      priceUnit: "/ mois",
      description: "Pour les startups en croissance",
      features: [
        "5 offres actives",
        "100 profils / mois",
        "3 écoles partenaires",
        "Matching IA",
        "Stats candidatures",
        "Support prioritaire",
      ],
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
        "Multi-recruteurs",
        "ATS intégré",
        "API & webhooks",
      ],
      cta: "Nous contacter",
      highlighted: false,
    },
  ];

  // Témoignages placeholder - à remplacer par de vrais avis une fois en production
  const testimonials = [
    {
      quote:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
      author: "Utilisateur 1",
      role: "Rôle exemple",
      company: "Entreprise 1",
    },
    {
      quote:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
      author: "Utilisateur 2",
      role: "Rôle exemple",
      company: "Entreprise 2",
    },
  ];

  // Écoles partenaires placeholder - à remplacer par de vrais partenariats une fois en production
  const partnerSchools = [
    "École 1",
    "École 2",
    "École 3",
    "École 4",
    "École 5",
    "École 6",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/30">
      {/* Navigation */}
      <B2BLandingNav
        type="companies"
        label="for Companies"
        logoColor="orange"
      />

      {/* Hero Section */}
      <section className="pt-16 md:pt-20 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-500/20 border border-orange-300 dark:border-orange-500/30 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-full text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Matching propulsé par l'IA</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-theme-text-primary leading-tight mb-6">
                Recrutez les{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400">
                  meilleurs talents tech
                </span>{" "}
                des grandes écoles
              </h1>

              <p className="text-theme-text-secondary text-lg mb-8">
                Accédez à une CVthèque de profils d'étudiants qualifiés et
                motivés. Notre IA trouve les candidats qui matchent parfaitement
                avec vos besoins.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setView("demo_request")}
                  className="bg-gradient-to-r from-[#FF8C42] to-[#FF6B2B] hover:from-[#E07230] hover:to-[#E05A20] text-theme-text-primary px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/25"
                >
                  Essai gratuit 14 jours
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setView("pricing")}
                  className="bg-theme-bg-secondary hover:bg-theme-card-hover text-theme-text-primary px-6 py-3 rounded-xl font-medium border border-theme-border transition-colors"
                >
                  Voir les tarifs
                </button>
              </div>

              <div className="mt-8 flex items-center gap-6 text-sm text-theme-text-secondary">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Sans engagement
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Sans carte bancaire
                </div>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-16">
              <div className="bg-theme-card/80 backdrop-blur border border-theme-border rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                    <Search className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-theme-text-primary font-semibold">
                      Recherche de talents
                    </h3>
                    <p className="text-theme-text-secondary text-sm">
                      Matching en temps réel
                    </p>
                  </div>
                </div>

                {/* Mock search interface */}
                <div className="bg-theme-bg-secondary rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 text-theme-text-secondary text-sm mb-3">
                    <Target className="w-4 h-4" />
                    <span>Développeur Full-Stack React/Node.js</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-xs">
                      React
                    </span>
                    <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-xs">
                      Node.js
                    </span>
                    <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-xs">
                      TypeScript
                    </span>
                    <span className="bg-theme-bg-secondary border border-theme-border text-theme-text-secondary px-3 py-1 rounded-full text-xs">
                      Paris
                    </span>
                  </div>
                </div>

                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-theme-text-primary mb-1">
                    127
                  </div>
                  <div className="text-theme-text-secondary text-sm">
                    profils correspondants
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {stats.map((stat, i) => (
                    <div
                      key={i}
                      className="bg-theme-bg-secondary rounded-lg p-3 text-center"
                    >
                      <div className="text-lg font-bold text-theme-text-primary">
                        {stat.value}
                      </div>
                      <div className="text-theme-text-secondary text-xs">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-red-500/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Partner Schools */}
      <section className="py-12 px-6 bg-theme-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-theme-text-secondary text-sm">
              Talents issus des meilleures écoles
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {partnerSchools.map((school, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-text-primary transition-colors"
              >
                <GraduationCap className="w-5 h-5" />
                <span className="font-medium">{school}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-4">
              Recrutez plus vite, recrutez mieux
            </h2>
            <p className="text-theme-text-secondary max-w-2xl mx-auto">
              Des outils pensés pour les recruteurs tech qui veulent attirer les
              meilleurs talents.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-theme-card backdrop-blur border border-theme-border rounded-2xl p-6 hover:border-orange-500/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-4 group-hover:bg-orange-500/30 transition-colors">
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

      {/* How it works */}
      <section className="py-20 px-6 bg-theme-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-4">
              Comment ça marche ?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-theme-text-primary font-semibold mb-2">
                Créez votre compte
              </h3>
              <p className="text-theme-text-secondary text-sm">
                Inscription gratuite en 2 minutes. Décrivez votre entreprise et
                vos besoins.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-theme-text-primary font-semibold mb-2">
                Recherchez des talents
              </h3>
              <p className="text-theme-text-secondary text-sm">
                Utilisez notre moteur de recherche ou laissez l'IA vous proposer
                des profils.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-theme-text-primary font-semibold mb-2">
                Contactez & recrutez
              </h3>
              <p className="text-theme-text-secondary text-sm">
                Envoyez des messages, planifiez des entretiens, et recrutez vos
                futurs talents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-4">
              Ils recrutent avec PortfoliA
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="bg-theme-card/30 backdrop-blur border border-theme-border rounded-2xl p-8"
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-theme-text-primary font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-theme-text-primary font-medium">
                      {testimonial.author}
                    </div>
                    <div className="text-theme-text-secondary text-sm">
                      {testimonial.role}
                    </div>
                    <div className="text-orange-400 text-sm">
                      {testimonial.company}
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
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-4">
              Des tarifs adaptés à votre croissance
            </h2>
            <p className="text-theme-text-secondary">
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? "bg-gradient-to-b from-orange-600 to-orange-700 border-2 border-orange-400 shadow-xl shadow-orange-500/25 scale-105"
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
                    plan.highlighted ? "text-white" : "text-theme-text-primary"
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

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li
                      key={j}
                      className={`flex items-center gap-2 text-sm ${
                        plan.highlighted
                          ? "text-white/90"
                          : "text-theme-text-secondary"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${plan.highlighted ? "text-white/80" : "text-orange-400"}`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setView("demo_request")}
                  className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                    plan.highlighted
                      ? "bg-white text-orange-600 hover:bg-slate-100"
                      : "bg-[#FF8C42] text-theme-text-primary hover:bg-[#E07230]"
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
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-3xl p-12">
            <Zap className="w-12 h-12 text-orange-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-theme-text-primary mb-4">
              Prêt à recruter les talents de demain ?
            </h2>
            <p className="text-theme-text-secondary mb-8 max-w-2xl mx-auto">
              Rejoignez les entreprises qui recrutent les meilleurs profils tech
              via PortfoliA. Essai gratuit 14 jours, sans engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setView("demo_request")}
                className="bg-gradient-to-r from-[#FF8C42] to-[#FF6B2B] hover:from-[#E07230] hover:to-[#E05A20] text-theme-text-primary px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/25"
              >
                Commencer l'essai gratuit
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView("login_company")}
                className="bg-white dark:bg-slate-800 hover:bg-slate-700 text-theme-text-primary px-8 py-4 rounded-xl font-medium border border-slate-200 dark:border-slate-700 transition-colors"
              >
                J'ai déjà un compte
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-400" />
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

export default CompaniesLandingView;
