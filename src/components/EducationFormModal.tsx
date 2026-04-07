import React, { useState, useEffect, useRef } from "react";
import {
  X,
  FileText,
  Sparkles,
  Send,
  Calendar,
  MapPin,
  GraduationCap,
  Award,
  Check,
  Building2,
  Wand2,
  Loader2,
} from "lucide-react";
import { AxiosError } from "axios";
import { useGameStore } from "../store/gameStore";
import { ReformulateWithAI } from "./ReformulateWithAI";
import { VoiceOrTextInput } from "./VoiceOrTextInput";
import { api } from "../services/api";
import type { EducationCreate, Education } from "../services/api";

const normalizeBullet = (b: string): string => {
  let t = b
    .replace(/^[-•\s]+/, "")
    .replace(/\*/g, "")
    .trim();
  if (!t) return t;

  const rules: Array<[RegExp, string]> = [
    [/^Développé et implémenté\b/i, "Développement et implémentation"],
    [/^Développé\b/i, "Développement"],
    [/^Optimisé\b/i, "Optimisation"],
    [/^Implémenté\b/i, "Implémentation"],
    [/^Analysé\b/i, "Analyse"],
    [/^Conçu\b/i, "Conception"],
    [/^Géré\b/i, "Gestion"],
    [/^Piloté\b/i, "Pilotage"],
  ];

  for (const [re, noun] of rules) {
    if (re.test(t)) {
      t = t.replace(re, noun);
      break;
    }
  }

  return t;
};

interface EducationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  educationToEdit?: Education | null;
}

type Mode = "choice" | "form" | "guided";

export const EducationFormModal: React.FC<EducationFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  educationToEdit,
}) => {
  const { createEducation, updateEducation, requireAuth, isAuthenticated } =
    useGameStore();
  const isEditMode = !!educationToEdit;
  const [mode, setMode] = useState<Mode>("choice");

  // États pour le formulaire classique
  const [formData, setFormData] = useState<EducationCreate>({
    degree: "",
    school: "",
    location: "",
    field_of_study: "",
    start_date: "",
    end_date: null,
    is_current: false,
    description: "",
    grade: "",
  });

  // États pour le mode guidé
  const [step, setStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [foxQuestion, setFoxQuestion] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [guidedData, setGuidedData] = useState<Partial<EducationCreate>>({});
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiCooldownSeconds, setAiCooldownSeconds] = useState(0);
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current)
        clearInterval(cooldownIntervalRef.current);
    };
  }, []);

  // Fonction pour générer une description avec l'IA
  const generateDescriptionWithAI = async () => {
    if (!guidedData.degree || !guidedData.school) return;
    if (aiCooldownSeconds > 0) return; // Bloqué en cooldown

    setIsGeneratingAI(true);
    try {
      const response = await api.post("/api/ai/generate-description", {
        entity_type: "education",
        title: guidedData.degree,
        organization: guidedData.school,
        context: guidedData.field_of_study || undefined,
      });

      const { description, bullets } = response.data;
      const cleanedBullets = Array.isArray(bullets)
        ? bullets
            .map((b: string) => normalizeBullet(b))
            .filter((b: string) => b.length > 0)
        : [];
      const fullDescription =
        cleanedBullets.length > 0
          ? `• ${cleanedBullets.join("\n• ")}`
          : description || "";

      setInputValue(fullDescription);
    } catch (error) {
      console.error("Erreur génération IA:", error);

      // Gestion spécifique erreur 429 (quota dépassé)
      if (error instanceof AxiosError && error.response?.status === 429) {
        alert("🦊 L'IA est très demandée ! Attendez une minute et réessayez.");

        // Désactiver le bouton pendant 60 secondes
        setAiCooldownSeconds(60);
        if (cooldownIntervalRef.current)
          clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = setInterval(() => {
          setAiCooldownSeconds((prev) => {
            if (prev <= 1) {
              if (cooldownIntervalRef.current)
                clearInterval(cooldownIntervalRef.current);
              cooldownIntervalRef.current = null;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        alert("Erreur lors de la génération. Veuillez réessayer.");
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Nombre total d'étapes pour la progression
  const TOTAL_STEPS = 9;

  // Réinitialiser quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && educationToEdit) {
        // Mode édition : pré-remplir avec les données existantes
        setMode("form"); // Passer directement au formulaire en mode édition
        setFormData({
          degree: educationToEdit.degree || "",
          school: educationToEdit.school || "",
          location: educationToEdit.location || "",
          field_of_study: educationToEdit.field_of_study || "",
          start_date: educationToEdit.start_date || "",
          end_date: educationToEdit.end_date || null,
          is_current: educationToEdit.is_current || false,
          description: educationToEdit.description || "",
          grade: educationToEdit.grade || "",
        });
      } else {
        // Mode création : réinitialiser
        setMode("choice");
        setStep(0);
        setFormData({
          degree: "",
          school: "",
          location: "",
          field_of_study: "",
          start_date: "",
          end_date: null,
          is_current: false,
          description: "",
          grade: "",
        });
        setGuidedData({});
        setInputValue("");
        setFoxQuestion(
          "Bonjour ! 🦊 Ajoutons une formation à votre CV. Quel diplôme avez-vous obtenu ?",
        );
      }
    }
  }, [isOpen, isEditMode, educationToEdit]);

  // Moteur de scénario pour le mode guidé
  const nextStep = (question: string, delay = 500) => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep((prev) => prev + 1);
      setFoxQuestion(question);
      setIsAnimating(false);
    }, delay);
  };

  // Handlers pour le mode guidé
  const handleGuidedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && step !== 2 && step !== 3 && step !== 7) return;

    switch (step) {
      case 0: // Diplôme
        setGuidedData({ ...guidedData, degree: inputValue });
        setInputValue("");
        nextStep(`Dans quelle école ou université ?`);
        break;

      case 1: // École/Université
        setGuidedData({ ...guidedData, school: inputValue });
        setInputValue("");
        nextStep(`C'était où ? (Ville, pays - optionnel)`);
        break;

      case 2: // Localisation
        setGuidedData({ ...guidedData, location: inputValue || null });
        setInputValue("");
        nextStep(`Quel était le domaine d'études ? (optionnel)`);
        break;

      case 3: // Domaine d'études
        setGuidedData({ ...guidedData, field_of_study: inputValue || null });
        setInputValue("");
        nextStep(`Quand avez-vous commencé ? (Format : YYYY-MM-DD)`);
        break;

      case 4: // Date de début
        setGuidedData({ ...guidedData, start_date: inputValue });
        setInputValue("");
        nextStep(`Est-ce toujours en cours ? (Oui/Non)`);
        break;

      case 5: // Formation en cours (géré par les boutons)
        break;

      case 6: // Date de fin (si formation terminée)
        setGuidedData({ ...guidedData, end_date: inputValue });
        setInputValue("");
        nextStep(`Avez-vous obtenu une mention ou une note ? (optionnel)`);
        break;

      case 7: // Mention/Note
        setGuidedData({ ...guidedData, grade: inputValue || null });
        setInputValue("");
        nextStep(`Décrivez cette formation en quelques phrases.`);
        break;

      case 8: // Description finale
        const finalData = {
          ...guidedData,
          description: inputValue.trim() || null,
        };
        setGuidedData(finalData);
        await handleSaveGuided(finalData);
        break;
    }
  };

  const handleSaveGuided = async (dataToSave?: Partial<EducationCreate>) => {
    requireAuth(async () => {
      try {
        const data = dataToSave || guidedData;
        if (isEditMode && educationToEdit) {
          await updateEducation(educationToEdit.id, data as any);
        } else {
          await createEducation(data as EducationCreate);
        }
        onSuccess();
        onClose();
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
      }
    });
  };

  // Handler pour le formulaire classique
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    requireAuth(async () => {
      try {
        const dataToSave = {
          ...formData,
          description: formData.description?.trim() || null,
          location: formData.location?.trim() || null,
          field_of_study: formData.field_of_study?.trim() || null,
          grade: formData.grade?.trim() || null,
        };
        if (isEditMode && educationToEdit) {
          await updateEducation(educationToEdit.id, dataToSave as any);
        } else {
          await createEducation(dataToSave);
        }
        onSuccess();
        onClose();
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div
        className={`w-full ${mode === "guided" ? "max-w-6xl" : "max-w-4xl"} bg-theme-card rounded-[2rem] shadow-theme-xl max-h-[90vh] overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-theme-card-border flex justify-between items-center">
          <h2 className="text-2xl font-bold text-theme-text-primary">
            {isEditMode ? "Modifier la formation" : "Ajouter une formation"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-2 hover:bg-theme-bg-secondary rounded-xl transition-colors"
          >
            <X size={24} className="text-theme-text-muted" />
          </button>
        </div>

        {/* Barre de progression pour le mode guidé */}
        {mode === "guided" && (
          <div className="w-full h-2 bg-theme-bg-secondary relative">
            <div
              className="h-full bg-[#FF8C42] transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            ></div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {mode === "choice" && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Option 1: Formulaire classique */}
              <button
                onClick={() => setMode("form")}
                className="group bg-theme-card rounded-2xl p-8 border-2 border-theme-border hover:border-[#6366F1] transition-all text-left hover:shadow-xl hover:shadow-indigo-200/30 dark:hover:shadow-indigo-900/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#6366F1]/10 to-[#4F46E5]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-[#6366F1] group-hover:to-[#4F46E5] transition-all duration-300 group-hover:scale-[1.02] group-hover:rotate-6">
                  <FileText
                    size={32}
                    className="text-[#6366F1] group-hover:text-white transition-colors"
                  />
                </div>
                <h3 className="text-xl font-bold text-theme-text-primary mb-2 group-hover:text-[#6366F1] transition-colors">
                  Formulaire classique
                </h3>
                <p className="text-theme-text-secondary text-sm">
                  Remplissez tous les champs rapidement avec un formulaire
                  traditionnel.
                </p>
              </button>

              {/* Option 2: Guidé par Fox + IA */}
              <button
                onClick={() => setMode("guided")}
                className="group bg-theme-card rounded-2xl p-8 border-2 border-theme-border hover:border-[#FF8C42] transition-all text-left hover:shadow-xl hover:shadow-orange-200/30 dark:hover:shadow-orange-900/20 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
              >
                {/* Badge IA en haut à gauche */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30">
                  <Wand2 size={12} className="text-white" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                    IA
                  </span>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF8C42]/10 to-[#FF6B2B]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-[#FF8C42] group-hover:to-[#FF6B2B] transition-all duration-300 group-hover:scale-[1.02] group-hover:rotate-6">
                  <Sparkles
                    size={32}
                    className="text-[#FF8C42] group-hover:text-white transition-colors"
                  />
                </div>
                <h3 className="text-xl font-bold text-theme-text-primary mb-2 group-hover:text-[#FF8C42] transition-colors">
                  Avec Fox 🦊
                </h3>
                <p className="text-theme-text-secondary text-sm">
                  Laissez-vous guider étape par étape avec assistance IA pour
                  générer vos descriptions.
                </p>
              </button>
            </div>
          )}

          {/* Mode Formulaire Classique */}
          {mode === "form" && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-theme-text-primary mb-2">
                    <GraduationCap size={16} className="inline mr-2" /> Diplôme
                    *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.degree}
                    onChange={(e) =>
                      setFormData({ ...formData, degree: e.target.value })
                    }
                    className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
                    placeholder="Ex: Master Informatique"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-theme-text-primary mb-2">
                    <Building2 size={16} className="inline mr-2" />{" "}
                    École/Université *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.school}
                    onChange={(e) =>
                      setFormData({ ...formData, school: e.target.value })
                    }
                    className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
                    placeholder="Ex: EFREI Paris"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-theme-text-primary mb-2">
                    <MapPin size={16} className="inline mr-2" /> Localisation
                  </label>
                  <input
                    type="text"
                    value={formData.location || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: e.target.value || null,
                      })
                    }
                    className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
                    placeholder="Ex: Paris, France"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-theme-text-primary mb-2">
                    <Award size={16} className="inline mr-2" /> Domaine d'études
                  </label>
                  <input
                    type="text"
                    value={formData.field_of_study || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        field_of_study: e.target.value || null,
                      })
                    }
                    className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
                    placeholder="Ex: Intelligence Artificielle"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-theme-text-primary mb-2">
                    <Calendar size={16} className="inline mr-2" /> Date de début
                    *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-theme-text-primary mb-2">
                    <Calendar size={16} className="inline mr-2" /> Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.end_date || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        end_date: e.target.value || null,
                      })
                    }
                    disabled={formData.is_current}
                    className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_current"
                  checked={formData.is_current}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      is_current: e.target.checked,
                      end_date: e.target.checked ? null : formData.end_date,
                    });
                  }}
                  className="w-5 h-5 rounded border-theme-border text-[#6366F1] focus:ring-[#6366F1]"
                />
                <label
                  htmlFor="is_current"
                  className="text-sm font-semibold text-theme-text-primary cursor-pointer"
                >
                  Formation en cours
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-theme-text-primary mb-2">
                    <Award size={16} className="inline mr-2" /> Mention/Note
                  </label>
                  <input
                    type="text"
                    value={formData.grade || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        grade: e.target.value || null,
                      })
                    }
                    className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
                    placeholder="Ex: Très Bien, 3.8/4.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-theme-text-primary mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value || null,
                    })
                  }
                  placeholder="Décrivez cette formation, les cours suivis, les projets réalisés..."
                  rows={4}
                  className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={() => setMode("choice")}
                    className="px-6 py-3 bg-theme-bg-secondary hover:bg-slate-200 dark:hover:bg-slate-700 text-theme-text-primary font-semibold rounded-xl transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Retour
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#6366F1] text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30 hover:shadow-xl hover:shadow-indigo-300/50 dark:hover:shadow-indigo-800/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Check size={20} className="animate-pulse" />{" "}
                  {isEditMode ? "Enregistrer les modifications" : "Enregistrer"}
                </button>
              </div>
            </form>
          )}

          {/* Mode Guidé par Fox */}
          {mode === "guided" && (
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 h-full">
              {/* LEFT COLUMN - Interaction Fox */}
              <div className="w-full md:w-1/2 flex flex-col">
                <div className="flex flex-col items-center mb-8">
                  {/* Mascotte et Bulle */}
                  <div
                    className={`flex flex-col items-center mb-6 transition-all duration-500 ${isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
                  >
                    <div className="mb-4 filter drop-shadow-2xl transform hover:scale-[1.02] transition cursor-pointer">
                      <img
                        src="/logo.svg"
                        alt="Fox"
                        className="w-24 h-24 object-contain"
                      />
                    </div>
                    <div className="bg-theme-card text-theme-text-primary p-6 rounded-3xl rounded-t-none shadow-theme-lg relative max-w-lg text-center font-medium text-base md:text-lg border-2 border-theme-card-border">
                      {foxQuestion}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-b-[15px] border-b-theme-card border-r-[15px] border-r-transparent"></div>
                    </div>
                  </div>

                  {/* Zone d'Input */}
                  <form onSubmit={handleGuidedSubmit} className="w-full">
                    <div
                      className={`transition-all duration-500 delay-100 ${isAnimating ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"}`}
                    >
                      {(step === 0 ||
                        step === 1 ||
                        step === 2 ||
                        step === 3 ||
                        step === 7) && (
                        <VoiceOrTextInput
                          value={inputValue}
                          onChange={setInputValue}
                          placeholder={
                            step === 0
                              ? "Ex: Master Informatique"
                              : step === 1
                                ? "Ex: EFREI Paris"
                                : step === 2
                                  ? "Ex: Paris, France (ou laissez vide)"
                                  : step === 3
                                    ? "Ex: Intelligence Artificielle (ou laissez vide)"
                                    : "Ex: Très Bien, 3.8/4.0 (ou laissez vide)"
                          }
                          submitDisabled={
                            !inputValue.trim() &&
                            step !== 2 &&
                            step !== 3 &&
                            step !== 7
                          }
                          submitLabel={
                            <>
                              Valider{" "}
                              <Send
                                size={20}
                                className="animate-pulse inline"
                              />
                            </>
                          }
                          isAuthenticated={!!isAuthenticated}
                          requireAuth={requireAuth}
                          inputType="text"
                        />
                      )}
                      {(step === 4 || step === 6) && (
                        <>
                          <input
                            autoFocus
                            type="date"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={
                              step === 4 ? "Date de début" : "Date de fin"
                            }
                            className="w-full bg-theme-bg-secondary border-2 border-theme-border rounded-2xl px-6 py-4 text-theme-text-primary text-lg focus:outline-none focus:border-[#FF8C42] transition placeholder-theme-text-muted text-center"
                          />
                          <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-[#FF8C42] to-[#FF6B2B] hover:from-[#E07230] hover:to-[#FF8C42] font-bold text-white shadow-xl shadow-orange-200/50 dark:shadow-orange-900/30 text-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl hover:shadow-orange-300/50 dark:hover:shadow-orange-800/30"
                          >
                            Valider <Send size={20} className="animate-pulse" />
                          </button>
                        </>
                      )}

                      {step === 8 && (
                        <>
                          {/* Bouton génération IA */}
                          <button
                            type="button"
                            onClick={generateDescriptionWithAI}
                            disabled={isGeneratingAI || aiCooldownSeconds > 0}
                            className="w-full mb-4 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 font-bold text-white shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30 text-base transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                          >
                            {isGeneratingAI ? (
                              <>
                                <Loader2 size={18} className="animate-spin" />
                                Génération en cours...
                              </>
                            ) : aiCooldownSeconds > 0 ? (
                              <>
                                <Sparkles size={18} />
                                Réessayer dans {aiCooldownSeconds}s
                              </>
                            ) : (
                              <>
                                <Wand2 size={18} />✨ Générer avec l'IA
                              </>
                            )}
                          </button>

                          <VoiceOrTextInput
                            value={inputValue}
                            onChange={setInputValue}
                            placeholder="Décrivez cette formation, les cours suivis, les projets réalisés..."
                            rows={4}
                            submitDisabled={!inputValue.trim()}
                            isAuthenticated={!!isAuthenticated}
                            requireAuth={requireAuth}
                            inputType="text"
                            showSubmitButton={false}
                            entityType="education"
                            descriptionContext={{
                              title: guidedData.degree ?? undefined,
                              organization: guidedData.school ?? undefined,
                            }}
                          />
                          <ReformulateWithAI
                            value={inputValue}
                            onTextChange={(newText) => setInputValue(newText)}
                            placeholder="Décrivez cette formation, les cours suivis, les projets réalisés..."
                            rows={4}
                            buttonOnly
                          />
                          <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-[#FF8C42] to-[#FF6B2B] hover:from-[#E07230] hover:to-[#FF8C42] font-bold text-white shadow-xl shadow-orange-200/50 dark:shadow-orange-900/30 text-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl hover:shadow-orange-300/50 dark:hover:shadow-orange-800/30"
                          >
                            Enregistrer <Check size={20} />
                          </button>
                        </>
                      )}

                      {step === 5 && (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={async () => {
                              setGuidedData({
                                ...guidedData,
                                is_current: true,
                              });
                              setInputValue("");
                              setIsAnimating(true);
                              setTimeout(() => {
                                setStep(7);
                                setFoxQuestion(
                                  `Avez-vous obtenu une mention ou une note ? (optionnel)`,
                                );
                                setIsAnimating(false);
                              }, 500);
                            }}
                            className="bg-theme-card hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-900/20 dark:hover:to-orange-900/10 hover:border-[#FF8C42] p-4 rounded-2xl border-2 border-theme-border text-left flex items-center gap-4 transition-all duration-300 group hover:shadow-lg hover:shadow-orange-200/50 dark:hover:shadow-orange-900/20 hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <div className="bg-theme-bg-secondary p-3 rounded-xl group-hover:bg-gradient-to-br group-hover:from-[#FF8C42] group-hover:to-[#FF6B2B] group-hover:text-white transition-all duration-300 group-hover:scale-[1.02] group-hover:rotate-6">
                              <Check
                                size={24}
                                className="transition-colors text-theme-text-secondary group-hover:text-white"
                              />
                            </div>
                            <span className="text-lg font-medium text-theme-text-primary group-hover:text-[#FF8C42] transition-colors">
                              Oui, en cours
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setGuidedData({
                                ...guidedData,
                                is_current: false,
                              });
                              setInputValue("");
                              nextStep(
                                `Quand avez-vous terminé ? (Format : YYYY-MM-DD)`,
                              );
                            }}
                            className="bg-theme-card hover:bg-gradient-to-br hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:border-slate-300 dark:hover:border-slate-600 p-4 rounded-2xl border-2 border-theme-border text-left flex items-center gap-4 transition-all duration-300 group hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <div className="bg-theme-bg-secondary p-3 rounded-xl group-hover:bg-slate-200 dark:group-hover:bg-slate-600 group-hover:text-white transition-all duration-300 group-hover:scale-[1.02] group-hover:rotate-6">
                              <X
                                size={24}
                                className="transition-colors text-theme-text-secondary group-hover:text-white"
                              />
                            </div>
                            <span className="text-lg font-medium text-theme-text-primary group-hover:text-theme-text-secondary transition-colors">
                              Non, terminée
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </form>

                  {/* Bouton Retour */}
                  <button
                    onClick={() => setMode("choice")}
                    className="mt-6 text-sm text-theme-text-muted hover:text-theme-text-primary font-medium self-center"
                  >
                    ← Retour au choix
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN - Glass Card Preview */}
              <div className="hidden md:flex w-1/2 bg-gradient-to-br from-theme-bg-secondary to-theme-bg-primary items-center justify-center p-8 relative overflow-hidden rounded-2xl">
                {/* Décor d'arrière-plan */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF8C42] opacity-10 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6366F1] opacity-10 blur-[80px] rounded-full pointer-events-none"></div>

                {/* Glass Card */}
                <div
                  className={`bg-theme-card/90 backdrop-blur-lg text-theme-text-primary w-full max-w-md shadow-theme-xl rounded-2xl p-6 lg:p-8 flex flex-col border border-theme-card-border/50 transition-all duration-700 transform ${step > 0 ? "scale-100 opacity-100 rotate-0" : "scale-95 opacity-40 rotate-1 blur-sm"}`}
                >
                  {/* En-tête */}
                  <div
                    className={`flex items-start gap-4 border-b-2 border-[#FF8C42]/30 pb-4 mb-6 transition-all duration-500 ${guidedData.degree ? "opacity-100" : "opacity-40"}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                        guidedData.degree
                          ? "bg-[#FF8C42]/10 border-[#FF8C42]/30 text-[#FF8C42]"
                          : "bg-theme-bg-secondary border-[#FF8C42]/20 text-theme-text-muted"
                      }`}
                    >
                      <GraduationCap size={24} />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-bold mb-1 transition-all duration-500 ${guidedData.degree ? "text-theme-text-primary" : "text-theme-text-muted"}`}
                      >
                        {guidedData.degree || (
                          <span className="opacity-50 italic">Diplôme</span>
                        )}
                      </h3>
                      <p
                        className={`font-semibold text-sm transition-all duration-500 ${guidedData.school ? "text-[#FF8C42]" : "text-theme-text-muted"}`}
                      >
                        {guidedData.school || (
                          <span className="opacity-50 italic">
                            École/Université
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="space-y-4 flex-1">
                    {/* Localisation */}
                    <div
                      className={`transition-all duration-500 transform ${guidedData.location ? "opacity-100 translate-x-0" : "opacity-30 translate-x-2"}`}
                    >
                      <div className="flex items-center gap-2 text-xs text-theme-text-muted mb-1">
                        <MapPin size={12} /> Localisation
                      </div>
                      <p
                        className={`text-sm font-medium transition-all duration-300 ${guidedData.location ? "text-theme-text-secondary" : "text-theme-text-muted"}`}
                      >
                        {guidedData.location ? (
                          <span className="animate-in fade-in slide-in-from-left-2">
                            {guidedData.location}
                          </span>
                        ) : (
                          <span className="opacity-50 italic">
                            Non renseignée
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Dates */}
                    <div
                      className={`transition-all duration-500 transform ${guidedData.start_date ? "opacity-100 translate-x-0" : "opacity-30 translate-x-2"}`}
                    >
                      <div className="flex items-center gap-2 text-xs text-theme-text-muted mb-1">
                        <Calendar size={12} /> Période
                      </div>
                      <p
                        className={`text-sm font-medium transition-all duration-300 ${guidedData.start_date ? "text-theme-text-secondary" : "text-theme-text-muted"}`}
                      >
                        {guidedData.start_date ? (
                          <span className="animate-in fade-in slide-in-from-left-2">
                            {new Date(guidedData.start_date).toLocaleDateString(
                              "fr-FR",
                              { month: "short", year: "numeric" },
                            )}
                            {" - "}
                            {guidedData.is_current !== undefined &&
                              (guidedData.is_current ? (
                                <span className="text-[#FF8C42] font-semibold">
                                  En cours
                                </span>
                              ) : guidedData.end_date ? (
                                new Date(
                                  guidedData.end_date,
                                ).toLocaleDateString("fr-FR", {
                                  month: "short",
                                  year: "numeric",
                                })
                              ) : (
                                <span className="opacity-50 italic">
                                  À compléter
                                </span>
                              ))}
                          </span>
                        ) : (
                          <span className="opacity-50 italic">À compléter</span>
                        )}
                      </p>
                    </div>

                    {/* Domaine d'études */}
                    {guidedData.field_of_study && (
                      <div
                        className={`transition-all duration-500 transform opacity-100 translate-x-0`}
                      >
                        <div className="flex items-center gap-2 text-xs text-theme-text-muted mb-1">
                          <Award size={12} /> Domaine
                        </div>
                        <p className="text-sm font-medium text-theme-text-secondary">
                          <span className="animate-in fade-in slide-in-from-left-2">
                            {guidedData.field_of_study}
                          </span>
                        </p>
                      </div>
                    )}

                    {/* Mention/Note */}
                    {guidedData.grade && (
                      <div
                        className={`transition-all duration-500 transform opacity-100 translate-x-0`}
                      >
                        <div className="flex items-center gap-2 text-xs text-theme-text-muted mb-1">
                          <Award size={12} /> Mention/Note
                        </div>
                        <p className="text-sm font-medium text-theme-text-secondary">
                          <span className="animate-in fade-in slide-in-from-left-2">
                            {guidedData.grade}
                          </span>
                        </p>
                      </div>
                    )}

                    {/* Description */}
                    <div
                      className={`transition-all duration-500 transform ${guidedData.description || (step === 8 && inputValue) ? "opacity-100 translate-x-0" : "opacity-30 translate-x-2"}`}
                    >
                      <div className="flex items-center gap-2 text-xs text-theme-text-muted mb-2">
                        <FileText size={12} /> Description
                      </div>
                      <div
                        className={`p-4 rounded-xl border transition-all duration-500 ${
                          step === 8 && (guidedData.description || inputValue)
                            ? "bg-orange-50/80 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 shadow-sm backdrop-blur-sm"
                            : "bg-theme-bg-secondary/50 border-theme-border/50"
                        }`}
                      >
                        <p
                          className={`text-sm leading-relaxed transition-all duration-300 ${guidedData.description || (step === 8 && inputValue) ? "text-theme-text-secondary" : "text-theme-text-muted"}`}
                        >
                          {guidedData.description ||
                          (step === 8 && inputValue) ? (
                            <span className="animate-in fade-in slide-in-from-left-2">
                              {guidedData.description || inputValue}
                            </span>
                          ) : (
                            <span className="italic opacity-50">
                              Votre description apparaîtra ici...
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 text-center text-[10px] text-theme-text-muted pt-4 border-t border-theme-card-border">
                    Aperçu en temps réel
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
