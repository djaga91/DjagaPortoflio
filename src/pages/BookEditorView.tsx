import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Eye,
  ExternalLink,
  Sparkles,
  Loader2,
  Crown,
  Lock,
  CheckSquare,
  Square,
  X,
  ArrowDownAZ,
} from "lucide-react";
import { bookAPI } from "../services/api";
import { BookToolbar } from "../components/BookToolbar";
import { FlipBook } from "../components/FlipBook";
import { DragAndDropList } from "../components/portfolio/DragAndDropList";
import { useGameStore } from "../store/gameStore";
import type { BookPage, BookConfig, BookLimits } from "../types";

const FREE_LIMIT = 20;
const PREMIUM_LIMIT = 100;

const DEFAULT_CONFIG: BookConfig = {
  palette: {
    background: "#FAF9F6",
    text: "#1A1A2E",
    accent: "#B8860B",
    page: "#FFFFFF",
  },
  font_title: "Playfair Display",
  font_body: "Inter",
  title: "",
  subtitle: "",
  contact_email: "",
  contact_phone: "",
  show_badges: true,
  show_cv_button: true,
  cv_id: null,
  dark_mode: false,
};

export const BookEditorView: React.FC = () => {
  const { user, setActiveToast } = useGameStore();
  const [pages, setPages] = useState<BookPage[]>([]);
  const [config, setConfig] = useState<BookConfig>(DEFAULT_CONFIG);
  const [limits, setLimits] = useState<BookLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const configTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFree = limits ? limits.tier === "free" && !limits.has_addon : true;
  const freeSlotsFull = isFree && (limits?.current_count ?? 0) >= FREE_LIMIT;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pagesData, configData, limitsData] = await Promise.all([
        bookAPI.listPages(),
        bookAPI.getConfig(),
        bookAPI.getLimits(),
      ]);
      setPages(pagesData);
      setConfig({ ...DEFAULT_CONFIG, ...configData });
      setLimits(limitsData);
    } catch (err) {
      console.error("Erreur chargement book:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      if (limits && pages.length + fileArray.length > limits.max_pages) {
        alert(
          `Vous ne pouvez pas dépasser ${limits.max_pages} pages. Il vous reste ${limits.max_pages - pages.length} emplacements.`,
        );
        return;
      }

      setUploading(true);
      try {
        for (const file of fileArray) {
          const newPage = await bookAPI.uploadPage(file);
          setPages((prev) => [...prev, newPage]);
        }
        const newLimits = await bookAPI.getLimits();
        setLimits(newLimits);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        const msg =
          axiosErr?.response?.data?.detail || "Erreur lors de l'upload";
        alert(msg);
      } finally {
        setUploading(false);
      }
    },
    [limits, pages.length],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload],
  );

  const handleDeletePage = useCallback(async (pageId: string) => {
    if (!confirm("Supprimer cette page ?")) return;
    try {
      await bookAPI.deletePage(pageId);
      setPages((prev) => prev.filter((p) => p.id !== pageId));
      const newLimits = await bookAPI.getLimits();
      setLimits(newLimits);
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  }, []);

  const toggleSelection = useCallback((pageId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(pages.map((p) => p.id)));
  }, [pages]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (
      !confirm(
        `Supprimer ${count} page${count > 1 ? "s" : ""} sélectionnée${count > 1 ? "s" : ""} ?`,
      )
    )
      return;

    setBulkDeleting(true);
    try {
      await bookAPI.bulkDeletePages(Array.from(selectedIds));
      setPages((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      setSelectionMode(false);
      const newLimits = await bookAPI.getLimits();
      setLimits(newLimits);
      setActiveToast({
        type: "success",
        title: "Pages supprimées",
        message: `${count} page${count > 1 ? "s ont été supprimées" : " a été supprimée"} de votre book.`,
        icon: "🗑️",
      });
    } catch (err) {
      console.error("Erreur suppression multiple:", err);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message: "Impossible de supprimer les pages sélectionnées.",
        icon: "❌",
      });
    } finally {
      setBulkDeleting(false);
    }
  }, [selectedIds, setActiveToast]);

  const handleDeleteAll = useCallback(async () => {
    if (pages.length === 0) return;
    if (
      !confirm(
        `Supprimer TOUTES les ${pages.length} pages de votre book ? Cette action est irréversible.`,
      )
    )
      return;

    const totalCount = pages.length;
    setBulkDeleting(true);
    try {
      await bookAPI.deleteAllPages();
      setPages([]);
      setSelectedIds(new Set());
      setSelectionMode(false);
      const newLimits = await bookAPI.getLimits();
      setLimits(newLimits);
      setActiveToast({
        type: "success",
        title: "Book vidé",
        message: `${totalCount} page${totalCount > 1 ? "s ont été supprimées" : " a été supprimée"}.`,
        icon: "🗑️",
      });
    } catch (err) {
      console.error("Erreur suppression totale:", err);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message: "Impossible de supprimer toutes les pages.",
        icon: "❌",
      });
    } finally {
      setBulkDeleting(false);
    }
  }, [pages.length, setActiveToast]);

  const handleCaptionChange = useCallback(
    async (pageId: string, caption: string) => {
      try {
        await bookAPI.updatePage(pageId, { caption });
        setPages((prev) =>
          prev.map((p) => (p.id === pageId ? { ...p, caption } : p)),
        );
      } catch (err) {
        console.error("Erreur caption:", err);
      }
    },
    [],
  );

  const handleConfigChange = useCallback(
    (updates: Partial<BookConfig>) => {
      const newConfig = { ...config, ...updates };
      setConfig(newConfig);

      if (configTimerRef.current) clearTimeout(configTimerRef.current);
      configTimerRef.current = setTimeout(async () => {
        setSavingConfig(true);
        try {
          await bookAPI.updateConfig(updates as Record<string, unknown>);
        } catch (err) {
          console.error("Erreur sauvegarde config:", err);
        } finally {
          setSavingConfig(false);
        }
      }, 800);
    },
    [config],
  );

  const handleConfigReset = useCallback(async () => {
    setConfig(DEFAULT_CONFIG);
    try {
      await bookAPI.updateConfig(
        DEFAULT_CONFIG as unknown as Record<string, unknown>,
      );
    } catch (err) {
      console.error("Erreur reset config:", err);
    }
  }, []);

  const handleUpgrade = useCallback(async () => {
    try {
      const { checkout_url } = await bookAPI.createCheckout();
      if (checkout_url) window.location.href = checkout_url;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const msg =
        axiosErr?.response?.data?.detail ||
        "Erreur lors de la création du paiement";
      alert(msg);
    }
  }, []);

  const handleReorder = useCallback(async (reorderedPages: BookPage[]) => {
    setPages(reorderedPages);
    try {
      await bookAPI.reorderPages(reorderedPages.map((p) => p.id));
    } catch (err) {
      console.error("Erreur reorder:", err);
    }
  }, []);

  const handleSortAlphabetical = useCallback(async () => {
    const sorted = [...pages].sort((a, b) => {
      const nameA = (a.original_filename || "").toLowerCase();
      const nameB = (b.original_filename || "").toLowerCase();
      return nameA.localeCompare(nameB, "fr");
    });
    setPages(sorted);
    try {
      await bookAPI.reorderPages(sorted.map((p) => p.id));
    } catch (err) {
      console.error("Erreur tri alphabétique:", err);
    }
  }, [pages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  const currentCount = limits?.current_count ?? 0;
  const progressPercent = Math.min(100, (currentCount / PREMIUM_LIMIT) * 100);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-amber-600" />
            Book Portfolio
            {!isFree && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] font-bold">
                <Crown className="w-3 h-3" />
                PRO
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Créez votre portfolio visuel sous forme de livre interactif
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savingConfig && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Sauvegarde...
            </span>
          )}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors dark:bg-amber-900/20 dark:text-amber-400"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? "Éditeur" : "Aperçu site"}
          </button>
        </div>
      </div>

      {/* Limits banner */}
      {limits && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  {currentCount}
                </span>
                <span className="text-gray-400"> / {PREMIUM_LIMIT} pages</span>
              </div>
              <div className="w-40 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                {isFree && (
                  <div
                    className="absolute top-0 h-full border-r-2 border-amber-600 z-10"
                    style={{ left: `${(FREE_LIMIT / PREMIUM_LIMIT) * 100}%` }}
                    title={`Limite gratuite : ${FREE_LIMIT}`}
                  />
                )}
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    freeSlotsFull ? "bg-red-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {isFree && (
              <button
                onClick={handleUpgrade}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
              >
                <Crown className="w-4 h-4" />
                Débloquer 100 pages — 4,99 €
              </button>
            )}
          </div>

          {/* Free tier warning when approaching / at limit */}
          {isFree && currentCount >= FREE_LIMIT * 0.8 && (
            <div
              className={`px-4 py-3 text-sm flex items-center gap-3 ${
                freeSlotsFull
                  ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-t border-red-200 dark:border-red-800"
                  : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-t border-amber-200 dark:border-amber-800"
              }`}
            >
              {freeSlotsFull ? (
                <>
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Vous avez atteint la limite de{" "}
                    <strong>{FREE_LIMIT} pages gratuites</strong>. Débloquez
                    l'add-on pour accéder jusqu'à {PREMIUM_LIMIT} pages.
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Il vous reste{" "}
                    <strong>{FREE_LIMIT - currentCount} pages gratuites</strong>
                    . Passez à {PREMIUM_LIMIT} pages pour seulement 4,99 € (à
                    vie).
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {showPreview ? (
        /* Preview mode - Full public site preview */
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 font-mono">
              {window.location.origin}/book/{user?.username || "votre-username"}
            </span>
          </div>
          <div className="max-h-[80vh] overflow-y-auto">
            <PublicBookPreview
              pages={pages}
              config={config}
              user={
                user
                  ? {
                      first_name: user.first_name ?? undefined,
                      last_name: user.last_name ?? undefined,
                      username: user.username ?? undefined,
                      profile_picture_url:
                        (user as any).profile_picture_url ?? undefined,
                    }
                  : null
              }
            />
          </div>
        </div>
      ) : (
        /* Editor mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pages list + upload */}
          <div className="lg:col-span-2 space-y-4">
            {/* Drop zone */}
            {!freeSlotsFull ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10"
                    : "border-gray-300 dark:border-gray-600 hover:border-amber-400"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && handleUpload(e.target.files)
                  }
                />
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Glissez vos images ici ou{" "}
                      <span className="text-amber-600 font-medium">
                        parcourez
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, WebP — max 10 MB par image
                    </p>
                  </>
                )}
              </div>
            ) : (
              /* Locked drop zone for free users at limit */
              <div className="relative border-2 border-dashed rounded-xl p-8 text-center border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center gap-3 z-10">
                  <Lock className="w-8 h-8 text-amber-600" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Limite de {FREE_LIMIT} pages atteinte
                  </p>
                  <button
                    onClick={handleUpgrade}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:shadow-lg transition-all shadow-md"
                  >
                    <Crown className="w-4 h-4" />
                    Débloquer {PREMIUM_LIMIT} pages — 4,99 €
                  </button>
                </div>
                <Upload className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-300">
                  Zone d'upload verrouillée
                </p>
              </div>
            )}

            {/* Selection toolbar */}
            {pages.length > 0 && (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {selectionMode ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={
                        selectedIds.size === pages.length
                          ? deselectAll
                          : selectAll
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {selectedIds.size === pages.length ? (
                        <CheckSquare className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      {selectedIds.size === pages.length
                        ? "Tout désélectionner"
                        : "Tout sélectionner"}
                    </button>

                    {selectedIds.size > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        disabled={bulkDeleting}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                      >
                        {bulkDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Supprimer ({selectedIds.size})
                      </button>
                    )}

                    <button
                      onClick={handleDeleteAll}
                      disabled={bulkDeleting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Tout supprimer
                    </button>

                    <button
                      onClick={exitSelectionMode}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>

                    {selectedIds.size > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedIds.size} / {pages.length} sélectionnée
                        {selectedIds.size > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectionMode(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <CheckSquare className="w-4 h-4" />
                      Sélectionner
                    </button>
                    <button
                      onClick={handleSortAlphabetical}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Trier par nom de fichier (A → Z)"
                    >
                      <ArrowDownAZ className="w-4 h-4" />
                      Tri A–Z
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pages grid */}
            {pages.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aucune page pour le moment</p>
                <p className="text-sm mt-1">
                  Uploadez vos premières images pour créer votre book
                </p>
              </div>
            ) : selectionMode ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {pages.map((page, idx) => {
                  const isSelected = selectedIds.has(page.id);
                  return (
                    <div
                      key={page.id}
                      onClick={() => toggleSelection(page.id)}
                      className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-amber-500 ring-2 ring-amber-500/30 shadow-md"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      } bg-white dark:bg-gray-800`}
                    >
                      <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-900">
                        <img
                          src={page.thumbnail_url || page.url}
                          alt={page.caption || `Page ${idx + 1}`}
                          className={`w-full h-full object-cover transition-opacity ${isSelected ? "opacity-75" : ""}`}
                          loading="lazy"
                        />
                      </div>

                      {/* Checkbox overlay */}
                      <div className="absolute top-2 left-2">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center shadow-md">
                            <CheckSquare className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded border-2 border-white/80 bg-black/20 flex items-center justify-center shadow-md">
                            <Square className="w-4 h-4 text-white/80" />
                          </div>
                        )}
                      </div>

                      {/* Page number */}
                      <div className="absolute bottom-10 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                        {idx + 1}
                      </div>

                      {/* Caption (read-only in selection mode) */}
                      <div className="p-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {page.caption || "Sans légende"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <DragAndDropList
                items={pages}
                onReorder={handleReorder}
                getItemId={(page) => page.id}
                strategy="grid"
                buttonSize="small"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                renderItem={(page, idx) => (
                  <div className="group relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-900">
                      <img
                        src={page.thumbnail_url || page.url}
                        alt={page.caption || `Page ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Delete button */}
                    <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-md"
                        title="Supprimer"
                        aria-label="Supprimer la page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Page number */}
                    <div className="absolute bottom-10 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      {idx + 1}
                    </div>

                    {/* Premium badge on pages beyond free limit */}
                    {isFree && idx >= FREE_LIMIT && (
                      <div className="absolute bottom-10 right-1.5 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" />
                      </div>
                    )}

                    {/* Filename + Caption */}
                    <div className="p-2">
                      {page.original_filename && (
                        <p
                          className="text-[10px] text-gray-400 dark:text-gray-500 truncate mb-0.5"
                          title={page.original_filename}
                        >
                          {page.original_filename}
                        </p>
                      )}
                      <input
                        type="text"
                        value={page.caption || ""}
                        onChange={(e) =>
                          handleCaptionChange(page.id, e.target.value)
                        }
                        placeholder="Légende..."
                        className="w-full text-xs bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-amber-500 focus:outline-none py-0.5 text-gray-600 dark:text-gray-400"
                      />
                    </div>
                  </div>
                )}
              />
            )}
          </div>

          {/* Toolbar (right sidebar) */}
          <div className="space-y-4">
            <BookToolbar
              config={config}
              onChange={handleConfigChange}
              onReset={handleConfigReset}
            />

            {/* Upgrade CTA for free users */}
            {isFree && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-amber-600" />
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                    Passez à {PREMIUM_LIMIT} pages
                  </h4>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
                  Vous utilisez {currentCount}/{FREE_LIMIT} pages gratuites.
                  Débloquez l'add-on pour créer un book complet avec jusqu'à{" "}
                  {PREMIUM_LIMIT} planches.
                </p>
                <button
                  onClick={handleUpgrade}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  Débloquer — 4,99 € (à vie)
                </button>
              </div>
            )}

            {/* Public link */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Lien public
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 break-all font-mono">
                {window.location.origin}/book/
                {user?.username || "{votre-username}"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Inline preview of the public book (reuses PublicBookView layout without API call).
 */
function PublicBookPreview({
  pages,
  config,
  user,
}: {
  pages: BookPage[];
  config: BookConfig;
  user: {
    first_name?: string;
    last_name?: string;
    username?: string;
    profile_picture_url?: string;
  } | null;
}) {
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "Votre nom";

  return (
    <div
      className="min-h-[600px]"
      style={{
        backgroundColor: config.palette.background,
        color: config.palette.text,
      }}
    >
      <link
        href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(config.font_title)}:wght@400;700&family=${encodeURIComponent(config.font_body)}:wght@300;400;500&display=swap`}
        rel="stylesheet"
      />

      {/* Header */}
      <header className="py-12 md:py-16 text-center">
        {user?.profile_picture_url && (
          <img
            src={user.profile_picture_url}
            alt={displayName}
            className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2"
            style={{ borderColor: config.palette.accent }}
          />
        )}

        <h1
          className="text-3xl md:text-4xl font-bold mb-2"
          style={{ fontFamily: config.font_title }}
        >
          {config.title || displayName}
        </h1>

        {config.subtitle && (
          <p
            className="text-lg opacity-70"
            style={{ fontFamily: config.font_body }}
          >
            {config.subtitle}
          </p>
        )}

        <div
          className="w-16 h-0.5 mx-auto mt-6"
          style={{ backgroundColor: config.palette.accent }}
        />
      </header>

      {/* Flipbook */}
      <main className="pb-8">
        {pages.length > 0 ? (
          <FlipBook pages={pages} config={config} className="py-4 md:py-8" />
        ) : (
          <div
            className="text-center py-16 opacity-40"
            style={{ fontFamily: config.font_body }}
          >
            <ImageIcon className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg">Aucune page dans votre book</p>
            <p className="text-sm mt-2">
              Ajoutez des images depuis l'éditeur pour voir l'aperçu
            </p>
          </div>
        )}
      </main>

      {/* Contact footer */}
      {(config.contact_email ||
        config.contact_phone ||
        config.show_cv_button) && (
        <footer
          className="py-8 border-t"
          style={{
            borderColor: `${config.palette.text}15`,
            fontFamily: config.font_body,
          }}
        >
          <div className="max-w-md mx-auto text-center space-y-3">
            <h3
              className="text-lg font-semibold mb-4"
              style={{ fontFamily: config.font_title }}
            >
              Contact
            </h3>

            {config.contact_email && (
              <p className="flex items-center justify-center gap-2 text-sm opacity-70">
                <span className="w-4 h-4">✉</span>
                {config.contact_email}
              </p>
            )}

            {config.contact_phone && (
              <p className="flex items-center justify-center gap-2 text-sm opacity-70">
                <span className="w-4 h-4">📞</span>
                {config.contact_phone}
              </p>
            )}

            {config.show_cv_button && config.cv_id && (
              <span
                className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: config.palette.accent,
                  color: config.palette.page,
                }}
              >
                📄 Télécharger mon CV
              </span>
            )}
          </div>

          <p
            className="text-center text-xs opacity-30 mt-8"
            style={{ fontFamily: config.font_body }}
          >
            Créé avec PortfoliA
          </p>
        </footer>
      )}
    </div>
  );
}

export default BookEditorView;
