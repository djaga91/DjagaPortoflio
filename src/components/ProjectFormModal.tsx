import React, { useState, useEffect, useRef } from "react";
import {
  X,
  FileText,
  Sparkles,
  Send,
  Check,
  Rocket,
  Link,
  Github,
  Image as ImageIcon,
  Code,
  Wand2,
  Loader2,
} from "lucide-react";
import { AxiosError } from "axios";
import { useGameStore } from "../store/gameStore";
import { ReformulateWithAI } from "./ReformulateWithAI";
import { VoiceOrTextInput } from "./VoiceOrTextInput";
import { IconSelector } from "./IconSelector";
import { api, projectsAPI } from "../services/api";
import type { ProjectCreate, Project } from "../services/api";
import { normalizeBullet } from "../utils/formatText";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectToEdit?: Project | null;
}

type Mode = "choice" | "form" | "guided";

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  projectToEdit,
}) => {
  const { createProject, updateProject, requireAuth, isAuthenticated } =
    useGameStore();
  const isEditMode = !!projectToEdit;
  const [mode, setMode] = useState<Mode>("choice");

  // États pour le formulaire classique
  const [formData, setFormData] = useState<ProjectCreate>({
    name: "",
    description: "",
    url_demo: "",
    url_github: "",
    url_image: null,
    project_icon: null,
    technologies: [],
    features: [],
    order: 0,
  });

  // État pour le choix image/icône
  const [projectDisplayType, setProjectDisplayType] = useState<
    "image" | "icon"
  >("image");

  // États pour le mode guidé
  const [step, setStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [foxQuestion, setFoxQuestion] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [guidedData, setGuidedData] = useState<Partial<ProjectCreate>>({});
  const [technologiesInput, setTechnologiesInput] = useState("");
  const [featuresInput, setFeaturesInput] = useState("");
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fonction pour générer une description avec l'IA
  const generateDescriptionWithAI = async () => {
    if (!guidedData.name) return;
    if (aiCooldownSeconds > 0) return; // Bloqué en cooldown

    setIsGeneratingAI(true);
    try {
      const response = await api.post("/api/ai/generate-description", {
        entity_type: "project",
        title: guidedData.name,
        organization: "Projet personnel",
        context: undefined,
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
  const TOTAL_STEPS = 6;

  // Réinitialiser quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && projectToEdit) {
        // Mode édition : pré-remplir avec les données existantes
        setMode("form"); // Passer directement au formulaire en mode édition
        setFormData({
          name: projectToEdit.name || "",
          description: projectToEdit.description || "",
          url_demo: projectToEdit.url_demo || "",
          url_github: projectToEdit.url_github || "",
          url_image: projectToEdit.url_image || null,
          project_icon: projectToEdit.project_icon || null,
          technologies: projectToEdit.technologies || [],
          features: projectToEdit.features || [],
          order: projectToEdit.order || 0,
        });
        // Déterminer le type d'affichage selon les données existantes
        if (projectToEdit.project_icon) {
          setProjectDisplayType("icon");
        } else if (projectToEdit.url_image) {
          setProjectDisplayType("image");
        }
        setTechnologiesInput((projectToEdit.technologies || []).join(", "));
        setFeaturesInput((projectToEdit.features || []).join(", "));
      } else {
        // Mode création : réinitialiser
        setMode("choice");
        setStep(0);
        setFormData({
          name: "",
          description: "",
          url_demo: "",
          url_github: "",
          url_image: null,
          project_icon: null,
          technologies: [],
          features: [],
          order: 0,
        });
        setProjectDisplayType("image");
        setGuidedData({});
        setInputValue("");
        setTechnologiesInput("");
        setFeaturesInput("");
        setFoxQuestion(
          "Bonjour ! 🦊 Ajoutons un projet à votre portfolio. Comment s'appelle votre projet ?",
        );
      }
    }
  }, [isOpen, isEditMode, projectToEdit]);

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
    if (!inputValue.trim() && step !== 2 && step !== 3 && step !== 4) return;

    switch (step) {
      case 0: // Nom du projet
        setGuidedData({ ...guidedData, name: inputValue });
        setInputValue("");
        nextStep(`Décrivez ce projet en quelques phrases.`);
        break;

      case 1: // Description
        setGuidedData({
          ...guidedData,
          description: inputValue.trim() || null,
        });
        setInputValue("");
        nextStep(
          `Avez-vous une URL de démo en ligne ? (optionnel, laissez vide si non)`,
        );
        break;

      case 2: // URL Demo
        setGuidedData({ ...guidedData, url_demo: inputValue || null });
        setInputValue("");
        nextStep(`Avez-vous un lien GitHub ? (optionnel, laissez vide si non)`);
        break;

      case 3: // URL GitHub
        setGuidedData({ ...guidedData, url_github: inputValue || null });
        setInputValue("");
        nextStep(
          `Quelles technologies avez-vous utilisées ? (séparées par des virgules, ex: React, Node.js, MongoDB)`,
        );
        break;

      case 4: // Technologies
        const technologies = inputValue
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t);
        setGuidedData({ ...guidedData, technologies });
        setInputValue("");
        nextStep(
          `Quelles sont les fonctionnalités principales ? (séparées par des virgules, ex: Authentification, Dashboard, API REST)`,
        );
        break;

      case 5: // Features (accepte "a, b, c" ou "• a\n• b\n• c")
        const features = inputValue
          .split(/[\n,]+/)
          .map((f) => f.replace(/^[-•]\s*/, "").trim())
          .filter((f) => f);
        const finalData = { ...guidedData, features };
        setGuidedData(finalData);
        await handleSaveGuided(finalData);
        break;
    }
  };

  const handleSaveGuided = async (dataToSave?: Partial<ProjectCreate>) => {
    requireAuth(async () => {
      try {
        const data = dataToSave || guidedData;
        // S'assurer que project_icon et url_image sont correctement gérés
        const finalData = {
          ...data,
          project_icon:
            data.project_icon && data.project_icon.trim()
              ? data.project_icon.trim()
              : null,
          url_image:
            data.url_image && data.url_image.trim()
              ? data.url_image.trim()
              : null,
        };
        if (isEditMode && projectToEdit) {
          await updateProject(projectToEdit.id, finalData as any);
        } else {
          await createProject(finalData as ProjectCreate);
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
        const technologies = technologiesInput
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t);
        const features = featuresInput
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f);
        // Déterminer automatiquement le type selon ce qui est rempli
        const hasIcon = formData.project_icon && formData.project_icon.trim();
        const hasImage = formData.url_image && formData.url_image.trim();
        const finalDisplayType = hasIcon
          ? "icon"
          : hasImage
            ? "image"
            : projectDisplayType;

        // Construire l'objet de mise à jour en incluant explicitement project_icon et url_image
        const dataToSave: any = {
          name: formData.name,
          description: formData.description?.trim() || null,
          url_demo: formData.url_demo?.trim() || null,
          url_github: formData.url_github?.trim() || null,
          technologies,
          features,
          order: formData.order,
        };

        // Inclure explicitement project_icon et url_image selon le type choisi
        if (finalDisplayType === "icon" && hasIcon) {
          dataToSave.project_icon = (formData.project_icon ?? "").trim();
          dataToSave.url_image = null;
        } else if (finalDisplayType === "image" && hasImage) {
          dataToSave.url_image = (formData.url_image ?? "").trim();
          dataToSave.project_icon = null; // Vider l'icône si on met une image
        } else {
          // Si aucun des deux n'est défini, inclure quand même null pour permettre de réinitialiser
          dataToSave.project_icon = null;
          dataToSave.url_image = null;
        }

        if (isEditMode && projectToEdit) {
          await updateProject(projectToEdit.id, dataToSave as any);
        } else {
          await createProject(dataToSave);
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
            {isEditMode ? "Modifier le projet" : "Ajouter un projet"}
          </h2>
          <button
            onClick={onClose}
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
              <div>
                <label className="block text-sm font-semibold text-theme-text-primary mb-2">
                  <Rocket size={16} className="inline mr-2" /> Nom du projet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
                  placeholder="Ex: Application E-commerce"
                />
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
                  placeholder="Décrivez votre projet, ses fonctionnalités principales..."
                  rows={4}
                  className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-theme-text-primary mb-2">
                    <Link size={16} className="inline mr-2" /> URL Démo
                  </label>
                  <input
                    type="url"
                    value={formData.url_demo || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        url_demo: e.target.value || null,
                      })
                    }
                    className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
                    placeholder="https://mon-projet.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-theme-text-primary mb-2">
                    <Github size={16} className="inline mr-2" /> URL GitHub
                  </label>
                  <input
                    type="url"
                    value={formData.url_github || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        url_github: e.target.value || null,
                      })
                    }
                    className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
                    placeholder="https://github.com/user/repo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-theme-text-primary mb-2">
                  <ImageIcon size={16} className="inline mr-2" /> Visuel du
                  projet
                </label>
                <p className="text-xs text-theme-text-muted mb-3">
                  Choisissez entre une image ou une icône/emoji pour représenter
                  votre projet.
                </p>

                {/* Toggle Image/Icône */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setProjectDisplayType("image");
                      setFormData((prev) => ({ ...prev, project_icon: null }));
                    }}
                    className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      projectDisplayType === "image"
                        ? "bg-[#6366F1] text-white shadow-lg"
                        : "bg-theme-bg-secondary text-theme-text-muted hover:bg-theme-bg-secondary/80"
                    }`}
                  >
                    <ImageIcon size={16} className="inline mr-2" />
                    Image
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProjectDisplayType("icon");
                      setFormData((prev) => ({ ...prev, url_image: null }));
                    }}
                    className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      projectDisplayType === "icon"
                        ? "bg-[#6366F1] text-white shadow-lg"
                        : "bg-theme-bg-secondary text-theme-text-muted hover:bg-theme-bg-secondary/80"
                    }`}
                  >
                    🎨 Icône/Emoji
                  </button>
                </div>

                {/* Section Image */}
                {projectDisplayType === "image" && (
                  <div>
                    {isEditMode && projectToEdit && (
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !projectToEdit?.id) return;
                            setIsUploadingImage(true);
                            try {
                              const { url_image } =
                                await projectsAPI.uploadImage(
                                  projectToEdit.id,
                                  file,
                                );
                              setFormData((prev) => ({ ...prev, url_image }));
                            } catch (err) {
                              console.error("Erreur upload image projet:", err);
                              alert(
                                "Erreur lors du téléversement. Vérifiez le format (JPG, PNG, GIF, WEBP) et la taille.",
                              );
                            } finally {
                              setIsUploadingImage(false);
                              e.target.value = "";
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="px-4 py-2 bg-[#6366F1]/10 hover:bg-[#6366F1]/20 text-[#6366F1] rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {isUploadingImage ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Téléversement…
                            </>
                          ) : (
                            <>
                              <ImageIcon size={16} />
                              Téléverser une image
                            </>
                          )}
                        </button>
                        {formData.url_image && (
                          <span className="text-xs text-theme-text-muted">
                            Image actuelle définie
                          </span>
                        )}
                      </div>
                    )}
                    <input
                      type="text"
                      value={formData.url_image || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          url_image: e.target.value || null,
                        })
                      }
                      className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
                      placeholder="URL d'image ou chemin (ex: https://... ou /uploads/...)"
                    />
                  </div>
                )}

                {/* Section Icône */}
                {projectDisplayType === "icon" && (
                  <IconSelector
                    selectedIcon={formData.project_icon || null}
                    onSelectIcon={(iconName) => {
                      setFormData((prev) => ({
                        ...prev,
                        project_icon: iconName || null,
                      }));
                      // S'assurer que projectDisplayType est sur 'icon' quand on sélectionne une icône
                      if (iconName) {
                        setProjectDisplayType("icon");
                      }
                    }}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-theme-text-primary mb-2">
                  <Code size={16} className="inline mr-2" /> Technologies
                </label>
                <input
                  type="text"
                  value={technologiesInput}
                  onChange={(e) => {
                    setTechnologiesInput(e.target.value);
                    const technologies = e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter((t) => t);
                    setFormData({ ...formData, technologies });
                  }}
                  className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
                  placeholder="React, Node.js, MongoDB (séparées par des virgules)"
                />
                {formData.technologies && formData.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-[#6366F1]/10 text-[#6366F1] rounded-lg text-xs font-semibold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-theme-text-primary mb-2">
                  Fonctionnalités principales
                </label>
                <input
                  type="text"
                  value={featuresInput}
                  onChange={(e) => {
                    setFeaturesInput(e.target.value);
                    const features = e.target.value
                      .split(",")
                      .map((f) => f.trim())
                      .filter((f) => f);
                    setFormData({ ...formData, features });
                  }}
                  className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-4 py-3 text-theme-text-primary focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
                  placeholder="Authentification, Dashboard, API REST (séparées par des virgules)"
                />
                {formData.features && formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-[#FF8C42]/10 text-[#FF8C42] rounded-lg text-xs font-semibold"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
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
                        step === 2 ||
                        step === 3 ||
                        step === 4) && (
                        <VoiceOrTextInput
                          value={inputValue}
                          onChange={setInputValue}
                          placeholder={
                            step === 0
                              ? "Ex: Application E-commerce"
                              : step === 2
                                ? "https://mon-projet.com (ou laissez vide)"
                                : step === 3
                                  ? "https://github.com/user/repo (ou laissez vide)"
                                  : "React, Node.js, MongoDB (séparées par des virgules)"
                          }
                          submitDisabled={
                            !inputValue.trim() && step !== 2 && step !== 3
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

                      {step === 1 && (
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
                            placeholder="Décrivez votre projet, ses fonctionnalités principales..."
                            rows={4}
                            submitDisabled={!inputValue.trim()}
                            isAuthenticated={!!isAuthenticated}
                            requireAuth={requireAuth}
                            inputType="text"
                            showSubmitButton={false}
                            entityType="project"
                            descriptionContext={{
                              title: guidedData.name ?? undefined,
                              organization: undefined,
                            }}
                          />
                          <ReformulateWithAI
                            value={inputValue}
                            onTextChange={(newText) => setInputValue(newText)}
                            placeholder="Décrivez votre projet, ses fonctionnalités principales..."
                            rows={4}
                            buttonOnly
                          />
                          <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-[#FF8C42] to-[#FF6B2B] hover:from-[#E07230] hover:to-[#FF8C42] font-bold text-white shadow-xl shadow-orange-200/50 dark:shadow-orange-900/30 text-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl hover:shadow-orange-300/50 dark:hover:shadow-orange-800/30"
                          >
                            Valider{" "}
                            <Check size={20} className="animate-pulse" />
                          </button>
                        </>
                      )}

                      {step === 5 && (
                        <VoiceOrTextInput
                          value={inputValue}
                          onChange={setInputValue}
                          placeholder="Authentification, Dashboard, API REST (une par ligne ou séparées par des virgules)"
                          submitDisabled={!inputValue.trim()}
                          submitLabel={
                            <>
                              Enregistrer <Check size={20} className="inline" />
                            </>
                          }
                          isAuthenticated={!!isAuthenticated}
                          requireAuth={requireAuth}
                          inputType="text"
                          useRewriteAsBullets
                        />
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
                    className={`flex items-start gap-4 border-b-2 border-[#FF8C42]/30 pb-4 mb-6 transition-all duration-500 ${guidedData.name ? "opacity-100" : "opacity-40"}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                        guidedData.name
                          ? "bg-[#FF8C42]/10 border-[#FF8C42]/30 text-[#FF8C42]"
                          : "bg-theme-bg-secondary border-[#FF8C42]/20 text-theme-text-muted"
                      }`}
                    >
                      <Rocket size={24} />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-bold mb-1 transition-all duration-500 ${guidedData.name ? "text-theme-text-primary" : "text-theme-text-muted"}`}
                      >
                        {guidedData.name || (
                          <span className="opacity-50 italic">
                            Nom du projet
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="space-y-4 flex-1">
                    {/* Description */}
                    <div
                      className={`transition-all duration-500 transform ${guidedData.description || (step === 1 && inputValue) ? "opacity-100 translate-x-0" : "opacity-30 translate-x-2"}`}
                    >
                      <div className="flex items-center gap-2 text-xs text-theme-text-muted mb-2">
                        <FileText size={12} /> Description
                      </div>
                      <div
                        className={`p-4 rounded-xl border transition-all duration-500 ${
                          step === 1 && (guidedData.description || inputValue)
                            ? "bg-orange-50/80 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 shadow-sm backdrop-blur-sm"
                            : "bg-theme-bg-secondary/50 border-theme-border/50"
                        }`}
                      >
                        <p
                          className={`text-sm leading-relaxed transition-all duration-300 ${guidedData.description || (step === 1 && inputValue) ? "text-theme-text-secondary" : "text-theme-text-muted"}`}
                        >
                          {guidedData.description ||
                          (step === 1 && inputValue) ? (
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

                    {/* URLs */}
                    {(guidedData.url_demo || guidedData.url_github) && (
                      <div
                        className={`transition-all duration-500 transform opacity-100 translate-x-0`}
                      >
                        <div className="flex items-center gap-2 text-xs text-theme-text-muted mb-1">
                          <Link size={12} /> Liens
                        </div>
                        <div className="space-y-1">
                          {guidedData.url_demo && (
                            <p className="text-xs text-theme-text-secondary truncate">
                              🌐{" "}
                              <a
                                href={guidedData.url_demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#6366F1] hover:underline"
                              >
                                {guidedData.url_demo}
                              </a>
                            </p>
                          )}
                          {guidedData.url_github && (
                            <p className="text-xs text-theme-text-secondary truncate">
                              💻{" "}
                              <a
                                href={guidedData.url_github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#6366F1] hover:underline"
                              >
                                {guidedData.url_github}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Technologies */}
                    {guidedData.technologies &&
                      guidedData.technologies.length > 0 && (
                        <div
                          className={`transition-all duration-500 transform opacity-100 translate-x-0`}
                        >
                          <div className="flex items-center gap-2 text-xs text-theme-text-muted mb-1">
                            <Code size={12} /> Technologies
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {guidedData.technologies.map((tech, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-[#6366F1]/10 text-[#6366F1] rounded-lg text-xs font-semibold"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Features */}
                    {guidedData.features && guidedData.features.length > 0 && (
                      <div
                        className={`transition-all duration-500 transform opacity-100 translate-x-0`}
                      >
                        <div className="flex items-center gap-2 text-xs text-theme-text-muted mb-1">
                          ⭐ Fonctionnalités
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {guidedData.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-[#FF8C42]/10 text-[#FF8C42] rounded-lg text-xs font-semibold"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
