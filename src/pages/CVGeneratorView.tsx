import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  FileDown,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Settings,
  Image,
  Tags,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useGameStore } from "../store/gameStore";
import { cvAPI, CVLayoutItem, CVItemsResponse, API_URL } from "../services/api";
import { CVReserve } from "../components/cv/CVReserve";
import { CVCanvas } from "../components/cv/CVCanvas";
import { A4Page } from "../components/cv/A4Page";
import { ColorPicker } from "../components/cv/ColorPicker";
import { DensityMeter } from "../components/cv/DensityMeter";
import { CompressButton } from "../components/cv/CompressButton";
import { DualColumnDensity } from "../hooks/useDualColumnDensity";
import { SingleColumnDensity } from "../hooks/useSingleColumnDensity";

// Types qui vont dans chaque colonne
const LEFT_COLUMN_TYPES: CVLayoutItem["type"][] = [
  "certification",
  "language",
  "skill",
  "interest",
];
const RIGHT_COLUMN_TYPES: CVLayoutItem["type"][] = [
  "experience",
  "education",
  "project",
  "bio",
];

// Couleurs pour le DragOverlay (avec support dark mode)
const DRAG_COLORS: Record<
  CVLayoutItem["type"],
  { border: string; text: string; iconColor: string }
> = {
  skill: {
    border: "border-emerald-300 dark:border-emerald-600",
    text: "text-emerald-700 dark:text-emerald-300",
    iconColor: "text-emerald-400 dark:text-emerald-500",
  },
  language: {
    border: "border-purple-300 dark:border-purple-600",
    text: "text-purple-700 dark:text-purple-300",
    iconColor: "text-purple-400 dark:text-purple-500",
  },
  certification: {
    border: "border-orange-300 dark:border-orange-600",
    text: "text-orange-700 dark:text-orange-300",
    iconColor: "text-orange-400 dark:text-orange-500",
  },
  interest: {
    border: "border-purple-300 dark:border-purple-600",
    text: "text-purple-700 dark:text-purple-300",
    iconColor: "text-purple-400 dark:text-purple-500",
  },
  experience: {
    border: "border-blue-300 dark:border-blue-600",
    text: "text-blue-700 dark:text-blue-300",
    iconColor: "text-blue-400 dark:text-blue-500",
  },
  education: {
    border: "border-teal-300 dark:border-teal-600",
    text: "text-teal-700 dark:text-teal-300",
    iconColor: "text-teal-400 dark:text-teal-500",
  },
  project: {
    border: "border-rose-300 dark:border-rose-600",
    text: "text-rose-700 dark:text-rose-300",
    iconColor: "text-rose-400 dark:text-rose-500",
  },
  bio: {
    border: "border-indigo-300 dark:border-indigo-600",
    text: "text-indigo-700 dark:text-indigo-300",
    iconColor: "text-indigo-400 dark:text-indigo-500",
  },
};

// Composant pour afficher l'item dans le DragOverlay
const DragItemPreview: React.FC<{
  type: CVLayoutItem["type"];
  label: string;
}> = ({ type, label }) => {
  const colors = DRAG_COLORS[type] || DRAG_COLORS.skill;

  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg border-2 bg-theme-card shadow-theme-xl ${colors.border}`}
      style={{ width: "300px", maxWidth: "90vw" }}
    >
      <div className="flex-shrink-0 pointer-events-none">
        <GripVertical size={16} className={colors.iconColor} />
      </div>
      <div className="flex-1 min-w-0 pointer-events-none">
        <p className={`text-sm font-medium truncate ${colors.text}`}>{label}</p>
      </div>
    </div>
  );
};

export const CVGeneratorView: React.FC = () => {
  const { setView, setActiveToast } = useGameStore();

  const [cvItems, setCvItems] = useState<CVItemsResponse | null>(null);
  const [layout, setLayout] = useState<CVLayoutItem[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Vérifier si un template a été sélectionné OU si on ouvre un CV existant pour édition
  useEffect(() => {
    const templateFromStorage = localStorage.getItem("selected_cv_template");
    const editingCvId = localStorage.getItem("editing_cv_id");
    if (!templateFromStorage && !editingCvId) {
      setView("cv_template_selection");
      setShouldRedirect(true);
      return;
    }
    setShouldRedirect(false);
  }, [setView]);

  // Template initial : sélection depuis la page de choix, ou template du CV en édition
  const getInitialTemplate = (): string => {
    const fromSelection = localStorage.getItem("selected_cv_template");
    if (fromSelection) return fromSelection;
    const fromEdit = localStorage.getItem("editing_cv_template");
    if (fromEdit) return fromEdit;
    return "modern";
  };

  const [selectedTemplate, setSelectedTemplate] = useState(getInitialTemplate);
  const [primaryColor, setPrimaryColor] = useState("#2563eb"); // Couleur par défaut (bleu)
  const [jobTitle] = useState("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [appliedZoom, setAppliedZoom] = useState<number | undefined>(undefined); // Zoom appliqué lors de la dernière génération
  const [previewZoom, setPreviewZoom] = useState<number>(1.0); // Zoom appliqué au preview HTML
  const [layoutKey, setLayoutKey] = useState<number>(0); // Clé pour forcer le recalcul de useDualColumnDensity
  const [
    hasModificationsSinceLastGenerate,
    setHasModificationsSinceLastGenerate,
  ] = useState(true);
  const [editingCvId, setEditingCvId] = useState<string | null>(() =>
    localStorage.getItem("editing_cv_id"),
  );
  const [cvName, setCvName] = useState<string>(
    () => localStorage.getItem("editing_cv_name") || "",
  );

  // Synchroniser editing_cv_id et cv_name depuis le localStorage au montage (quand on arrive depuis Mes Documents)
  useEffect(() => {
    const storedId = localStorage.getItem("editing_cv_id");
    const storedName = localStorage.getItem("editing_cv_name");
    if (storedId) setEditingCvId(storedId);
    if (storedName !== null && storedName !== undefined) setCvName(storedName);
  }, []);

  // Paramètres avancés
  const [showPhoto, setShowPhoto] = useState<boolean>(true); // Par défaut, afficher la photo
  const [showSkillsOnItems, setShowSkillsOnItems] = useState<boolean>(true); // Par défaut, afficher les compétences sur les projets/expériences
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] =
    useState<boolean>(false);

  // États pour le drag & drop
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<
    CVLayoutItem["type"] | undefined
  >();
  const [, setActiveZone] = useState<"left" | "right" | null>(null);
  const [activeItem, setActiveItem] = useState<{
    type: CVLayoutItem["type"];
    id: string;
    label: string;
  } | null>(null);

  // État pour la densité (sera mis à jour par A4Page)
  const [density, setDensity] = useState<
    DualColumnDensity | SingleColumnDensity
  >({
    left: 0,
    right: 0,
    global: 0,
    isOverflowing: false,
    overflowingColumn: null,
    leftHeight: 0,
    rightHeight: 0,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Démarrer le drag après 8px de mouvement
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Charger les items disponibles et les préférences sauvegardées
  useEffect(() => {
    // Ne pas charger si on doit rediriger
    if (shouldRedirect) {
      return;
    }

    const loadItemsAndPreferences = async () => {
      try {
        // 1. Charger les items disponibles
        const items = await cvAPI.listItems();
        setCvItems(items);

        // 2. Essayer de charger les préférences sauvegardées
        let savedPreferences = null;
        try {
          savedPreferences = await cvAPI.getPreferences();
        } catch {
          // Aucune préférence sauvegardée
        }

        // 3. Construire layout initial
        let initialLayout: CVLayoutItem[] = [];

        // Vérifier d'abord si on a un template depuis localStorage (choix depuis page de sélection)
        const templateFromStorage = localStorage.getItem(
          "selected_cv_template",
        );

        if (templateFromStorage) {
          // Template choisi depuis la page de sélection - l'utiliser et nettoyer
          // Ne pas charger les préférences sauvegardées pour le template (utiliser celui choisi)
          localStorage.removeItem("selected_cv_template");

          if (
            savedPreferences &&
            savedPreferences.layout &&
            savedPreferences.layout.length > 0
          ) {
            initialLayout = savedPreferences.layout;
            // S'assurer que la bio est toujours incluse
            if (!initialLayout.some((item) => item.type === "bio")) {
              initialLayout.unshift({ type: "bio", id: "bio" });
            }
          }
          if (savedPreferences && savedPreferences.primary_color) {
            setPrimaryColor(savedPreferences.primary_color);
          }
          // Le template est déjà défini dans selectedTemplate depuis getInitialTemplate()
        } else if (
          savedPreferences &&
          savedPreferences.layout &&
          savedPreferences.layout.length > 0
        ) {
          // Pas de template dans localStorage - ne PAS charger le template depuis préférences
          // Forcer l'utilisateur à passer par la page de sélection
          initialLayout = savedPreferences.layout;
          // S'assurer que la bio est toujours incluse
          if (!initialLayout.some((item) => item.type === "bio")) {
            initialLayout.unshift({ type: "bio", id: "bio" });
          }
          // Ne PAS charger le template - on utilisera celui choisi dans localStorage
          if (savedPreferences.primary_color) {
            setPrimaryColor(savedPreferences.primary_color);
          }
        } else {
          // Utiliser la sélection par défaut
          // Toujours ajouter la bio par défaut pour avoir une idée du template
          initialLayout.push({ type: "bio", id: "bio" });

          if (
            items.experiences.selected &&
            items.experiences.selected.length > 0
          ) {
            items.experiences.selected.forEach((id: string) => {
              initialLayout.push({ type: "experience", id });
            });
          }

          if (items.education.selected && items.education.selected.length > 0) {
            items.education.selected.forEach((id: string) => {
              initialLayout.push({ type: "education", id });
            });
          }

          if (items.projects.selected && items.projects.selected.length > 0) {
            items.projects.selected.forEach((id: string) => {
              initialLayout.push({ type: "project", id });
            });
          }

          if (items.languages.selected && items.languages.selected.length > 0) {
            items.languages.selected.forEach((id: string) => {
              initialLayout.push({ type: "language", id });
            });
          }

          if (
            items.certifications.selected &&
            items.certifications.selected.length > 0
          ) {
            items.certifications.selected.forEach((id: string) => {
              initialLayout.push({ type: "certification", id });
            });
          }

          if (
            items.interests &&
            items.interests.selected &&
            items.interests.selected.length > 0
          ) {
            items.interests.selected.forEach((id: string) => {
              initialLayout.push({ type: "interest", id });
            });
          }

          if (items.skills.selected && items.skills.selected.length > 0) {
            items.skills.selected.forEach((id: string) => {
              initialLayout.push({ type: "skill", id });
            });
          }

          // Ne pas charger le template depuis savedPreferences - forcer le passage par la page de sélection
          if (savedPreferences && savedPreferences.primary_color) {
            setPrimaryColor(savedPreferences.primary_color);
          }
        }

        setLayout(initialLayout);
      } catch (err) {
        console.error("Erreur chargement items CV:", err);
        setActiveToast({
          icon: "❌",
          title: "Erreur",
          message: "Impossible de charger les éléments du CV",
          type: "error",
          points: 0,
        });
      }
    };

    loadItemsAndPreferences();
  }, [setActiveToast]);

  // Marquer des modifications dès que layout, template, couleur, nom, photo ou compétences changent
  useEffect(() => {
    setHasModificationsSinceLastGenerate(true);
  }, [
    layout,
    selectedTemplate,
    primaryColor,
    cvName,
    showPhoto,
    showSkillsOnItems,
  ]);

  // Sauvegarder automatiquement les préférences quand le layout change (avec debounce)
  useEffect(() => {
    if (!cvItems || layout.length === 0) return;

    const timeoutId = setTimeout(async () => {
      try {
        await cvAPI.savePreferences({
          template: selectedTemplate,
          primary_color: primaryColor,
          layout: layout,
        });
      } catch (err) {
        console.error("Erreur sauvegarde préférences:", err);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [layout, selectedTemplate, primaryColor, cvItems]);

  // Générer le preview HTML
  const generatePreview = useCallback(async () => {
    if (!layout.length) {
      setPreviewHtml("");
      return;
    }

    // Conserver le zoom actuel avant de régénérer le preview
    const currentZoom = previewZoom;

    setIsLoadingPreview(true);
    // NE PAS réinitialiser le zoom ici - il sera conservé si l'utilisateur l'a appliqué
    // Le zoom ne sera réinitialisé que si le layout change vraiment (via useEffect)
    try {
      const response = await cvAPI.preview(
        { layout, job_title: jobTitle || undefined },
        selectedTemplate,
        primaryColor,
        undefined, // secondary_color
        showPhoto,
        showSkillsOnItems,
      );
      const htmlContent = response.html || "";
      if (!htmlContent || htmlContent.length === 0) {
        console.error("⚠️ Le HTML reçu est vide !");
      }
      setPreviewHtml(htmlContent);

      // Réappliquer le zoom après que le nouveau HTML soit généré
      // IMPORTANT : Le useEffect dans A4Page surveille maintenant children, donc le zoom sera réappliqué automatiquement
      // Mais on doit quand même s'assurer que previewZoom est bien défini
      if (currentZoom < 1.0) {
        // Ne pas réinitialiser previewZoom, il est déjà à la bonne valeur
        // Le useEffect dans A4Page se déclenchera automatiquement quand children change
        // Attendre que le HTML soit injecté et que le zoom soit appliqué
        setTimeout(() => {
          // Forcer le recalcul des pourcentages APRÈS que le zoom CSS soit appliqué
          setLayoutKey((prev) => prev + 1);
        }, 400); // Délai pour laisser le temps au HTML d'être injecté et au zoom d'être appliqué
      } else {
        // Même sans zoom, forcer le recalcul des pourcentages après la génération
        setTimeout(() => {
          setLayoutKey((prev) => prev + 1);
        }, 150);
      }
    } catch (err) {
      console.error("❌ Erreur génération preview:", err);
      setActiveToast({
        icon: "❌",
        title: "Erreur",
        message: "Impossible de générer la prévisualisation",
        type: "error",
        points: 0,
      });
      setPreviewHtml(""); // S'assurer que previewHtml est vide en cas d'erreur
    } finally {
      setIsLoadingPreview(false);
    }
  }, [
    layout,
    jobTitle,
    selectedTemplate,
    primaryColor,
    setActiveToast,
    previewZoom,
    showPhoto,
    showSkillsOnItems,
  ]);

  // Générer le preview au chargement et quand layout change
  // NE PAS réinitialiser le zoom ici - il sera conservé si l'utilisateur l'a appliqué
  // Le zoom ne sera réinitialisé que si l'utilisateur le fait manuellement ou si le layout devient vide
  const prevLayoutRef = useRef<string>("");

  useEffect(() => {
    const layoutKeyString = layout
      .map((item) => `${item.type}-${item.id}`)
      .join(",");
    const layoutChanged = prevLayoutRef.current !== layoutKeyString;

    if (layout.length > 0) {
      // Générer le preview seulement si le layout a vraiment changé
      if (layoutChanged) {
        generatePreview();
        prevLayoutRef.current = layoutKeyString;
      }
      // Pas de log si le layout n'a pas changé (réduire la verbosité)
    } else {
      // Si le layout est vide, réinitialiser le zoom
      setPreviewZoom(1.0);
      setAppliedZoom(undefined);
      setPreviewHtml("");
      prevLayoutRef.current = "";
    }
  }, [layout, generatePreview]);

  // Régénérer le preview quand la couleur ou le template change
  const prevColorRef = useRef<string>(primaryColor);
  const prevTemplateRef = useRef<string>(selectedTemplate);

  useEffect(() => {
    if (layout.length > 0) {
      const colorChanged = prevColorRef.current !== primaryColor;
      const templateChanged = prevTemplateRef.current !== selectedTemplate;

      if (colorChanged || templateChanged) {
        generatePreview();
        prevColorRef.current = primaryColor;
        prevTemplateRef.current = selectedTemplate;
      }
    }
  }, [primaryColor, selectedTemplate, layout.length, generatePreview]);

  // Régénérer le preview quand les paramètres avancés changent
  const prevShowPhotoRef = useRef<boolean>(showPhoto);
  const prevShowSkillsOnItemsRef = useRef<boolean>(showSkillsOnItems);

  useEffect(() => {
    if (layout.length > 0) {
      const photoChanged = prevShowPhotoRef.current !== showPhoto;
      const skillsChanged =
        prevShowSkillsOnItemsRef.current !== showSkillsOnItems;

      if (photoChanged || skillsChanged) {
        generatePreview();
        prevShowPhotoRef.current = showPhoto;
        prevShowSkillsOnItemsRef.current = showSkillsOnItems;
      }
    }
  }, [showPhoto, showSkillsOnItems, layout.length, generatePreview]);

  // Gérer le drag & drop
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);

    // Déterminer le type de l'élément draggé et récupérer ses infos
    const activeIdStr = event.active.id.toString();
    if (activeIdStr.startsWith("reserve-")) {
      const parts = activeIdStr.split("-");
      if (parts.length >= 3) {
        const type = parts[1] as CVLayoutItem["type"];
        const id = parts.slice(2).join("-");
        setDraggingType(type);

        // Récupérer le label depuis cvItems
        if (cvItems) {
          let label = "";
          switch (type) {
            case "skill":
              const skill = cvItems.skills.items.find((s) => s.id === id);
              label = skill?.name || "";
              break;
            case "language":
              const lang = cvItems.languages.items.find((l) => l.id === id);
              label = lang ? `${lang.name} (${lang.level})` : "";
              break;
            case "certification":
              const cert = cvItems.certifications.items.find(
                (c) => c.id === id,
              );
              label = cert ? `${cert.name} - ${cert.issuer}` : "";
              break;
            case "interest":
              const interest = cvItems.interests?.items.find(
                (i) => i.id === id,
              );
              label = interest?.name || "";
              break;
            case "experience":
              const exp = cvItems.experiences.items.find((e) => e.id === id);
              label = exp ? `${exp.title} - ${exp.company}` : "";
              break;
            case "education":
              const edu = cvItems.education.items.find((e) => e.id === id);
              label = edu ? `${edu.degree} - ${edu.school}` : "";
              break;
            case "project":
              const proj = cvItems.projects.items.find((p) => p.id === id);
              label = proj?.name || "";
              break;
          }
          setActiveItem({ type, id, label });
        }
      }
    } else if (activeIdStr.startsWith("canvas-")) {
      const item = layout.find(
        (item) => `canvas-${item.type}-${item.id}` === activeIdStr,
      );
      if (item) {
        setDraggingType(item.type);
        // Pour les items du canvas, on peut récupérer le label de la même manière
        if (cvItems) {
          let label = "";
          switch (item.type) {
            case "skill":
              const skill = cvItems.skills.items.find((s) => s.id === item.id);
              label = skill?.name || "";
              break;
            case "language":
              const lang = cvItems.languages.items.find(
                (l) => l.id === item.id,
              );
              label = lang ? `${lang.name} (${lang.level})` : "";
              break;
            case "certification":
              const cert = cvItems.certifications.items.find(
                (c) => c.id === item.id,
              );
              label = cert ? `${cert.name} - ${cert.issuer}` : "";
              break;
            case "interest":
              const interest = cvItems.interests?.items.find(
                (i) => i.id === item.id,
              );
              label = interest?.name || "";
              break;
            case "experience":
              const exp = cvItems.experiences.items.find(
                (e) => e.id === item.id,
              );
              label = exp ? `${exp.title} - ${exp.company}` : "";
              break;
            case "education":
              const edu = cvItems.education.items.find((e) => e.id === item.id);
              label = edu ? `${edu.degree} - ${edu.school}` : "";
              break;
            case "project":
              const proj = cvItems.projects.items.find((p) => p.id === item.id);
              label = proj?.name || "";
              break;
          }
          setActiveItem({ type: item.type, id: item.id, label });
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggingType(undefined);
    setActiveZone(null);
    setActiveItem(null);

    // Si on drop depuis la réserve
    if (typeof active.id === "string" && active.id.startsWith("reserve-")) {
      const parts = active.id.split("-");
      if (parts.length >= 3) {
        const type = parts[1] as CVLayoutItem["type"];
        const id = parts.slice(2).join("-");

        // Vérifier si l'élément n'est pas déjà dans le layout
        const alreadyExists = layout.some(
          (item) => item.type === type && item.id === id,
        );
        if (alreadyExists) {
          setActiveToast({
            icon: "⚠️",
            title: "Déjà ajouté",
            message: "Cet élément est déjà dans votre CV",
            type: "warning",
            points: 0,
          });
          return;
        }

        // Vérifier qu'on drop bien sur une zone de drop valide
        if (
          !over ||
          (over.id !== "drop-zone-left" && over.id !== "drop-zone-right")
        ) {
          // Pas de drop sur une zone valide, on ne fait rien
          return;
        }

        // Conserver le zoom actuel avant d'ajouter l'élément
        const currentZoom = previewZoom;

        // Vérifier si on drop dans la bonne zone
        if (over.id === "drop-zone-left") {
          if (LEFT_COLUMN_TYPES.includes(type)) {
            const newItem: CVLayoutItem = { type, id };
            setLayout([...layout, newItem]);
            // Attendre que le preview soit régénéré, puis réappliquer le zoom et forcer le recalcul
            // Le generatePreview gère déjà la réapplication du zoom, mais on force aussi ici pour être sûr
            setTimeout(() => {
              if (currentZoom < 1.0) {
                setPreviewZoom(currentZoom);
                // Attendre un peu plus pour que le zoom soit appliqué avant de recalculer
                setTimeout(() => {
                  setLayoutKey((prev) => prev + 1);
                }, 100);
              } else {
                // Même sans zoom, forcer le recalcul après l'ajout
                setLayoutKey((prev) => prev + 1);
              }
            }, 250);
            setActiveToast({
              icon: "✅",
              title: "Élément ajouté",
              message: `${type} ajouté à la colonne gauche`,
              type: "success",
              points: 0,
            });
          } else {
            setActiveToast({
              icon: "⚠️",
              title: "Zone incorrecte",
              message: "Cet élément doit aller dans la colonne de droite",
              type: "warning",
              points: 0,
            });
          }
        } else if (over.id === "drop-zone-right") {
          if (RIGHT_COLUMN_TYPES.includes(type)) {
            const newItem: CVLayoutItem = { type, id };
            setLayout([...layout, newItem]);
            // Attendre que le preview soit régénéré, puis réappliquer le zoom et forcer le recalcul
            // Le generatePreview gère déjà la réapplication du zoom, mais on force aussi ici pour être sûr
            setTimeout(() => {
              if (currentZoom < 1.0) {
                setPreviewZoom(currentZoom);
                // Attendre que le zoom CSS soit appliqué avant de recalculer les pourcentages
                // Le useEffect dans A4Page applique le zoom, donc on attend un peu plus
                setTimeout(() => {
                  setLayoutKey((prev) => prev + 1);
                }, 200); // Délai plus long pour s'assurer que le zoom CSS est appliqué
              } else {
                // Même sans zoom, forcer le recalcul après l'ajout
                setTimeout(() => {
                  setLayoutKey((prev) => prev + 1);
                }, 150);
              }
            }, 250);
            setActiveToast({
              icon: "✅",
              title: "Élément ajouté",
              message: `${type} ajouté à la colonne principale`,
              type: "success",
              points: 0,
            });
          } else {
            setActiveToast({
              icon: "⚠️",
              title: "Zone incorrecte",
              message: "Cet élément doit aller dans la colonne de gauche",
              type: "warning",
              points: 0,
            });
          }
        }
      }
      return;
    }

    // Si on réorganise les éléments déjà sur le canvas
    // TODO: Implémenter la réorganisation interne
  };

  // Générer le PDF
  const handleGeneratePDF = async (smartScale?: boolean) => {
    setIsGenerating(true);
    setGeneratedUrl(null);

    const shouldUseSmartScale = smartScale === true || previewZoom < 1.0;

    try {
      // Toujours lire depuis localStorage au moment de l'envoi pour être sûr (navigation depuis Mes Documents)
      const currentEditingId =
        localStorage.getItem("editing_cv_id") || editingCvId || null;
      const currentCvName = cvName && cvName.trim() ? cvName.trim() : null;
      const body: {
        layout: typeof layout;
        job_title?: string;
        cv_name: string | null;
        replace_cv_id: string | null;
      } = {
        layout,
        job_title: jobTitle || undefined,
        cv_name: currentCvName,
        replace_cv_id: currentEditingId,
      };
      const response = await cvAPI.generate(
        body,
        selectedTemplate,
        "pdf",
        primaryColor,
        undefined,
        shouldUseSmartScale,
        previewZoom < 1.0 ? previewZoom : undefined,
        showPhoto,
        showSkillsOnItems,
      );

      // Convertir l'URL relative en URL absolue
      const absoluteUrl = response.cv_url.startsWith("http")
        ? response.cv_url
        : `${API_URL}${response.cv_url}`;

      setGeneratedUrl(absoluteUrl);

      // IMPORTANT : Ne PAS modifier previewZoom ici - il doit rester inchangé pour le preview
      // On stocke seulement appliedZoom pour l'affichage dans CompressButton
      // Mais pour DensityMeter, on utilisera previewZoom si < 1.0
      if (response.applied_zoom !== undefined) {
        setAppliedZoom(response.applied_zoom);
      } else if (shouldUseSmartScale) {
        // Si smart_scale était activé mais pas de zoom retourné, utiliser celui du preview
        setAppliedZoom(previewZoom);
      } else {
        setAppliedZoom(1.0); // Pas de réduction = 100%
      }

      // Message avec information sur le zoom appliqué
      let message = "Votre CV a été généré avec succès";
      if (shouldUseSmartScale && response.applied_zoom !== undefined) {
        const zoomPercent = Math.round(response.applied_zoom * 100);
        if (zoomPercent < 100) {
          if (zoomPercent <= 85) {
            message = `CV généré avec réduction maximale (${zoomPercent}%). Le texte est à la limite de lisibilité.`;
          } else {
            message = `CV généré avec réduction intelligente (${zoomPercent}%) pour faire rentrer sur 1 page.`;
          }
        } else {
          message =
            "CV généré. Le contenu rentre déjà sur 1 page sans réduction.";
        }
      }

      setHasModificationsSinceLastGenerate(false);
      setActiveToast({
        icon: "✅",
        title: "CV généré !",
        message: message,
        type: "success",
        points: 0,
      });
    } catch (err: unknown) {
      console.error("Erreur génération PDF:", err);

      // Vérifier si c'est une erreur de limite (429)
      let errorMessage = "Impossible de générer le PDF";
      let errorTitle = "Erreur";

      // Type guard pour les erreurs Axios
      const axiosError = err as {
        response?: {
          status?: number;
          data?: { detail?: string | { message?: string; limit?: number } };
        };
      };

      if (axiosError?.response?.status === 429) {
        const detail = axiosError.response?.data?.detail;
        errorTitle = "Limite atteinte";
        if (typeof detail === "object" && detail !== null) {
          errorMessage =
            detail.message ||
            `Vous avez atteint votre limite mensuelle de ${detail.limit || 2} CV. Passez à Pro pour des générations illimitées.`;
        } else {
          errorMessage = String(detail) || errorMessage;
        }
      } else if (axiosError?.response?.data?.detail) {
        const detail = axiosError.response.data.detail;
        errorMessage =
          typeof detail === "string"
            ? detail
            : (typeof detail === "object" && detail !== null
                ? detail.message
                : undefined) || errorMessage;
      }

      setActiveToast({
        icon: "❌",
        title: errorTitle,
        message: errorMessage,
        type: "error",
        points: 0,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Compression intelligente (Smart Scaling) - Applique le zoom au preview
  const handleCompress = useCallback(
    async (smartScale: boolean) => {
      if (!smartScale) return;

      // Calculer le zoom optimal pour faire rentrer le contenu
      // IMPORTANT : Utiliser la même valeur A4_HEIGHT_PX que le backend et le frontend pour cohérence
      const A4_HEIGHT_PX = 1123; // Hauteur exacte A4 (297mm = 1123px à 96 DPI) - Même valeur partout
      const MIN_ZOOM = 0.85;

      // Attendre que le DOM soit prêt
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Trouver le conteneur CV dans le preview
      const previewContainer = document.querySelector(
        ".cv-preview-container .cv-container",
      ) as HTMLElement;
      if (!previewContainer) {
        console.warn("Conteneur CV non trouvé");
        setActiveToast({
          icon: "⚠️",
          title: "Erreur",
          message: "Impossible de trouver le conteneur CV",
          type: "error",
          points: 0,
        });
        return;
      }

      // Mesurer la hauteur totale (comme useDualColumnDensity) - incluant padding et header
      const measureTotalHeight = () => {
        // IMPORTANT : Réinitialiser temporairement le zoom pour mesurer la hauteur originale
        // Car useDualColumnDensity mesure toujours la hauteur originale (sans zoom)
        const currentTransform = previewContainer.style.transform;
        const currentWidth = previewContainer.style.width;
        previewContainer.style.transform = "";
        previewContainer.style.width = "";
        previewContainer.offsetHeight; // Force reflow

        // Attendre un peu pour que le reflow soit complet
        // (nécessaire car le transform: scale() peut affecter le layout)
        previewContainer.offsetHeight; // Force reflow supplémentaire

        // IMPORTANT : Utiliser EXACTEMENT la même méthode que le backend
        // Le backend mesure simplement container.scrollHeight qui inclut déjà TOUT
        // (padding, header, compétences, expériences, projets, éducation, etc.)
        previewContainer.offsetHeight; // Force reflow
        const containerScrollHeight = previewContainer.scrollHeight;

        const leftCol = previewContainer.querySelector(
          ".cv-sidebar",
        ) as HTMLElement;
        const rightCol = previewContainer.querySelector(
          ".cv-main",
        ) as HTMLElement;

        let maxHeight: number;
        let leftTotalHeight: number;
        let rightTotalHeight: number;

        // Détecter single column : pas de sidebar (le template LaTeX a cv-main mais pas cv-sidebar)
        const isSingleColumn = !leftCol;

        if (isSingleColumn) {
          // Template single column (LaTeX) : utiliser container.scrollHeight (comme le backend)
          // scrollHeight inclut déjà tout : padding + header + body (compétences, exp, projets, etc.)
          maxHeight = containerScrollHeight;
          leftTotalHeight = containerScrollHeight;
          rightTotalHeight = containerScrollHeight;
        } else {
          // Template dual column (modern) : utiliser le calcul manuel (méthode existante qui fonctionne)
          const computedStyle = window.getComputedStyle(previewContainer);
          let containerPaddingTop = parseFloat(computedStyle.paddingTop) || 0;
          let containerPaddingBottom =
            parseFloat(computedStyle.paddingBottom) || 0;

          if (containerPaddingTop === 0) {
            containerPaddingTop = 45.35; // 12mm par défaut
          }
          if (containerPaddingBottom === 0) {
            containerPaddingBottom = 22.675; // 6mm par défaut
          }

          const header = previewContainer.querySelector(
            ".cv-header",
          ) as HTMLElement;
          const headerHeight = header
            ? header.offsetHeight || header.getBoundingClientRect().height || 0
            : 0;

          const leftColHeight = leftCol ? leftCol.scrollHeight : 0;
          const rightColHeight = rightCol ? rightCol.scrollHeight : 0;
          leftTotalHeight =
            containerPaddingTop +
            headerHeight +
            leftColHeight +
            containerPaddingBottom;
          rightTotalHeight =
            containerPaddingTop +
            headerHeight +
            rightColHeight +
            containerPaddingBottom;
          maxHeight = Math.max(leftTotalHeight, rightTotalHeight);
        }

        // Restaurer le zoom
        previewContainer.style.transform = currentTransform;
        previewContainer.style.width = currentWidth;

        // Retourner les hauteurs pour calculer le zoom optimal
        return { maxHeight, leftTotalHeight, rightTotalHeight };
      };

      const heightData = measureTotalHeight();
      const { maxHeight, leftTotalHeight, rightTotalHeight } = heightData;

      // Calculer les pourcentages actuels (sans zoom)
      const leftPct = (leftTotalHeight / A4_HEIGHT_PX) * 100;
      const rightPct = (rightTotalHeight / A4_HEIGHT_PX) * 100;
      const maxPct = Math.max(leftPct, rightPct);

      // Si ça rentre déjà (<= 100%), pas besoin de réduire
      if (maxPct <= 100) {
        setActiveToast({
          icon: "✅",
          title: "Déjà optimisé",
          message: "Le contenu rentre déjà sur 1 page",
          type: "success",
          points: 0,
        });
        return;
      }

      // OPTIMISATION : Calculer le zoom optimal pour que la colonne la plus haute soit exactement à 100%
      // Utiliser la même méthode que le template modern qui fonctionne bien
      // On veut : maxHeight * optimalZoom = A4_HEIGHT_PX
      // Donc : optimalZoom = A4_HEIGHT_PX / maxHeight
      const optimalZoom = A4_HEIGHT_PX / maxHeight;

      // Limiter entre MIN_ZOOM et 1.0
      let finalZoom = Math.max(MIN_ZOOM, Math.min(1.0, optimalZoom));

      // Si le zoom optimal est très proche de 1.0 (différence < 0.5%), on garde 1.0
      if (Math.abs(optimalZoom - 1.0) < 0.005) {
        finalZoom = 1.0;
      }

      // Vérifier les pourcentages après zoom
      const leftPctAfterZoom =
        ((leftTotalHeight * finalZoom) / A4_HEIGHT_PX) * 100;
      const rightPctAfterZoom =
        ((rightTotalHeight * finalZoom) / A4_HEIGHT_PX) * 100;
      const maxPctAfterZoom = Math.max(leftPctAfterZoom, rightPctAfterZoom);

      // Vérification : le maxPctAfterZoom devrait être exactement à 100% (ou très proche)
      if (maxPctAfterZoom > 100.5) {
        console.warn(
          `⚠️ Le zoom ne réduit pas assez : maxPctAfterZoom = ${maxPctAfterZoom.toFixed(1)}%`,
        );
        // Ajuster le zoom pour être sûr que le max soit à 100%
        finalZoom = A4_HEIGHT_PX / maxHeight;
      }

      // Appliquer le zoom final
      setPreviewZoom(finalZoom);
      setAppliedZoom(finalZoom);

      // Forcer le recalcul des pourcentages après un délai suffisant
      // Le délai doit être suffisant pour que :
      // 1. Le transform: scale() soit appliqué par A4Page
      // 2. Le DOM soit mis à jour
      // 3. useDualColumnDensity puisse mesurer la hauteur originale (sans zoom)
      setTimeout(() => {
        // Déclencher un recalcul en forçant un reflow
        const container = document.querySelector(
          ".cv-preview-container .cv-container",
        ) as HTMLElement;
        if (container) {
          container.offsetHeight; // Force reflow
        }
        // Force recalculation en incrémentant layoutKey
        setLayoutKey((prev) => prev + 1);
      }, 500);

      // Message de confirmation
      const effectivePercentage = maxPctAfterZoom;
      const zoomPercent = Math.round(finalZoom * 100);

      if (finalZoom <= MIN_ZOOM) {
        setActiveToast({
          icon: "⚠️",
          title: "Réduction maximale",
          message: `Zoom appliqué: ${zoomPercent}% (limite de lisibilité atteinte). Remplissage: ${Math.round(effectivePercentage)}%`,
          type: "warning",
          points: 0,
        });
      } else if (effectivePercentage <= 100) {
        setActiveToast({
          icon: "✅",
          title: "Optimisation réussie",
          message: `Le contenu est maintenant à ${Math.round(effectivePercentage)}% (zoom: ${zoomPercent}%)`,
          type: "success",
          points: 0,
        });
      } else {
        setActiveToast({
          icon: "✅",
          title: "Optimisation appliquée",
          message: `Zoom: ${zoomPercent}% → Remplissage: ${Math.round(effectivePercentage)}%`,
          type: "success",
          points: 0,
        });
      }
    },
    [previewZoom, setActiveToast],
  );

  // Fonction pour réinitialiser le zoom
  const handleResetZoom = useCallback(() => {
    setPreviewZoom(1.0);
    setAppliedZoom(undefined);
    setActiveToast({
      icon: "🔄",
      title: "Taille réinitialisée",
      message: "Le CV est revenu à sa taille normale (100%)",
      type: "success",
      points: 0,
    });
  }, [setActiveToast]);

  // Si on doit rediriger, ne rien afficher
  if (shouldRedirect) {
    return null;
  }

  // Supprimer un élément du layout
  const handleRemoveItem = (type: CVLayoutItem["type"], id: string) => {
    // Conserver le zoom actuel avant de retirer l'élément
    const currentZoom = previewZoom;

    const newLayout = layout.filter(
      (item) => !(item.type === type && item.id === id),
    );

    setLayout(newLayout);

    // Le useEffect qui surveille layout va automatiquement régénérer le preview
    // Mais on force aussi le recalcul immédiatement
    setLayoutKey((prev) => prev + 1);

    // Attendre que le preview soit régénéré, puis réappliquer le zoom et forcer le recalcul
    setTimeout(() => {
      if (currentZoom < 1.0) {
        setPreviewZoom(currentZoom);
        // Attendre que le zoom CSS soit appliqué avant de recalculer les pourcentages
        setTimeout(() => {
          setLayoutKey((prev) => prev + 1);
        }, 200);
      } else {
        // Même sans zoom, forcer le recalcul après la suppression
        setTimeout(() => {
          setLayoutKey((prev) => prev + 1);
        }, 150);
      }
    }, 250);

    setActiveToast({
      icon: "🗑️",
      title: "Élément retiré",
      message: "L'élément a été retiré de votre CV",
      type: "success",
      points: 0,
    });
  };

  // Ajouter un élément au layout (via bouton "Ajouter")
  const handleAddItem = (type: CVLayoutItem["type"], id: string) => {
    // Vérifier si l'élément n'est pas déjà dans le layout
    const alreadyExists = layout.some(
      (item) => item.type === type && item.id === id,
    );
    if (alreadyExists) {
      setActiveToast({
        icon: "⚠️",
        title: "Déjà ajouté",
        message: "Cet élément est déjà dans votre CV",
        type: "warning",
        points: 0,
      });
      return;
    }

    // Conserver le zoom actuel avant d'ajouter l'élément
    const currentZoom = previewZoom;

    // Ajouter l'élément au layout
    const newItem: CVLayoutItem = { type, id };
    setLayout([...layout, newItem]);

    // Attendre que le preview soit régénéré, puis réappliquer le zoom et forcer le recalcul
    // Le generatePreview gère déjà la réapplication du zoom, mais on force aussi ici pour être sûr
    setTimeout(() => {
      if (currentZoom < 1.0) {
        setPreviewZoom(currentZoom);
        // Attendre que le zoom CSS soit appliqué avant de recalculer les pourcentages
        // Le useEffect dans A4Page applique le zoom, donc on attend un peu plus
        setTimeout(() => {
          setLayoutKey((prev) => prev + 1);
        }, 200); // Délai plus long pour s'assurer que le zoom CSS est appliqué
      } else {
        // Même sans zoom, forcer le recalcul après l'ajout
        setTimeout(() => {
          setLayoutKey((prev) => prev + 1);
        }, 150);
      }
    }, 250);

    const columnName = LEFT_COLUMN_TYPES.includes(type) ? "gauche" : "droite";
    setActiveToast({
      icon: "✅",
      title: "Élément ajouté",
      message: `${type} ajouté à la colonne ${columnName}`,
      type: "success",
      points: 0,
    });
  };

  if (!cvItems) {
    return (
      <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-theme-bg-primary p-4 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto pt-8 px-4 lg:px-6 xl:px-8">
          {/* Header */}
          <div className="mb-4">
            <button
              onClick={() => {
                localStorage.removeItem("editing_cv_id");
                localStorage.removeItem("editing_cv_name");
                localStorage.removeItem("editing_cv_template");
                setEditingCvId(null);
                setCvName("");
                setView("cv_template_selection");
              }}
              className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-text-primary mb-3 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Retour au choix du CV</span>
            </button>
            <h1 className="text-2xl font-bold text-theme-text-primary mb-1">
              Génération de CV
            </h1>
            <p className="text-xs text-theme-text-secondary">
              Remplissez votre page A4 en assemblant vos blocs. Glissez-déposez
              pour construire votre CV.
            </p>
          </div>

          {/* Boutons en haut à droite - Séparés */}
          <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
            <CompressButton
              percentage={density.global}
              onCompress={handleCompress}
              onReset={handleResetZoom}
              appliedZoom={previewZoom < 1.0 ? previewZoom : appliedZoom}
            />
            {(hasModificationsSinceLastGenerate || !generatedUrl) && (
              <button
                onClick={() => handleGeneratePDF()}
                disabled={isGenerating || !layout.length}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-4 py-1.5 rounded-lg hover:shadow-lg hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <FileDown size={16} />
                    Générer PDF
                  </>
                )}
              </button>
            )}

            {generatedUrl && (
              <button
                onClick={async () => {
                  try {
                    // Télécharger via le backend pour éviter les problèmes CORS avec R2
                    const blob = await cvAPI.download();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `cv_${selectedTemplate}_${new Date().getTime()}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);

                    setActiveToast({
                      icon: "✅",
                      title: "Téléchargement réussi",
                      message: "Votre CV a été téléchargé",
                      type: "success",
                      points: 0,
                    });
                  } catch (error) {
                    console.error("Erreur téléchargement:", error);
                    setActiveToast({
                      icon: "❌",
                      title: "Erreur",
                      message: "Impossible de télécharger le CV",
                      type: "error",
                      points: 0,
                    });
                  }
                }}
                className="flex items-center gap-2 bg-theme-bg-secondary text-theme-text-secondary font-medium px-3 py-1.5 rounded-lg hover:bg-theme-bg-tertiary hover:text-theme-text-primary transition-colors text-sm"
              >
                <CheckCircle2 size={16} />
                Télécharger
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
            {/* Colonne gauche : Template, Couleur + La Réserve + Paramètres avancés */}
            <div
              className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0 flex flex-col"
              style={{ height: "calc(160vh - 250px)" }}
            >
              {/* Nom du CV, Template et Couleur au-dessus de la réserve */}
              <div className="bg-theme-card rounded-xl p-3 border border-theme-card-border shadow-theme-sm space-y-3 transition-colors duration-300 flex-shrink-0">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-theme-text-secondary whitespace-nowrap">
                    Nom du CV
                  </label>
                  <input
                    type="text"
                    value={cvName}
                    onChange={(e) => setCvName(e.target.value)}
                    placeholder="Mon CV"
                    className="px-2 py-1.5 text-xs border border-theme-border rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-theme-bg-secondary text-gray-900 dark:text-theme-text-primary placeholder-gray-500 dark:placeholder-theme-text-muted transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-theme-text-secondary whitespace-nowrap">
                    Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="px-2 py-1.5 text-xs border border-theme-border rounded-lg focus:ring-2 focus:ring-emerald-500 flex-1 bg-theme-bg-secondary text-theme-text-primary transition-colors"
                  >
                    <option value="modern">Moderne</option>
                    <option value="academic-latex">Academic LaTeX</option>
                  </select>
                </div>

                {/* Sélecteur de couleur */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-theme-text-secondary whitespace-nowrap">
                    Couleur
                  </label>
                  <ColorPicker
                    primaryColor={primaryColor}
                    onColorChange={setPrimaryColor}
                  />
                </div>
              </div>

              {/* La Réserve - Hauteur réduite pour laisser place aux paramètres avancés */}
              <div
                className="flex-1 min-h-0 mt-3"
                style={{ maxHeight: "calc(100% - 120px)" }}
              >
                <CVReserve
                  cvItems={cvItems}
                  layout={layout}
                  onRemoveItem={handleRemoveItem}
                  onAddItem={handleAddItem}
                />
              </div>

              {/* Paramètres avancés - Bloc dépliable */}
              <div className="mt-3 bg-theme-card rounded-xl border border-theme-card-border shadow-theme-sm overflow-hidden transition-colors duration-300 flex-shrink-0">
                <button
                  onClick={() =>
                    setIsAdvancedSettingsOpen(!isAdvancedSettingsOpen)
                  }
                  className="w-full flex items-center justify-between p-3 hover:bg-theme-bg-tertiary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings size={16} className="text-theme-text-secondary" />
                    <span className="text-xs font-semibold text-theme-text-primary">
                      Paramètres avancés
                    </span>
                  </div>
                  {isAdvancedSettingsOpen ? (
                    <ChevronUp
                      size={16}
                      className="text-theme-text-secondary"
                    />
                  ) : (
                    <ChevronDown
                      size={16}
                      className="text-theme-text-secondary"
                    />
                  )}
                </button>

                {isAdvancedSettingsOpen && (
                  <div className="px-3 pb-3 space-y-3 border-t border-theme-border pt-3">
                    {/* Option : Afficher la photo */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Image
                          size={16}
                          className="text-theme-text-secondary"
                        />
                        <label className="text-xs text-theme-text-primary cursor-pointer">
                          Afficher la photo de profil
                        </label>
                      </div>
                      <button
                        onClick={() => setShowPhoto(!showPhoto)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          showPhoto ? "bg-emerald-500" : "bg-theme-border"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            showPhoto ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Option : Afficher les compétences sur projets/expériences */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Tags size={16} className="text-theme-text-secondary" />
                        <label className="text-xs text-theme-text-primary cursor-pointer">
                          Compétences sur projets/expériences
                        </label>
                      </div>
                      <button
                        onClick={() => setShowSkillsOnItems(!showSkillsOnItems)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          showSkillsOnItems
                            ? "bg-emerald-500"
                            : "bg-theme-border"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            showSkillsOnItems
                              ? "translate-x-5"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite : Canvas A4 + Density Meter - Preview mis en avant */}
            {/* IMPORTANT : Le conteneur doit permettre au preview A4 d'avoir ses dimensions fixes */}
            {/* Mais avec scroll pour voir tout le contenu qui dépasse */}
            <div
              className="flex-1 space-y-3 w-full flex flex-col"
              style={{ height: "calc(160vh - 250px)" }}
            >
              {/* Jauge de remplissage - Plus compacte */}
              <div className="bg-theme-card rounded-xl p-3 border border-theme-card-border shadow-theme-sm transition-colors duration-300 flex-shrink-0">
                <DensityMeter
                  density={density}
                  appliedZoom={previewZoom < 1.0 ? previewZoom : appliedZoom}
                />
              </div>

              {/* Canvas A4 avec preview - Mise en avant */}
              {/* Prend tout l'espace restant pour avoir la même hauteur que la réserve */}
              <div className="bg-theme-card rounded-xl p-4 border border-theme-card-border shadow-theme-lg relative overflow-y-auto overflow-x-hidden transition-colors duration-300 flex-1 min-h-0">
                {isLoadingPreview ? (
                  <div className="flex items-center justify-center h-96">
                    <Loader2
                      size={48}
                      className="animate-spin text-emerald-500"
                    />
                  </div>
                ) : previewHtml ? (
                  <A4Page
                    onDensityChange={setDensity}
                    previewZoom={previewZoom}
                    layoutKey={`${layout.map((item) => `${item.type}-${item.id}`).join(",")}-${layoutKey}`}
                    isSingleColumn={selectedTemplate === "academic-latex"}
                  >
                    <CVCanvas
                      previewHtml={previewHtml}
                      isDragging={!!activeId}
                      draggingType={draggingType}
                      onDragOver={setActiveZone}
                    />
                  </A4Page>
                ) : (
                  <div className="flex items-center justify-center h-96 text-theme-text-muted">
                    <div className="text-center">
                      <p>
                        Commencez par glisser des éléments depuis la Réserve
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DragOverlay pour afficher l'item pendant le drag */}
      <DragOverlay>
        {activeItem && activeId ? (
          <DragItemPreview type={activeItem.type} label={activeItem.label} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
