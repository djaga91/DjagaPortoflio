/**
 * Page Demande de Démo B2B - Formulaire de contact pour prospects
 */
import React, { useState } from "react";
import {
  GraduationCap,
  Building2,
  ArrowLeft,
  Send,
  CheckCircle2,
  Calendar,
  Users,
  Mail,
  Phone,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useGameStore } from "../../store/gameStore";

type OrganizationType = "school" | "company";

interface FormData {
  type: OrganizationType;
  organizationName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  expectedUsers: string;
  message: string;
}

const DemoRequestView: React.FC = () => {
  const { setView } = useGameStore();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    type: "school",
    organizationName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    expectedUsers: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simuler l'envoi (en production, on enverrait à un endpoint backend)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Demande envoyée !
          </h1>
          <p className="text-slate-300 mb-8">
            Merci pour votre intérêt pour PortfoliA ! Notre équipe vous
            contactera sous 24-48h pour planifier votre démonstration
            personnalisée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setView("landing")}
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Retour à l'accueil
            </button>
            <button
              onClick={() =>
                setView(
                  formData.type === "school"
                    ? "schools_landing"
                    : "companies_landing",
                )
              }
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              En savoir plus
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setView("landing")}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView("schools_landing")}
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Écoles
              </button>
              <button
                onClick={() => setView("companies_landing")}
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Entreprises
              </button>
              <button
                onClick={() => setView("pricing")}
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Tarifs
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left side - Info */}
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-4 py-2 rounded-full text-sm mb-6">
              <Calendar className="w-4 h-4" />
              <span>Démo gratuite de 30 min</span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-6">
              Découvrez PortfoliA en action
            </h1>

            <p className="text-slate-300 text-lg mb-8">
              Planifiez une démonstration personnalisée avec notre équipe. Nous
              vous montrerons comment PortfoliA peut transformer
              {formData.type === "school"
                ? " l'employabilité de vos étudiants."
                : " votre processus de recrutement."}
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">
                    Démonstration personnalisée
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Adaptée à vos besoins spécifiques et votre contexte.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">
                    Questions & réponses
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Posez toutes vos questions à nos experts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">
                    Sans engagement
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Découvrez la plateforme librement, sans pression.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-12 pt-8 border-t border-slate-700/50">
              <p className="text-slate-400 text-sm mb-4">
                Ils nous font confiance
              </p>
              <div className="flex flex-wrap gap-4">
                {/* Placeholder - à remplacer par de vrais partenaires */}
                {["École 1", "École 2", "École 3", "École 4"].map(
                  (school, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg text-slate-300 text-sm"
                    >
                      <GraduationCap className="w-4 h-4" />
                      {school}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">
              Planifier ma démo
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type selector */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-3">
                  Vous êtes
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: "school" }))
                    }
                    className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
                      formData.type === "school"
                        ? "bg-indigo-600/20 border-indigo-500 text-white"
                        : "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span className="font-medium">Une école</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: "company" }))
                    }
                    className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
                      formData.type === "company"
                        ? "bg-orange-600/20 border-orange-500 text-white"
                        : "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="font-medium">Une entreprise</span>
                  </button>
                </div>
              </div>

              {/* Organization name */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Nom de l'organisation *
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  required
                  placeholder={
                    formData.type === "school"
                      ? "Ex: Mon École"
                      : "Ex: Mon Entreprise SAS"
                  }
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="Jean"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Dupont"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Contact fields */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email professionnel *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="jean.dupont@entreprise.com"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Expected users */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Nombre d'utilisateurs prévu
                </label>
                <select
                  name="expectedUsers"
                  value={formData.expectedUsers}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                >
                  <option value="">Sélectionnez...</option>
                  {formData.type === "school" ? (
                    <>
                      <option value="1-50">1-50 étudiants</option>
                      <option value="51-200">51-200 étudiants</option>
                      <option value="201-500">201-500 étudiants</option>
                      <option value="501-1000">501-1000 étudiants</option>
                      <option value="1000+">Plus de 1000 étudiants</option>
                    </>
                  ) : (
                    <>
                      <option value="1-5">1-5 recruteurs</option>
                      <option value="6-20">6-20 recruteurs</option>
                      <option value="21-50">21-50 recruteurs</option>
                      <option value="50+">Plus de 50 recruteurs</option>
                    </>
                  )}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Parlez-nous de vos besoins, questions spécifiques..."
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  formData.type === "school"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25"
                    : "bg-gradient-to-r from-[#FF8C42] to-[#FF6B2B] hover:from-[#E07230] hover:to-[#E05A20] shadow-lg shadow-orange-500/25"
                } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Planifier ma démo gratuite
                  </>
                )}
              </button>

              <p className="text-slate-500 text-xs text-center">
                En soumettant ce formulaire, vous acceptez d'être contacté par
                l'équipe PortfoliA. Vos données sont traitées conformément à
                notre{" "}
                <button
                  type="button"
                  onClick={() => setView("legal")}
                  className="text-indigo-400 hover:underline"
                >
                  politique de confidentialité
                </button>
                .
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-slate-400 text-sm">
            © 2026 PortfoliA - Projet Étudiant EFREI
          </span>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setView("pricing")}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Tarifs
            </button>
            <button
              onClick={() => setView("legal")}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Mentions légales
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DemoRequestView;
