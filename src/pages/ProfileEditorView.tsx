import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronRight,
  Shield,
  ScrollText,
  Briefcase,
  Zap,
  Upload,
  X,
  Plus,
  MapPin,
  Calendar,
  GraduationCap,
  Rocket,
  Globe,
  Award,
  Target,
  Palette,
  Phone,
  Linkedin,
  Github,
  Link as LinkIcon,
  Pencil,
  Loader2,
  Check,
  Settings,
  Sparkles,
  Wand2,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import {
  authAPI,
  api,
  jobNotificationsAPI,
  schoolStudentAPI,
  type JobNotificationKeyword,
} from "../services/api";
import { useGameStore } from "../store/gameStore";
import { getAbsoluteImageUrl } from "../utils/imageUrl";
import { ExperienceFormModal } from "../components/ExperienceFormModal";
import { EducationFormModal } from "../components/EducationFormModal";
import { ProjectFormModal } from "../components/ProjectFormModal";
import { LanguageFormModal } from "../components/LanguageFormModal";
import { CertificationFormModal } from "../components/CertificationFormModal";
import { InterestFormModal } from "../components/InterestFormModal";
import { SkillFormModal } from "../components/SkillFormModal";
import { ProfileHealthCard } from "../components/ProfileHealthCard";
import FormattedText from "../components/FormattedText";
import { AIBadge } from "../components/AIBadge";
import { Logo } from "../components/Logo";
import { LEVEL_THRESHOLDS } from "../types";
import { calculateCompleteness } from "../utils/profileCompleteness";
import {
  validatePhone,
  validateLinkedIn,
  validateGitHub,
  validateURL,
} from "../utils/validation";

export const ProfileEditorView: React.FC = () => {
  const {
    user,
    profile,
    gamification,
    experiences,
    educations,
    projects,
    languages,
    certifications,
    interests,
    skills,
    setView,
    profileScrollToSection,
    setProfileScrollToSection,
    updateProfile,
    deleteSkill,
    deleteExperience,
    deleteEducation,
    deleteProject,
    deleteLanguage,
    deleteCertification,
    deleteInterest,
    uploadPicture,
    fetchProfile,
    requireAuth,
    setActiveToast,
    addPts,
  } = useGameStore();

  const [bio, setBio] = useState(profile?.bio || "");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [showBioReformulateMenu, setShowBioReformulateMenu] = useState(false);
  const [isReformulatingBio, setIsReformulatingBio] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const bioReformulateRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState(profile?.location || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || "");
  const [githubUrl, setGithubUrl] = useState(profile?.github_url || "");
  const [portfolioUrl, setPortfolioUrl] = useState(
    profile?.portfolio_url || "",
  );
  const [isEditingContact, setIsEditingContact] = useState(false);

  // État pour la modification du nom
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState("");

  // États pour les erreurs de validation
  const [validationErrors, setValidationErrors] = useState<{
    phone?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  }>({});
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isCertificationModalOpen, setIsCertificationModalOpen] =
    useState(false);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [editingInterest, setEditingInterest] = useState<any>(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<any>(null);
  const [editingEducation, setEditingEducation] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string>("objectif");
  const [imageKey, setImageKey] = useState<number>(0); // Pour forcer le rechargement de l'image

  // Mon Objectif (mots-clés synchronisés avec Alerte d'Offres)
  const [objectives, setObjectives] = useState<JobNotificationKeyword[]>([]);
  const [objectivesLoading, setObjectivesLoading] = useState(true);
  const [newObjective, setNewObjective] = useState("");
  const [addingObjective, setAddingObjective] = useState(false);

  // École + cohorte pour les comptes étudiants (affichage sur le profil)
  const [mySchoolData, setMySchoolData] = useState<{
    school_name: string;
    cohort_name: string | null;
  } | null>(null);

  const sectionsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [highlightedSection, setHighlightedSection] = useState<string | null>(
    null,
  );

  // Navigation rapide vers une section
  const scrollToSection = (sectionId: string) => {
    const element =
      sectionsRef.current[sectionId] ??
      document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setActiveSection(sectionId);
    }
  };

  // Scroll vers une section si demandé (depuis objectifs du jour, conseil du jour)
  // Ne pas effacer avant le scroll : Strict Mode annule le timer au 1er mount, le 2e mount doit retrouver la valeur.
  useEffect(() => {
    const sectionId = profileScrollToSection;
    if (!sectionId) return;
    const doScroll = () => {
      scrollToSection(sectionId);
      setProfileScrollToSection(null);
      setHighlightedSection(sectionId);
    };
    const timer = setTimeout(
      () => requestAnimationFrame(() => requestAnimationFrame(doScroll)),
      350,
    );
    return () => clearTimeout(timer);
  }, [profileScrollToSection, setProfileScrollToSection]);

  // Retirer la mise en évidence après 2,5 s
  useEffect(() => {
    if (!highlightedSection) return;
    const t = setTimeout(() => setHighlightedSection(null), 2500);
    return () => clearTimeout(t);
  }, [highlightedSection]);

  // Charger les objectifs (mots-clés Alerte d'Offres) au montage
  useEffect(() => {
    const loadObjectives = async () => {
      try {
        setObjectivesLoading(true);
        const keywords = await jobNotificationsAPI.getKeywords();
        setObjectives(keywords);
      } catch (err) {
        console.error("Erreur chargement objectifs:", err);
      } finally {
        setObjectivesLoading(false);
      }
    };
    loadObjectives();
  }, []);

  // Charger école + cohorte pour affichage sur le profil (comptes étudiants)
  useEffect(() => {
    const orgType = localStorage.getItem("current_org_type");
    const orgRole = localStorage.getItem("current_org_role");
    const isSchoolStudent = orgType === "school" && orgRole === "student";
    if (!isSchoolStudent || !user) {
      setMySchoolData(null);
      return;
    }
    schoolStudentAPI
      .getMySchool()
      .then((data) =>
        setMySchoolData({
          school_name: data.school_name,
          cohort_name: data.cohort_name ?? null,
        }),
      )
      .catch(() => setMySchoolData(null));
  }, [user]);

  const handleAddObjective = async () => {
    if (!newObjective.trim()) return;
    const wasFirstObjective = objectives.length === 0;
    requireAuth(async () => {
      try {
        setAddingObjective(true);
        const keyword = await jobNotificationsAPI.addKeyword(
          newObjective.trim(),
        );
        setObjectives([keyword, ...objectives]);
        setNewObjective("");
        if (wasFirstObjective) {
          await addPts(100, "Objectif professionnel défini");
        }
        setActiveToast({
          type: "success",
          title: "Objectif ajouté",
          message: wasFirstObjective
            ? `+100 pts ! "${keyword.keyword}" est aussi utilisé pour vos alertes d'offres.`
            : `"${keyword.keyword}" est aussi utilisé pour vos alertes d'offres.`,
          duration: 3000,
        });
      } catch (err: any) {
        setActiveToast({
          type: "error",
          title: "Erreur",
          message:
            err.response?.data?.detail || "Impossible d'ajouter l'objectif.",
          duration: 4000,
        });
      } finally {
        setAddingObjective(false);
      }
    });
  };

  const handleDeleteObjective = async (keywordId: string) => {
    try {
      await jobNotificationsAPI.deleteKeyword(keywordId);
      setObjectives(objectives.filter((k) => k.id !== keywordId));
      setActiveToast({
        type: "success",
        title: "Objectif retiré",
        message: "Il ne sera plus utilisé pour les alertes d'offres.",
        duration: 2000,
      });
    } catch (err) {
      console.error("Erreur suppression objectif:", err);
    }
  };

  // Détecter la section visible lors du scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      const sections = [
        "objectif",
        "bio",
        "contact",
        "experiences",
        "educations",
        "projects",
        "languages",
        "certifications",
        "interests",
        "skills",
      ];

      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        const element = sectionsRef.current[sectionId];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sectionId);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categories = [
    {
      id: "objectif",
      label: "Objectif",
      icon: Target,
      color: "text-amber-500",
    },
    { id: "bio", label: "Bio", icon: ScrollText, color: "text-blue-500" },
    { id: "contact", label: "Contact", icon: Phone, color: "text-indigo-500" },
    {
      id: "experiences",
      label: "Expériences",
      icon: Briefcase,
      color: "text-[#FF8C42]",
    },
    {
      id: "educations",
      label: "Formations",
      icon: GraduationCap,
      color: "text-purple-500",
    },
    { id: "projects", label: "Projets", icon: Rocket, color: "text-blue-500" },
    { id: "languages", label: "Langues", icon: Globe, color: "text-green-500" },
    {
      id: "certifications",
      label: "Certifications",
      icon: Award,
      color: "text-orange-500",
    },
    {
      id: "interests",
      label: "Centres d'intérêt",
      icon: Palette,
      color: "text-purple-500",
    },
    { id: "skills", label: "Compétences", icon: Zap, color: "text-yellow-500" },
  ];

  const handleSaveBio = () => {
    requireAuth(async () => {
      await updateProfile({ bio });
      setIsEditingBio(false);
    });
  };

  // Fermer le menu reformulation si clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bioReformulateRef.current &&
        !bioReformulateRef.current.contains(event.target as Node)
      ) {
        setShowBioReformulateMenu(false);
      }
    };
    if (showBioReformulateMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showBioReformulateMenu]);

  // Reformuler la bio avec l'IA
  const handleReformulateBio = async (type: string) => {
    if (!bio.trim()) return;
    setIsReformulatingBio(true);
    setShowBioReformulateMenu(false);
    try {
      const response = await api.post("/api/ai/reformulate", {
        text: bio,
        reformulation_type: type,
      });
      setBio(response.data.reformulated_text);
      setIsEditingBio(true);
    } catch (error) {
      console.error("Erreur reformulation:", error);
    } finally {
      setIsReformulatingBio(false);
    }
  };

  // Générer une bio complète avec l'IA basée sur le profil
  const handleGenerateBio = async () => {
    setIsGeneratingBio(true);
    try {
      const response = await api.post("/api/ai/generate-bio", {
        full_name:
          user?.first_name && user?.last_name
            ? `${user.first_name} ${user.last_name}`
            : user?.first_name || user?.full_name || "",
        experiences:
          experiences?.slice(0, 3).map((e: any) => ({
            title: e.title,
            company: e.company,
            is_current: e.is_current,
          })) || [],
        educations:
          educations?.slice(0, 2).map((e: any) => ({
            degree: e.degree,
            school: e.school,
            field_of_study: e.field_of_study,
          })) || [],
        skills: skills?.slice(0, 10).map((s: any) => s.name) || [],
        projects: projects?.slice(0, 3).map((p: any) => p.name) || [],
      });
      setBio(response.data.bio);
      setIsEditingBio(true);
    } catch (error: any) {
      console.error("Erreur génération bio:", error);
      const message =
        error.response?.data?.detail ??
        error.message ??
        "Erreur lors de la génération de la bio.";
      setActiveToast({
        type: "error",
        title: "Erreur génération bio",
        message:
          typeof message === "string"
            ? message
            : message.message || JSON.stringify(message),
        duration: 5000,
      });
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleSaveName = async () => {
    // Validation : au moins le prénom doit être rempli
    if (!firstName.trim()) {
      setNameError("Le prénom est requis");
      return;
    }

    setIsSavingName(true);
    setNameError("");

    try {
      // Préparer les données : ne pas envoyer last_name si vide
      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName.trim();

      if (!trimmedFirstName) {
        setNameError("Le prénom est requis");
        return;
      }

      const updateData: { first_name: string; last_name?: string } = {
        first_name: trimmedFirstName,
      };

      // Ne pas envoyer last_name si vide (undefined au lieu de chaîne vide)
      if (trimmedLastName) {
        updateData.last_name = trimmedLastName;
      }

      const response = await authAPI.updateFullName(updateData);
      // Mettre à jour le store avec le nouveau user
      useGameStore.setState({ user: response.user });
      // Mettre à jour le localStorage
      localStorage.setItem("user", JSON.stringify(response.user));
      setIsEditingName(false);
    } catch (err: any) {
      console.error("Erreur mise à jour nom:", err);

      // Extraire le message d'erreur correctement
      let errorMessage = "Erreur lors de la mise à jour";

      console.error("🔍 [ProfileEditor] Détails erreur:", {
        status: err.response?.status,
        data: err.response?.data,
        detail: err.response?.data?.detail,
      });

      if (err.response?.data) {
        const errorData = err.response.data;

        // Si detail est une string, l'utiliser directement
        if (typeof errorData.detail === "string") {
          errorMessage = errorData.detail;
        }
        // Si detail est un tableau (erreurs de validation Pydantic)
        else if (Array.isArray(errorData.detail)) {
          const firstError = errorData.detail[0];
          if (firstError?.msg) {
            errorMessage = `${firstError.msg}${firstError.loc ? ` (${firstError.loc.join(".")})` : ""}`;
          } else if (typeof firstError === "string") {
            errorMessage = firstError;
          } else {
            errorMessage = JSON.stringify(firstError);
          }
        }
        // Si detail est un objet avec un message
        else if (errorData.detail && typeof errorData.detail === "object") {
          errorMessage =
            errorData.detail.message ||
            errorData.detail.msg ||
            JSON.stringify(errorData.detail);
        }
      }

      setNameError(errorMessage);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSaveContact = () => {
    // Validation des champs
    const errors: typeof validationErrors = {};

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.message;
    }

    const linkedinValidation = validateLinkedIn(linkedinUrl);
    if (!linkedinValidation.valid) {
      errors.linkedinUrl = linkedinValidation.message;
    }

    const githubValidation = validateGitHub(githubUrl);
    if (!githubValidation.valid) {
      errors.githubUrl = githubValidation.message;
    }

    const portfolioValidation = validateURL(portfolioUrl);
    if (!portfolioValidation.valid) {
      errors.portfolioUrl = portfolioValidation.message;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    requireAuth(async () => {
      await updateProfile({
        location: location.trim() || null,
        phone: phone.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        github_url: githubUrl.trim() || null,
        portfolio_url: portfolioUrl.trim() || null,
      });
      setIsEditingContact(false);
      // Recharger le profil pour mettre à jour les données
      await fetchProfile();
    });
  };

  // Marquer la visite de la page "Profil" pour valider les objectifs génériques (priorité 9)
  useEffect(() => {
    if (user?.id) {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const visitedKey = `profile_visited_${today}`;
      localStorage.setItem(visitedKey, "true");
    }
  }, [user?.id]);

  // Mettre à jour les états quand le profil change
  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
      setLocation(profile.location || "");
      setPhone(profile.phone || "");
      setLinkedinUrl(profile.linkedin_url || "");
      setGithubUrl(profile.github_url || "");
      setPortfolioUrl(profile.portfolio_url || "");
    }
  }, [profile]);

  // Forcer le rechargement de l'image quand la photo change
  useEffect(() => {
    if (profile?.profile_picture_url) {
      setImageKey((prev) => prev + 1);
    }
  }, [profile?.profile_picture_url]);

  // Mettre à jour le nom quand user change
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
    }
  }, [user]);

  const handleAddExperience = () => {
    requireAuth(() => {
      setEditingExperience(null);
      setIsExperienceModalOpen(true);
    });
  };

  const handleEditExperience = (exp: any) => {
    requireAuth(() => {
      setEditingExperience(exp);
      setIsExperienceModalOpen(true);
    });
  };

  const handleExperienceSuccess = () => {
    setIsExperienceModalOpen(false);
    setEditingExperience(null);
    // Les données seront automatiquement rechargées par le store
  };

  const handleAddEducation = () => {
    requireAuth(() => {
      setEditingEducation(null);
      setIsEducationModalOpen(true);
    });
  };

  const handleEditEducation = (edu: any) => {
    requireAuth(() => {
      setEditingEducation(edu);
      setIsEducationModalOpen(true);
    });
  };

  const handleEducationSuccess = () => {
    setIsEducationModalOpen(false);
    setEditingEducation(null);
  };

  const handleAddProject = () => {
    requireAuth(() => {
      setEditingProject(null);
      setIsProjectModalOpen(true);
    });
  };

  const handleEditProject = (proj: any) => {
    requireAuth(() => {
      setEditingProject(proj);
      setIsProjectModalOpen(true);
    });
  };

  const handleProjectSuccess = () => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleAddLanguage = () => {
    requireAuth(() => {
      setIsLanguageModalOpen(true);
    });
  };

  const handleLanguageSuccess = () => {
    setIsLanguageModalOpen(false);
  };

  const handleAddCertification = () => {
    requireAuth(() => {
      setIsCertificationModalOpen(true);
    });
  };

  const handleCertificationSuccess = () => {
    setIsCertificationModalOpen(false);
  };

  const handleAddInterest = () => {
    requireAuth(() => {
      setEditingInterest(null);
      setIsInterestModalOpen(true);
    });
  };

  const handleInterestSuccess = () => {
    setIsInterestModalOpen(false);
    setEditingInterest(null);
  };

  const handleAddSkill = () => {
    requireAuth(() => {
      setIsSkillModalOpen(true);
    });
  };

  const handleSkillSuccess = () => {
    setIsSkillModalOpen(false);
  };

  const handleUploadPicture = () => {
    requireAuth(() => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          // Vérifier la taille du fichier (5 MB maximum)
          const maxSize = 5 * 1024 * 1024; // 5 MB en bytes
          if (file.size > maxSize) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            setActiveToast({
              type: "error",
              title: "✗ Fichier trop volumineux",
              message: `Le fichier fait ${fileSizeMB} MB. La taille maximale est de 5 MB. Veuillez compresser ou choisir une autre image.`,
            });
            return;
          }

          // Vérifier le type de fichier
          if (!file.type.startsWith("image/")) {
            setActiveToast({
              type: "error",
              title: "✗ Format invalide",
              message:
                "Veuillez sélectionner un fichier image (JPG, PNG, etc.).",
            });
            return;
          }

          await uploadPicture(file);
          // Attendre un peu et recharger le profil pour forcer la mise à jour
          setTimeout(async () => {
            await fetchProfile();
            // Forcer le rechargement de l'image
            setImageKey((prev) => prev + 1);
          }, 500);
        }
      };
      input.click();
    });
  };

  const handleDeletePicture = async () => {
    if (!profile?.profile_picture_url) return;

    requireAuth(async () => {
      try {
        // Mettre à jour le profil avec profile_picture_url: null
        await updateProfile({ profile_picture_url: null });
        // Recharger le profil pour avoir les données à jour
        await fetchProfile();
        // Forcer le rechargement de l'image
        setImageKey((prev) => prev + 1);
      } catch (error) {
        console.error("Erreur suppression photo:", error);
      }
    });
  };

  // Calculer complétude réelle basée sur les données (objectifs = mots-clés)
  const completenessResult = useMemo(() => {
    return calculateCompleteness(
      profile,
      experiences,
      educations,
      projects,
      languages,
      certifications,
      skills,
      interests,
      objectives.length,
    );
  }, [
    profile,
    experiences,
    educations,
    projects,
    languages,
    certifications,
    skills,
    interests,
    objectives.length,
  ]);

  const completeness = completenessResult.percentage;

  // Créer les actions pour les missions
  const missionsWithActions = useMemo(() => {
    return completenessResult.nextMissions.map((mission) => {
      let action = () => {};
      switch (mission.id) {
        case "bio":
          action = () => {
            const bioSection = sectionsRef.current["bio"];
            if (bioSection) {
              bioSection.scrollIntoView({ behavior: "smooth", block: "start" });
              setActiveSection("bio");
            }
          };
          break;
        case "location":
        case "phone":
        case "linkedin":
        case "github":
        case "portfolio":
          action = () => {
            const contactSection = sectionsRef.current["contact"];
            if (contactSection) {
              contactSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
              setActiveSection("contact");
            }
          };
          break;
        case "experiences":
          action = () => {
            handleAddExperience();
          };
          break;
        case "educations":
          action = () => {
            handleAddEducation();
          };
          break;
        case "projects":
          action = () => {
            handleAddProject();
          };
          break;
        case "languages":
          action = () => {
            handleAddLanguage();
          };
          break;
        case "certifications":
          action = () => {
            handleAddCertification();
          };
          break;
        case "interests":
          action = () => {
            handleAddInterest();
          };
          break;
        case "skills":
          action = () => {
            const skillsSection = sectionsRef.current["skills"];
            if (skillsSection) {
              skillsSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
              setActiveSection("skills");
            }
          };
          break;
        case "objectif":
          action = () => {
            const objectifSection = sectionsRef.current["objectif"];
            if (objectifSection) {
              objectifSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
              setActiveSection("objectif");
            }
          };
          break;
        default:
          action = () => {
            const section = sectionsRef.current[mission.id];
            if (section) {
              section.scrollIntoView({ behavior: "smooth", block: "start" });
              setActiveSection(mission.id);
            }
          };
      }
      return { ...mission, action };
    });
  }, [completenessResult.nextMissions]);

  // Calculer le pourcentage de progression vers le prochain niveau
  const calculateProgress = () => {
    const currentLevel = gamification.level;
    const currentXP = gamification.xp;
    const levelStartXP = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
    const nextLevelXP =
      LEVEL_THRESHOLDS[currentLevel] ||
      LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const xpInCurrentLevel = currentXP - levelStartXP;
    const xpNeededForNextLevel = nextLevelXP - levelStartXP;
    return {
      percentage:
        xpNeededForNextLevel > 0
          ? (xpInCurrentLevel / xpNeededForNextLevel) * 100
          : 0,
      currentXP: xpInCurrentLevel,
      neededXP: xpNeededForNextLevel,
      level: currentLevel,
    };
  };

  const progress = calculateProgress();

  // Obtenir la couleur du cercle de progression selon le %
  const getProgressColor = (percentage: number) => {
    if (percentage < 50)
      return { stroke: "#EF4444", glow: "rgba(239, 68, 68, 0.4)" }; // Rouge
    if (percentage < 80)
      return { stroke: "#F97316", glow: "rgba(249, 115, 22, 0.4)" }; // Orange
    return { stroke: "#10B981", glow: "rgba(16, 185, 129, 0.4)" }; // Vert
  };

  const progressColors = getProgressColor(completeness);

  return (
    <div className="animate-in slide-in-from-right duration-300">
      {/* Animations custom supprimées - transitions CSS suffisantes */}

      {/* HEADER - Mode Édition (sticky, pas fixed sur mobile) */}
      <div className="sticky top-0 z-40 bg-theme-bg-primary/95 backdrop-blur-xl border-b border-theme-border shadow-theme-sm mb-6 -mx-4 px-4 py-3 md:-mx-6 md:px-6 transition-all duration-300">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setView("dashboard")}
            className="flex items-center gap-2 text-theme-text-muted hover:text-theme-text-primary font-semibold transition-colors"
          >
            <ChevronRight className="rotate-180 w-5 h-5" />{" "}
            <span className="hidden sm:inline">Retour</span>
          </button>

          {/* Navigation Mini-Map - scrollable sur mobile */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1 justify-center max-w-xl">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeSection === category.id;
              const colorValue =
                category.color === "text-blue-500"
                  ? "#3B82F6"
                  : category.color === "text-amber-500"
                    ? "#F59E0B"
                    : category.color === "text-[#FF8C42]"
                      ? "#FF8C42"
                      : category.color === "text-purple-500"
                        ? "#A855F7"
                        : category.color === "text-green-500"
                          ? "#10B981"
                          : category.color === "text-orange-500"
                            ? "#F97316"
                            : category.color === "text-yellow-500"
                              ? "#EAB308"
                              : "#6366F1";
              return (
                <button
                  key={category.id}
                  onClick={() => scrollToSection(category.id)}
                  className={`flex-shrink-0 flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-xl font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-theme-bg-secondary scale-110 shadow-theme-sm"
                      : "hover:bg-theme-bg-tertiary"
                  }`}
                  style={{
                    borderLeft: isActive
                      ? `3px solid ${colorValue}`
                      : undefined,
                  }}
                >
                  <Icon
                    size={16}
                    className={isActive ? "" : "text-theme-text-muted"}
                    style={{ color: isActive ? colorValue : undefined }}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("cv_generate")}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-theme-bg-secondary hover:bg-theme-bg-tertiary border border-theme-border rounded-xl text-theme-text-secondary text-xs font-semibold transition-all"
            >
              👀 Générer mon CV
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl text-orange-600 dark:text-orange-400 text-xs font-bold">
              <Shield size={12} /> Édition
            </div>
          </div>
        </div>
      </div>

      {/* LAYOUT PRINCIPAL : 2 COLONNES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* ═══════════════════════════════════════════════════════════════
            COLONNE GAUCHE : LE HUD DU JOUEUR
        ═══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-4">
          <div className="space-y-4">
            {/* CARTE HUD PRINCIPALE */}
            <div className="bg-theme-card border border-theme-card-border rounded-2xl p-6 shadow-theme-md">
              {/* AVATAR avec Cercle SVG de Progression */}
              <div className="relative w-40 h-40 mx-auto mb-6 group cursor-pointer">
                {/* Cercle de fond */}
                <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    className="stroke-slate-200 dark:stroke-slate-700"
                    strokeWidth="8"
                  />
                </svg>

                {/* Cercle de progression dynamique (couleur selon %) */}
                <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke={progressColors.stroke}
                    strokeWidth="8"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * completeness) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>

                {/* Cercle de niveau XP (orange) */}
                <svg className="w-full h-full transform -rotate-90 absolute inset-0 z-[1]">
                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    fill="none"
                    className="stroke-orange-100 dark:stroke-orange-900/30"
                    strokeWidth="4"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    fill="none"
                    stroke="#FF8C42"
                    strokeWidth="4"
                    strokeDasharray={390}
                    strokeDashoffset={390 - (390 * progress.percentage) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>

                {/* Photo de profil */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden p-4">
                  {profile?.profile_picture_url ? (
                    <img
                      src={
                        getAbsoluteImageUrl(profile.profile_picture_url) || ""
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full ring-4 ring-theme-border"
                      key={`profile-picture-${profile.profile_picture_url}-${imageKey}`}
                      onError={() =>
                        console.error("❌ Erreur chargement photo")
                      }
                    />
                  ) : (
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || "default"}`}
                      alt="Avatar"
                      className="rounded-full ring-4 ring-theme-border"
                    />
                  )}
                </div>

                {/* Bouton supprimer photo */}
                {profile?.profile_picture_url && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePicture();
                    }}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg z-50 transition-all hover:scale-[1.02]"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                )}

                {/* Overlay upload au survol */}
                <div
                  onClick={handleUploadPicture}
                  className="absolute inset-4 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-10 cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-white/90 p-3 rounded-full">
                      <Upload size={18} className="text-[#FF8C42]" />
                    </div>
                    <span className="text-white text-xs font-bold bg-[#FF8C42] px-2 py-1 rounded-full">
                      +15 pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Badge Niveau sous la photo */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-full">
                  <span className="text-xl">🏆</span>
                  <span className="text-theme-text-primary font-bold">
                    Niveau {gamification.level}
                  </span>
                  <span className="text-xs text-orange-600 dark:text-orange-400">
                    ({progress.currentXP}/{progress.neededXP} pts)
                  </span>
                </div>
              </div>

              {/* Nom éditable */}
              <div className="text-center mb-6">
                {isEditingName ? (
                  <div className="space-y-3 max-w-md mx-auto">
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          setNameError("");
                        }}
                        className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-3 py-2 text-sm text-theme-text-primary focus:border-[#FF8C42] focus:ring-1 focus:ring-[#FF8C42] outline-none transition-all text-center"
                        placeholder="Prénom"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          setNameError("");
                        }}
                        className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl px-3 py-2 text-sm text-theme-text-primary focus:border-[#FF8C42] focus:ring-1 focus:ring-[#FF8C42] outline-none transition-all text-center"
                        placeholder="Nom de famille"
                      />
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        onClick={handleSaveName}
                        disabled={isSavingName}
                        className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50 flex-shrink-0"
                      >
                        {isSavingName ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingName(false);
                          setFirstName(user?.first_name || "");
                          setLastName(user?.last_name || "");
                          setNameError("");
                        }}
                        className="p-2 bg-theme-bg-tertiary hover:bg-red-100 dark:hover:bg-red-900/30 text-theme-text-muted hover:text-red-500 rounded-xl transition-colors flex-shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {nameError && (
                      <p className="text-xs text-red-500 text-center">
                        {typeof nameError === "string"
                          ? nameError
                          : "Erreur lors de la mise à jour"}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="group flex items-center justify-center gap-2 mx-auto"
                  >
                    <h2 className="text-xl font-bold text-theme-text-primary group-hover:text-[#FF8C42] transition-colors">
                      {user?.first_name && user?.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user?.first_name ||
                          user?.full_name ||
                          "Ajouter votre nom"}
                    </h2>
                    <Pencil
                      size={14}
                      className="text-theme-text-muted group-hover:text-[#FF8C42] transition-colors"
                    />
                  </button>
                )}
                <p className="text-theme-text-muted text-sm mt-1">
                  @{user?.username}
                </p>
                {mySchoolData &&
                  (mySchoolData.school_name || mySchoolData.cohort_name) && (
                    <div className="flex items-center justify-center gap-2 mt-1.5">
                      <GraduationCap
                        size={18}
                        className="text-blue-500 dark:text-blue-400 flex-shrink-0"
                      />
                      <span className="text-base font-bold text-blue-500 dark:text-blue-400">
                        {[mySchoolData.school_name, mySchoolData.cohort_name]
                          .filter(Boolean)
                          .join(" – ")}
                      </span>
                    </div>
                  )}
              </div>

              {/* Barre de complétude */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-theme-text-muted uppercase tracking-wide">
                    Complétude du Profil
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: progressColors.stroke }}
                  >
                    {completeness}%
                  </span>
                </div>
                <div className="h-2 bg-theme-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${completeness}%`,
                      backgroundColor: progressColors.stroke,
                    }}
                  />
                </div>
              </div>

              {/* QUÊTES - Prochaines étapes */}
              {missionsWithActions.length > 0 && (
                <div className="border-t border-theme-border pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={14} className="text-[#FF8C42]" />
                    <span className="text-xs font-bold text-theme-text-muted uppercase tracking-wide">
                      Objectifs
                    </span>
                  </div>
                  <div className="space-y-2">
                    {missionsWithActions.slice(0, 3).map((mission) => (
                      <button
                        key={mission.id}
                        onClick={mission.action}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-theme-bg-tertiary hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-theme-border hover:border-orange-300 dark:hover:border-orange-700 rounded-xl transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-lg">{mission.icon}</span>
                          <span className="text-sm text-theme-text-secondary group-hover:text-theme-text-primary truncate">
                            {mission.label}
                          </span>
                        </div>
                        <span className="flex-shrink-0 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-lg">
                          +{mission.points} pts
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bouton Import CV */}
            <div className="relative">
              <AIBadge
                position="top-right"
                size="sm"
                variant="default"
                featureName="l'import de CV par IA"
                className="!-top-1 !-right-1"
              />
              <button
                onClick={() => setView("cv_import")}
                className="w-full flex items-center justify-between gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 rounded-2xl px-4 py-4 transition-all group shadow-theme-sm hover:shadow-theme-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
                    <ScrollText
                      size={20}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      Importer mon CV
                    </div>
                    <div className="text-xs text-emerald-600/70 dark:text-emerald-400/60">
                      Remplissage auto par IA
                    </div>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-emerald-500 group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            {/* Bouton Paramètres */}
            <button
              onClick={() => setView("settings")}
              className="w-full flex items-center justify-between gap-3 bg-theme-card border border-theme-card-border hover:border-indigo-400 dark:hover:border-indigo-600 rounded-2xl px-4 py-4 transition-all group shadow-theme-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                  <Settings
                    size={20}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-theme-text-primary">
                    Paramètres
                  </div>
                  <div className="text-xs text-theme-text-muted">
                    Comptes liés, préférences...
                  </div>
                </div>
              </div>
              <ChevronRight
                size={18}
                className="text-theme-text-muted group-hover:text-indigo-500 transition-colors"
              />
            </button>

            {/* Santé du Profil */}
            <ProfileHealthCard
              completeness={completenessResult}
              experiences={experiences}
              skills={skills}
              profile={profile}
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            COLONNE DROITE : L'ÉDITEUR BENTO
        ═══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-8 space-y-6">
          {/* ══════════════════════════════════════════════════════════
              CARTE : MON OBJECTIF (en tête, synchro Alerte d'Offres)
          ══════════════════════════════════════════════════════════ */}
          <div
            ref={(el) => (sectionsRef.current["objectif"] = el)}
            id="section-objectif"
            className={`group relative bg-theme-card border border-theme-card-border rounded-2xl p-6 shadow-theme-sm hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-300 ${
              highlightedSection === "objectif"
                ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 bg-indigo-50/40 dark:bg-indigo-900/15 animate-highlight-pulse"
                : ""
            }`}
          >
            {/* Badge +100 pts si aucun objectif */}
            {!objectivesLoading && objectives.length === 0 && (
              <div className="absolute -top-3 -right-3 bg-[#FF8C42] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                +100 pts
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-bold text-theme-text-primary flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center">
                  <Target
                    className="text-amber-600 dark:text-amber-400"
                    size={20}
                  />
                </div>
                Mon Objectif
              </h3>
            </div>
            <p className="text-sm text-theme-text-muted mb-4">
              Indiquez le(s) poste(s) ou métier(s) que vous ciblez (ex : Data
              Engineer, Développeur Full Stack). Ces objectifs servent aussi de
              mots-clés pour vos alertes d&apos;offres.
            </p>
            {objectivesLoading ? (
              <div className="flex items-center gap-2 text-theme-text-muted py-4">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Chargement...</span>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {objectives.map((obj) => (
                    <span
                      key={obj.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-sm font-medium"
                    >
                      {obj.keyword}
                      <button
                        type="button"
                        onClick={() => handleDeleteObjective(obj.id)}
                        className="p-0.5 rounded hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
                        aria-label={`Retirer ${obj.keyword}`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddObjective()}
                    placeholder="Ex : Data Engineer, Product Manager..."
                    className="flex-1 min-w-0 px-4 py-2.5 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddObjective}
                    disabled={addingObjective || !newObjective.trim()}
                    className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors"
                  >
                    {addingObjective ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    Ajouter
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              CARTE A : BIO (L'IA Assistant)
          ══════════════════════════════════════════════════════════ */}
          <div
            ref={(el) => (sectionsRef.current["bio"] = el)}
            id="section-bio"
            className={`group relative bg-theme-card border border-theme-card-border rounded-2xl p-6 shadow-theme-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300 ${
              highlightedSection === "bio"
                ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 bg-indigo-50/40 dark:bg-indigo-900/15 animate-highlight-pulse"
                : ""
            }`}
          >
            {/* Badge XP si bio vide */}
            {!profile?.bio && (
              <div className="absolute -top-3 -right-3 bg-[#FF8C42] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                +30 pts
              </div>
            )}

            {/* Header avec titre et boutons IA */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <h3 className="text-lg font-bold text-theme-text-primary flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                  <ScrollText
                    className="text-indigo-600 dark:text-indigo-400"
                    size={20}
                  />
                </div>
                Ma Bio Professionnelle
              </h3>

              <div className="flex items-center gap-2">
                {/* Bouton "Surprends-moi" */}
                <button
                  onClick={handleGenerateBio}
                  disabled={isGeneratingBio || isReformulatingBio}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
                >
                  {isGeneratingBio ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Wand2 size={16} />
                      Surprends-moi
                    </>
                  )}
                </button>

                {/* Bouton Reformuler avec menu */}
                <div className="relative" ref={bioReformulateRef}>
                  <button
                    onClick={() =>
                      setShowBioReformulateMenu(!showBioReformulateMenu)
                    }
                    disabled={
                      !bio.trim() || isReformulatingBio || isGeneratingBio
                    }
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                      bio.trim() && !isReformulatingBio
                        ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30 hover:scale-[1.02] active:scale-95"
                        : "bg-theme-bg-tertiary text-theme-text-muted cursor-not-allowed"
                    }`}
                  >
                    {isReformulatingBio ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Reformulation...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Reformuler
                      </>
                    )}
                  </button>

                  {/* Menu déroulant reformulation */}
                  {showBioReformulateMenu &&
                    !isReformulatingBio &&
                    bio.trim() && (
                      <div className="absolute right-0 mt-2 w-72 bg-theme-card border border-theme-border rounded-2xl shadow-theme-xl z-50 overflow-hidden">
                        <div className="p-2 space-y-1">
                          {[
                            {
                              value: "more_professional",
                              label: "Plus professionnel",
                              desc: "Rendre le texte plus formel",
                              icon: "💼",
                            },
                            {
                              value: "fix_grammar",
                              label: "Corriger orthographe",
                              desc: "Corriger les erreurs",
                              icon: "✏️",
                            },
                            {
                              value: "more_concise",
                              label: "Plus concis",
                              desc: "Raccourcir le texte",
                              icon: "📝",
                            },
                            {
                              value: "highlight_results",
                              label: "Mettre en valeur",
                              desc: "Verbes d'action et métriques",
                              icon: "🚀",
                            },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleReformulateBio(option.value)}
                              className="w-full flex items-center gap-3 px-3 py-3 text-sm rounded-xl hover:bg-theme-bg-tertiary transition-colors"
                            >
                              <span className="text-lg">{option.icon}</span>
                              <div className="text-left">
                                <div className="font-semibold text-theme-text-primary">
                                  {option.label}
                                </div>
                                <div className="text-xs text-theme-text-muted">
                                  {option.desc}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Zone de texte */}
            <textarea
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                setIsEditingBio(true);
              }}
              placeholder="Décrivez votre parcours professionnel, vos compétences clés et ce qui vous distingue..."
              rows={6}
              disabled={isGeneratingBio || isReformulatingBio}
              className={`w-full px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary placeholder-theme-text-muted focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none transition-all text-sm ${
                isGeneratingBio || isReformulatingBio
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            />

            {isEditingBio && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSaveBio}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Enregistrer
                </button>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              CARTE B : CONTACT (Grid 2x2)
          ══════════════════════════════════════════════════════════ */}
          <div
            ref={(el) => (sectionsRef.current["contact"] = el)}
            id="section-contact"
            className={`group relative bg-theme-card border border-theme-card-border rounded-2xl p-6 shadow-theme-sm hover:border-cyan-400 dark:hover:border-cyan-600 transition-all duration-300 ${
              highlightedSection === "contact"
                ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 bg-indigo-50/40 dark:bg-indigo-900/15 animate-highlight-pulse"
                : ""
            }`}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-theme-text-primary flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/50 rounded-xl flex items-center justify-center">
                  <Phone
                    className="text-cyan-600 dark:text-cyan-400"
                    size={20}
                  />
                </div>
                Informations de Contact
              </h3>
            </div>

            {/* Grid 2x2 pour les inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Localisation */}
              <div className="relative">
                <label className="block text-xs font-semibold text-theme-text-muted mb-2 uppercase tracking-wide">
                  Localisation
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500"
                  />
                  <input
                    type="text"
                    className="w-full bg-theme-bg-secondary border border-theme-border rounded-xl pl-11 pr-4 py-3 text-theme-text-primary placeholder-theme-text-muted focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-sm"
                    placeholder="Paris, France"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setIsEditingContact(true);
                    }}
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div className="relative">
                <label className="block text-xs font-semibold text-theme-text-muted mb-2 uppercase tracking-wide">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500"
                  />
                  <input
                    type="tel"
                    className={`w-full bg-theme-bg-secondary border rounded-xl pl-11 pr-4 py-3 text-theme-text-primary placeholder-theme-text-muted outline-none transition-all text-sm ${
                      validationErrors.phone
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-theme-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    }`}
                    placeholder="+33 6 12 34 56 78"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setIsEditingContact(true);
                      if (validationErrors.phone)
                        setValidationErrors((prev) => ({
                          ...prev,
                          phone: undefined,
                        }));
                    }}
                  />
                </div>
                {validationErrors.phone && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              {/* LinkedIn */}
              <div className="relative">
                <label className="block text-xs font-semibold text-theme-text-muted mb-2 uppercase tracking-wide">
                  LinkedIn
                </label>
                <div className="relative">
                  <Linkedin
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
                  />
                  <input
                    type="url"
                    className={`w-full bg-theme-bg-secondary border rounded-xl pl-11 pr-4 py-3 text-theme-text-primary placeholder-theme-text-muted outline-none transition-all text-sm ${
                      validationErrors.linkedinUrl
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-theme-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                    placeholder="linkedin.com/in/votre-profil"
                    value={linkedinUrl}
                    onChange={(e) => {
                      setLinkedinUrl(e.target.value);
                      setIsEditingContact(true);
                      if (validationErrors.linkedinUrl)
                        setValidationErrors((prev) => ({
                          ...prev,
                          linkedinUrl: undefined,
                        }));
                    }}
                  />
                </div>
                {validationErrors.linkedinUrl && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.linkedinUrl}
                  </p>
                )}
              </div>

              {/* GitHub */}
              <div className="relative">
                <label className="block text-xs font-semibold text-theme-text-muted mb-2 uppercase tracking-wide">
                  GitHub
                </label>
                <div className="relative">
                  <Github
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500"
                  />
                  <input
                    type="url"
                    className={`w-full bg-theme-bg-secondary border rounded-xl pl-11 pr-4 py-3 text-theme-text-primary placeholder-theme-text-muted outline-none transition-all text-sm ${
                      validationErrors.githubUrl
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-theme-border focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    }`}
                    placeholder="github.com/votre-username"
                    value={githubUrl}
                    onChange={(e) => {
                      setGithubUrl(e.target.value);
                      setIsEditingContact(true);
                      if (validationErrors.githubUrl)
                        setValidationErrors((prev) => ({
                          ...prev,
                          githubUrl: undefined,
                        }));
                    }}
                  />
                </div>
                {validationErrors.githubUrl && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.githubUrl}
                  </p>
                )}
              </div>

              {/* Portfolio - Full width */}
              <div className="relative md:col-span-2">
                <label className="block text-xs font-semibold text-theme-text-muted mb-2 uppercase tracking-wide">
                  Portfolio / Site web
                </label>
                <div className="relative">
                  <LinkIcon
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500"
                  />
                  <input
                    type="url"
                    className={`w-full bg-theme-bg-secondary border rounded-xl pl-11 pr-4 py-3 text-theme-text-primary placeholder-theme-text-muted outline-none transition-all text-sm ${
                      validationErrors.portfolioUrl
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-theme-border focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    }`}
                    placeholder="https://votre-portfolio.com"
                    value={portfolioUrl}
                    onChange={(e) => {
                      setPortfolioUrl(e.target.value);
                      setIsEditingContact(true);
                      if (validationErrors.portfolioUrl)
                        setValidationErrors((prev) => ({
                          ...prev,
                          portfolioUrl: undefined,
                        }));
                    }}
                  />
                </div>
                {validationErrors.portfolioUrl && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.portfolioUrl}
                  </p>
                )}
              </div>
            </div>

            {isEditingContact && (
              <div className="flex justify-end mt-5">
                <button
                  onClick={handleSaveContact}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-200/50 dark:shadow-cyan-900/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Enregistrer
                </button>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              CARTE C : EXPÉRIENCES (Timeline)
          ══════════════════════════════════════════════════════════ */}
          <div
            ref={(el) => (sectionsRef.current["experiences"] = el)}
            id="section-experiences"
            className={`bg-theme-card border border-theme-card-border rounded-2xl p-6 shadow-theme-sm hover:border-[#FF8C42]/50 transition-all duration-300 ${
              highlightedSection === "experiences"
                ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 bg-indigo-50/40 dark:bg-indigo-900/15 animate-highlight-pulse"
                : ""
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-theme-text-primary flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center">
                  <Briefcase className="text-[#FF8C42]" size={20} />
                </div>
                Expériences
              </h3>
              <button
                onClick={handleAddExperience}
                className="w-10 h-10 bg-[#FF8C42] hover:bg-[#E07230] text-white rounded-xl flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30"
              >
                <Plus size={20} />
              </button>
            </div>

            {experiences.length === 0 ? (
              /* Carte Fantôme incitative - Version compacte */
              <button
                onClick={handleAddExperience}
                className="w-full border-2 border-dashed border-theme-border hover:border-[#FF8C42] rounded-2xl p-5 transition-all group cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-theme-bg-tertiary rounded-xl flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors flex-shrink-0">
                    <Briefcase
                      size={22}
                      className="text-theme-text-muted group-hover:text-[#FF8C42] transition-colors"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-theme-text-primary font-bold mb-0.5">
                      Ajoutez votre première expérience
                    </p>
                    <p className="text-theme-text-muted text-sm">
                      Débloquez le badge "Expérimenté" 🏆
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-[#FF8C42] text-white text-sm font-bold rounded-xl shadow-lg flex-shrink-0">
                    <Plus size={14} /> +50 pts
                  </span>
                </div>
              </button>
            ) : (
              /* Timeline avec ligne verticale */
              <div className="relative">
                {/* Ligne verticale de timeline */}
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#FF8C42] via-rose-400 to-theme-border" />

                <div className="space-y-4">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="relative pl-14 group">
                      {/* Point sur la timeline */}
                      <div
                        className={`absolute left-4 top-6 w-4 h-4 rounded-full border-2 ${
                          exp.is_current
                            ? "bg-[#FF8C42] border-orange-300 dark:border-orange-600"
                            : "bg-theme-bg-tertiary border-theme-border"
                        }`}
                      />

                      {/* Carte expérience */}
                      <div className="bg-theme-bg-secondary hover:bg-theme-bg-tertiary border border-theme-border hover:border-[#FF8C42]/30 rounded-2xl p-5 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-theme-text-primary font-bold text-lg">
                                {exp.title}
                              </h4>
                              {exp.is_current && (
                                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-[#FF8C42] text-xs font-bold rounded-full">
                                  En cours
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                              <Logo
                                name={exp.company}
                                type="company"
                                size={40}
                                showFallback={false}
                              />
                              <p className="text-[#FF8C42] font-semibold text-sm">
                                {exp.company}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-theme-text-muted">
                              {exp.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} className="text-rose-500" />{" "}
                                  {exp.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar size={12} className="text-blue-500" />
                                {exp.start_date
                                  ? new Date(exp.start_date).toLocaleDateString(
                                      "fr-FR",
                                      { month: "short", year: "numeric" },
                                    )
                                  : ""}
                                {" → "}
                                {exp.is_current ? (
                                  <span className="text-[#FF8C42] font-semibold">
                                    Présent
                                  </span>
                                ) : exp.end_date ? (
                                  new Date(exp.end_date).toLocaleDateString(
                                    "fr-FR",
                                    { month: "short", year: "numeric" },
                                  )
                                ) : (
                                  ""
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditExperience(exp)}
                              className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-theme-text-muted hover:text-[#FF8C42] rounded-xl transition-colors"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => deleteExperience(exp.id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-theme-text-muted hover:text-red-500 rounded-xl transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        {exp.description && exp.description.trim() && (
                          <div className="mt-3 pt-3 border-t border-theme-border">
                            <FormattedText
                              as="p"
                              className="text-theme-text-secondary text-sm leading-relaxed"
                            >
                              {exp.description}
                            </FormattedText>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Bouton Ajout en bas de timeline */}
                  <button
                    onClick={handleAddExperience}
                    className="relative pl-14 w-full text-left group"
                  >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-dashed border-theme-border group-hover:border-[#FF8C42] transition-colors" />
                    <div className="border-2 border-dashed border-theme-border hover:border-[#FF8C42] rounded-2xl px-5 py-4 transition-all group-hover:bg-orange-50 dark:group-hover:bg-orange-900/10">
                      <span className="flex items-center gap-2 text-theme-text-muted group-hover:text-[#FF8C42] font-semibold transition-colors">
                        <Plus size={18} /> Ajouter une étape à mon histoire
                        <span className="ml-auto text-xs font-bold text-[#FF8C42] bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-lg">
                          +50 pts
                        </span>
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              CARTE C (suite) : FORMATIONS (Timeline)
          ══════════════════════════════════════════════════════════ */}
          <div
            ref={(el) => (sectionsRef.current["educations"] = el)}
            id="section-educations"
            className={`bg-theme-card border border-theme-card-border rounded-2xl p-6 shadow-theme-sm hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 ${
              highlightedSection === "educations"
                ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 bg-indigo-50/40 dark:bg-indigo-900/15 animate-highlight-pulse"
                : ""
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-theme-text-primary flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                  <GraduationCap
                    className="text-purple-600 dark:text-purple-400"
                    size={20}
                  />
                </div>
                Formations
              </h3>
              <button
                onClick={handleAddEducation}
                className="w-10 h-10 bg-purple-500 hover:bg-purple-600 text-white rounded-xl flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30"
              >
                <Plus size={20} />
              </button>
            </div>

            {educations.length === 0 ? (
              <button
                onClick={handleAddEducation}
                className="w-full border-2 border-dashed border-theme-border hover:border-purple-500 rounded-2xl p-5 transition-all group cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-theme-bg-tertiary rounded-xl flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors flex-shrink-0">
                    <GraduationCap
                      size={22}
                      className="text-theme-text-muted group-hover:text-purple-500 transition-colors"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-theme-text-primary font-bold mb-0.5">
                      Ajoutez vos formations
                    </p>
                    <p className="text-theme-text-muted text-sm">
                      Diplômes, certifications, formations continues...
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500 text-white text-sm font-bold rounded-xl shadow-lg flex-shrink-0">
                    <Plus size={14} /> +40 pts
                  </span>
                </div>
              </button>
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-purple-500 via-indigo-400 to-theme-border" />
                <div className="space-y-4">
                  {educations.map((edu) => (
                    <div key={edu.id} className="relative pl-14 group">
                      <div
                        className={`absolute left-4 top-6 w-4 h-4 rounded-full border-2 ${
                          edu.is_current
                            ? "bg-purple-500 border-purple-300 dark:border-purple-600"
                            : "bg-theme-bg-tertiary border-theme-border"
                        }`}
                      />
                      <div className="bg-theme-bg-secondary hover:bg-theme-bg-tertiary border border-theme-border hover:border-purple-400/30 rounded-2xl p-5 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-theme-text-primary font-bold text-lg">
                                {edu.degree}
                              </h4>
                              {edu.is_current && (
                                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full">
                                  En cours
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                              <Logo
                                name={edu.school}
                                type="school"
                                size={40}
                                showFallback={false}
                              />
                              <p className="text-purple-600 dark:text-purple-400 font-semibold text-sm">
                                {edu.school}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-theme-text-muted">
                              {edu.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} className="text-rose-500" />{" "}
                                  {edu.location}
                                </span>
                              )}
                              {edu.field_of_study && (
                                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-lg">
                                  {edu.field_of_study}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar size={12} className="text-blue-500" />
                                {edu.start_date
                                  ? new Date(edu.start_date).toLocaleDateString(
                                      "fr-FR",
                                      { month: "short", year: "numeric" },
                                    )
                                  : ""}
                                {" → "}
                                {edu.is_current ? (
                                  <span className="text-purple-500">
                                    Présent
                                  </span>
                                ) : edu.end_date ? (
                                  new Date(edu.end_date).toLocaleDateString(
                                    "fr-FR",
                                    { month: "short", year: "numeric" },
                                  )
                                ) : (
                                  ""
                                )}
                              </span>
                              {edu.grade && (
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                  🏆 {edu.grade}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditEducation(edu)}
                              className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-theme-text-muted hover:text-purple-500 rounded-xl transition-colors"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => deleteEducation(edu.id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-theme-text-muted hover:text-red-500 rounded-xl transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        {edu.description && edu.description.trim() && (
                          <div className="mt-3 pt-3 border-t border-theme-border">
                            <FormattedText
                              as="p"
                              className="text-theme-text-secondary text-sm leading-relaxed"
                            >
                              {edu.description}
                            </FormattedText>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleAddEducation}
                    className="relative pl-14 w-full text-left group"
                  >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-dashed border-theme-border group-hover:border-purple-500 transition-colors" />
                    <div className="border-2 border-dashed border-theme-border hover:border-purple-500 rounded-2xl px-5 py-4 transition-all group-hover:bg-purple-50 dark:group-hover:bg-purple-900/10">
                      <span className="flex items-center gap-2 text-theme-text-muted group-hover:text-purple-500 font-semibold transition-colors">
                        <Plus size={18} /> Ajouter une formation
                        <span className="ml-auto text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-lg">
                          +40 pts
                        </span>
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              CARTE E : PROJETS (Showcase Grid)
          ══════════════════════════════════════════════════════════ */}
          <div
            ref={(el) => (sectionsRef.current["projects"] = el)}
            id="section-projects"
            className={`bg-theme-card border border-theme-card-border rounded-2xl p-6 shadow-theme-sm hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 ${
              highlightedSection === "projects"
                ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 bg-indigo-50/40 dark:bg-indigo-900/15 animate-highlight-pulse"
                : ""
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-theme-text-primary flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                  <Rocket
                    className="text-blue-600 dark:text-blue-400"
                    size={20}
                  />
                </div>
                Projets
              </h3>
              <button
                onClick={handleAddProject}
                className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30"
              >
                <Plus size={20} />
              </button>
            </div>

            {projects.length === 0 ? (
              <button
                onClick={handleAddProject}
                className="w-full border-2 border-dashed border-theme-border hover:border-blue-500 rounded-2xl p-8 text-center transition-all group cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10"
              >
                <div className="w-16 h-16 bg-theme-bg-tertiary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Rocket
                    size={28}
                    className="text-theme-text-muted group-hover:text-blue-500 transition-colors"
                  />
                </div>
                <p className="text-theme-text-primary font-bold text-lg mb-2">
                  Montrez vos réalisations
                </p>
                <p className="text-theme-text-muted text-sm mb-4">
                  Projets perso, contributions open source, side projects...
                </p>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-bold rounded-xl shadow-lg">
                  <Plus size={16} /> Ajouter (+35 pts)
                </span>
              </button>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="group bg-theme-bg-secondary hover:bg-theme-bg-tertiary border border-theme-border hover:border-blue-400/30 rounded-2xl p-5 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3 gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Image ou Icône du projet */}
                        {proj.project_icon ? (
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                            {(() => {
                              const IconComponent =
                                (LucideIcons as any)[proj.project_icon] ||
                                LucideIcons.Code;
                              return (
                                <IconComponent
                                  size={24}
                                  className="text-blue-600 dark:text-blue-400"
                                />
                              );
                            })()}
                          </div>
                        ) : proj.url_image ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-theme-border">
                            <img
                              src={proj.url_image}
                              alt={proj.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                        ) : null}
                        <h4 className="text-theme-text-primary font-bold text-lg flex-1 min-w-0">
                          {proj.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditProject(proj)}
                          className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-theme-text-muted hover:text-blue-500 rounded-lg transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteProject(proj.id)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-theme-text-muted hover:text-red-500 rounded-lg transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {proj.description && (
                      <p className="text-theme-text-secondary text-sm mb-4 line-clamp-2">
                        {proj.description}
                      </p>
                    )}

                    {/* Liens */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {proj.url_demo && (
                        <a
                          href={proj.url_demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                        >
                          Démo
                        </a>
                      )}
                      {proj.url_github && (
                        <a
                          href={proj.url_github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                        >
                          💻 GitHub
                        </a>
                      )}
                    </div>

                    {/* Technologies */}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {proj.technologies.slice(0, 5).map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg text-xs font-semibold"
                          >
                            {tech}
                          </span>
                        ))}
                        {proj.technologies.length > 5 && (
                          <span className="px-2 py-1 bg-theme-bg-tertiary text-theme-text-muted rounded-lg text-xs">
                            +{proj.technologies.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Carte d'ajout - Version compacte */}
                <button
                  onClick={handleAddProject}
                  className="border-2 border-dashed border-theme-border hover:border-blue-500 rounded-2xl p-5 flex items-center gap-4 min-h-[100px] transition-all group hover:bg-blue-50 dark:hover:bg-blue-900/10"
                >
                  <div className="w-12 h-12 bg-theme-bg-tertiary rounded-xl flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors flex-shrink-0">
                    <Plus
                      size={22}
                      className="text-theme-text-muted group-hover:text-blue-500 transition-colors"
                    />
                  </div>
                  <div className="text-left">
                    <span className="text-theme-text-primary font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block">
                      Ajouter un projet
                    </span>
                    <span className="text-xs text-blue-500 font-semibold">
                      +35 pts
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              CARTE : LANGUES (Chips)
          ══════════════════════════════════════════════════════════ */}
          <div
            ref={(el) => (sectionsRef.current["languages"] = el)}
            id="section-languages"
            className={`bg-theme-card border border-theme-card-border rounded-2xl p-6 shadow-theme-sm hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300 ${
              highlightedSection === "languages"
                ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 bg-indigo-50/40 dark:bg-indigo-900/15 animate-highlight-pulse"
                : ""
            }`}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-theme-text-primary flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
                  <Globe
                    className="text-emerald-600 dark:text-emerald-400"
                    size={20}
                  />
                </div>
                Langues
              </h3>
              <button
                onClick={handleAddLanguage}
                className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30"
              >
                <Plus size={20} />
              </button>
            </div>

            {languages.length === 0 ? (
              <button
                onClick={handleAddLanguage}
                className="w-full border-2 border-dashed border-theme-border hover:border-emerald-500 rounded-2xl p-4 transition-all group hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌍</span>
                  <p className="text-theme-text-muted group-hover:text-emerald-500 transition-colors flex-1 text-left">
                    Ajoutez vos langues
                  </p>
                  <span className="text-emerald-500 font-bold text-sm">
                    +10 pts
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex flex-wrap gap-3">
                {languages.map((lang) => (
                  <div
                    key={lang.id}
                    className="group flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl hover:border-emerald-400 transition-all"
                  >
                    <span className="text-lg">🌍</span>
                    <span className="text-theme-text-primary font-bold">
                      {lang.name}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg">
                      {lang.level}
                    </span>
                    <button
                      onClick={() => deleteLanguage(lang.id)}
                      className="text-theme-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              CARTE : CERTIFICATIONS
          ══════════════════════════════════════════════════════════ */}
          <div
            ref={(el) => (sectionsRef.current["certifications"] = el)}
            id="section-certifications"
            className={`bg-theme-card border border-theme-card-border rounded-2xl p-6 shadow-theme-sm hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-300 ${
              highlightedSection === "certifications"
                ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 bg-indigo-50/40 dark:bg-indigo-900/15 animate-highlight-pulse"
                : ""
            }`}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-theme-text-primary flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center">
                  <Award
                    className="text-amber-600 dark:text-amber-400"
                    size={20}
                  />
                </div>
                Certifications
              </h3>
              <button
                onClick={handleAddCertification}
                className="w-10 h-10 bg-amber-500 hover:bg-amber-600 text-white rounded-xl flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30"
              >
                <Plus size={20} />
              </button>
            </div>

            {certifications.length === 0 ? (
              <button
                onClick={handleAddCertification}
                className="w-full border-2 border-dashed border-theme-border hover:border-amber-500 rounded-2xl p-8 text-center transition-all group hover:bg-amber-50 dark:hover:bg-amber-900/10"
              >
                <div className="w-16 h-16 bg-theme-bg-tertiary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors">
                  <Award
                    size={28}
                    className="text-theme-text-muted group-hover:text-amber-500 transition-colors"
                  />
                </div>
                <p className="text-theme-text-primary font-bold text-lg mb-2">
                  Valorisez vos compétences
                </p>
                <p className="text-theme-text-muted text-sm mb-4">
                  AWS, Google Cloud, Microsoft, Coursera...
                </p>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-bold rounded-xl shadow-lg">
                  <Plus size={16} /> Ajouter (+30 pts)
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="group bg-theme-bg-secondary hover:bg-theme-bg-tertiary border border-theme-border hover:border-amber-400/30 rounded-2xl p-4 transition-all flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award
                        className="text-amber-600 dark:text-amber-400"
                        size={24}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-theme-text-primary font-bold truncate">
                        {cert.name}
                      </h4>
                      <p className="text-amber-600 dark:text-amber-400 text-sm">
                        {cert.issuer}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-theme-text-muted mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />{" "}
                          {cert.date_obtained
                            ? new Date(cert.date_obtained).toLocaleDateString(
                                "fr-FR",
                                { month: "short", year: "numeric" },
                              )
                            : ""}
                        </span>
                        {cert.url && (
                          <a
                            href={cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-500 hover:underline"
                          >
                            🔗 Voir
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCertification(cert.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-theme-text-muted hover:text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              CARTE : CENTRES D'INTÉRÊT (Chips)
          ══════════════════════════════════════════════════════════ */}
          <div
            ref={(el) => (sectionsRef.current["interests"] = el)}
            id="section-interests"
            className={`bg-theme-card border border-theme-card-border rounded-2xl p-6 shadow-theme-sm hover:border-pink-400 dark:hover:border-pink-600 transition-all duration-300 ${
              highlightedSection === "interests"
                ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 bg-indigo-50/40 dark:bg-indigo-900/15 animate-highlight-pulse"
                : ""
            }`}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-theme-text-primary flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/50 rounded-xl flex items-center justify-center">
                  <Palette
                    className="text-pink-600 dark:text-pink-400"
                    size={20}
                  />
                </div>
                Centres d'intérêt
              </h3>
              <button
                onClick={handleAddInterest}
                className="w-10 h-10 bg-pink-500 hover:bg-pink-600 text-white rounded-xl flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-pink-200/50 dark:shadow-pink-900/30"
              >
                <Plus size={20} />
              </button>
            </div>

            {interests.length === 0 ? (
              <button
                onClick={handleAddInterest}
                className="w-full border-2 border-dashed border-theme-border hover:border-pink-500 rounded-2xl p-4 transition-all group hover:bg-pink-50 dark:hover:bg-pink-900/10"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">❤️</span>
                  <p className="text-theme-text-muted group-hover:text-pink-500 transition-colors flex-1 text-left">
                    Ajoutez vos passions
                  </p>
                  <span className="text-pink-500 font-bold text-sm">
                    +15 pts
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex flex-wrap gap-3">
                {interests.map((interest) => (
                  <div
                    key={interest.id}
                    className="group flex items-center gap-2 px-4 py-2.5 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-2xl hover:border-pink-400 transition-all"
                  >
                    <span className="text-theme-text-primary font-bold">
                      {interest.name}
                    </span>
                    <button
                      onClick={() => {
                        setEditingInterest(interest);
                        setIsInterestModalOpen(true);
                      }}
                      className="text-theme-text-muted hover:text-pink-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteInterest(interest.id)}
                      className="text-theme-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              CARTE D : COMPÉTENCES (Deck Builder)
          ══════════════════════════════════════════════════════════ */}
          <div
            ref={(el) => (sectionsRef.current["skills"] = el)}
            id="section-skills"
            className={`bg-theme-card border border-theme-card-border rounded-2xl p-6 shadow-theme-sm hover:border-yellow-400 dark:hover:border-yellow-600 transition-all duration-300 ${
              highlightedSection === "skills"
                ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 bg-indigo-50/40 dark:bg-indigo-900/15 animate-highlight-pulse"
                : ""
            }`}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-theme-text-primary flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center">
                  <Zap
                    className="text-yellow-600 dark:text-yellow-400"
                    size={20}
                  />
                </div>
                Compétences
                {skills.length > 0 && (
                  <span className="text-xs text-theme-text-muted font-normal ml-2">
                    ({skills.length} acquises)
                  </span>
                )}
              </h3>
              <button
                onClick={handleAddSkill}
                className="w-10 h-10 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-yellow-200/50 dark:shadow-yellow-900/30"
              >
                <Plus size={20} />
              </button>
            </div>

            {skills.length === 0 ? (
              <button
                onClick={handleAddSkill}
                className="w-full border-2 border-dashed border-theme-border hover:border-yellow-500 rounded-2xl p-5 transition-all group hover:bg-yellow-50 dark:hover:bg-yellow-900/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-theme-bg-tertiary rounded-xl flex items-center justify-center group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/30 transition-colors flex-shrink-0">
                    <Zap
                      size={22}
                      className="text-theme-text-muted group-hover:text-yellow-500 transition-colors"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-theme-text-primary font-bold mb-0.5">
                      Ajoutez vos compétences
                    </p>
                    <p className="text-theme-text-muted text-sm">
                      Chaque compétence vous rapporte des points !
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500 text-white text-sm font-bold rounded-xl shadow-lg flex-shrink-0">
                    <Plus size={14} /> +10 pts
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="group flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300"
                  >
                    <span>{skill.name}</span>
                    {skill.category && (
                      <span className="text-xs text-theme-text-muted">
                        • {skill.category}
                      </span>
                    )}
                    <button
                      onClick={() => deleteSkill(skill.id)}
                      className="text-theme-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {/* Bouton rapide d'ajout */}
                <button
                  onClick={handleAddSkill}
                  className="flex items-center gap-1 px-3 py-2 border-2 border-dashed border-theme-border hover:border-yellow-500 rounded-xl text-theme-text-muted hover:text-yellow-500 transition-all"
                >
                  <Plus size={14} /> Ajouter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ExperienceFormModal
        isOpen={isExperienceModalOpen}
        onClose={() => {
          setIsExperienceModalOpen(false);
          setEditingExperience(null);
        }}
        onSuccess={handleExperienceSuccess}
        experienceToEdit={editingExperience}
      />
      <EducationFormModal
        isOpen={isEducationModalOpen}
        onClose={() => {
          setIsEducationModalOpen(false);
          setEditingEducation(null);
        }}
        onSuccess={handleEducationSuccess}
        educationToEdit={editingEducation}
      />
      <ProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSuccess={handleProjectSuccess}
        projectToEdit={editingProject}
      />
      <LanguageFormModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        onSuccess={handleLanguageSuccess}
      />
      <CertificationFormModal
        isOpen={isCertificationModalOpen}
        onClose={() => setIsCertificationModalOpen(false)}
        onSuccess={handleCertificationSuccess}
      />
      <InterestFormModal
        isOpen={isInterestModalOpen}
        onClose={() => {
          setIsInterestModalOpen(false);
          setEditingInterest(null);
        }}
        onSuccess={handleInterestSuccess}
        editingInterest={editingInterest}
      />

      <SkillFormModal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        onSuccess={handleSkillSuccess}
      />
    </div>
  );
};
