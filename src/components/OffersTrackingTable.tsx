/**
 * OffersTrackingTable - Tableau de suivi des offres d'emploi (style Excel amélioré)
 *
 * Affiche un tableau avec toutes les informations de suivi des candidatures.
 * Permet de définir des dates de relance, de classer les offres et de suivre les entretiens/tests.
 */

import React, { useState, useMemo, useEffect } from "react";
import DOMPurify from "dompurify";
import {
  ExternalLink,
  Edit2,
  Save,
  X,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Briefcase,
  TestTube,
  UserCheck,
  ChevronUp as MoveUp,
  ChevronDown as MoveDown,
  CheckCircle,
} from "lucide-react";
import { JobOffer, UpdateOfferStatusRequest } from "../services/api";
import { PreApplyModal } from "./PreApplyModal";

interface OffersTrackingTableProps {
  offers: JobOffer[];
  onUpdateOffer: (
    offerId: string,
    updates: Partial<UpdateOfferStatusRequest>,
  ) => Promise<void>;
  onOffersUpdated?: () => void; // Callback pour notifier que les offres ont été mises à jour
}

type SortField =
  | "company_name"
  | "title"
  | "contract_type"
  | "location"
  | "applied_at"
  | "followup_date"
  | "hr_interview_date"
  | "technical_interview_date"
  | "test_scheduled_date";
type SortDirection = "asc" | "desc";

export const OffersTrackingTable: React.FC<OffersTrackingTableProps> = ({
  offers,
  onUpdateOffer,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onOffersUpdated: _onOffersUpdated,
}) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [editingOffer, setEditingOffer] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UpdateOfferStatusRequest>>(
    {},
  );
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedOfferForDetails, setSelectedOfferForDetails] =
    useState<JobOffer | null>(null);
  const [quickDateEdit, setQuickDateEdit] = useState<{
    offerId: string;
    field:
      | "hr_interview_date"
      | "technical_interview_date"
      | "test_scheduled_date";
  } | null>(null);
  const [preApplyOffer, setPreApplyOffer] = useState<JobOffer | null>(null);

  // Charger l'ordre manuel depuis localStorage au montage
  const [manualOrder, setManualOrder] = useState<Map<string, number>>(() => {
    try {
      const saved = localStorage.getItem("offers_manual_order");
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Map(
          Object.entries(parsed).map(([k, v]) => [k, v as number]),
        );
      }
    } catch (e) {
      console.error("Erreur chargement ordre manuel:", e);
    }
    return new Map();
  });

  // Sauvegarder l'ordre manuel dans localStorage à chaque changement
  useEffect(() => {
    try {
      const orderObj = Object.fromEntries(manualOrder);
      localStorage.setItem("offers_manual_order", JSON.stringify(orderObj));
    } catch (e) {
      console.error("Erreur sauvegarde ordre manuel:", e);
    }
  }, [manualOrder]);

  // Séparer les offres actives et refusées
  const { activeOffers, rejectedOffers } = useMemo(() => {
    const active = offers.filter((o) => !o.rejected && !o.job_found);
    const rejected = offers.filter((o) => o.rejected && !o.job_found);
    return { activeOffers: active, rejectedOffers: rejected };
  }, [offers]);

  // Fonction de tri
  const sortedActiveOffers = useMemo(() => {
    let sorted = [...activeOffers];

    // Si un tri manuel existe, l'appliquer en priorité
    if (manualOrder.size > 0) {
      // Créer un map pour un accès rapide
      const orderMap = new Map(manualOrder);

      sorted.sort((a, b) => {
        const orderA = orderMap.get(a.id);
        const orderB = orderMap.get(b.id);

        // Si les deux ont un ordre manuel, les trier par ordre
        if (orderA !== undefined && orderB !== undefined) {
          return orderA - orderB;
        }
        // Si seul A a un ordre, il passe en premier
        if (orderA !== undefined) return -1;
        // Si seul B a un ordre, il passe en premier
        if (orderB !== undefined) return 1;
        // Si aucun n'a d'ordre, garder l'ordre original ou appliquer le tri par colonne
        return 0;
      });

      // Appliquer le tri par colonne uniquement aux offres sans ordre manuel
      if (sortField) {
        const offersWithOrder = sorted.filter((o) => orderMap.has(o.id));
        const offersWithoutOrder = sorted.filter((o) => !orderMap.has(o.id));

        offersWithoutOrder.sort((a, b) => {
          let aValue: any = a[sortField as keyof JobOffer];
          let bValue: any = b[sortField as keyof JobOffer];

          if (aValue == null && bValue == null) return 0;
          if (aValue == null) return 1;
          if (bValue == null) return -1;

          if (
            aValue instanceof Date ||
            (typeof aValue === "string" && aValue.includes("T"))
          ) {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
          }

          if (typeof aValue === "string") {
            aValue = aValue.toLowerCase();
            bValue = (bValue || "").toLowerCase();
          }

          const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          return sortDirection === "asc" ? comparison : -comparison;
        });

        // Recombiner : offres avec ordre manuel d'abord, puis offres triées
        sorted = [...offersWithOrder, ...offersWithoutOrder];
      }
    } else {
      // Pas de tri manuel, appliquer le tri par colonne normalement
      if (sortField) {
        sorted.sort((a, b) => {
          let aValue: any = a[sortField as keyof JobOffer];
          let bValue: any = b[sortField as keyof JobOffer];

          if (aValue == null && bValue == null) return 0;
          if (aValue == null) return 1;
          if (bValue == null) return -1;

          if (
            aValue instanceof Date ||
            (typeof aValue === "string" && aValue.includes("T"))
          ) {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
          }

          if (typeof aValue === "string") {
            aValue = aValue.toLowerCase();
            bValue = (bValue || "").toLowerCase();
          }

          const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          return sortDirection === "asc" ? comparison : -comparison;
        });
      }
    }

    return sorted;
  }, [activeOffers, sortField, sortDirection, manualOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleEdit = (offer: JobOffer) => {
    setEditingOffer(offer.id);
    setEditForm({
      followup_date: offer.followup_date
        ? new Date(offer.followup_date).toISOString().split("T")[0]
        : undefined,
      hr_interview_date: offer.hr_interview_date
        ? formatDateTimeLocal(offer.hr_interview_date)
        : undefined,
      technical_interview_date: offer.technical_interview_date
        ? formatDateTimeLocal(offer.technical_interview_date)
        : undefined,
      test_scheduled_date: offer.test_scheduled_date
        ? formatDateTimeLocal(offer.test_scheduled_date)
        : undefined,
      notes: offer.notes || "",
    });
  };

  const handleQuickDateUpdate = async (
    offerId: string,
    field:
      | "hr_interview_date"
      | "technical_interview_date"
      | "test_scheduled_date",
    value: string | null,
  ) => {
    try {
      const updates: Partial<UpdateOfferStatusRequest> = {};

      if (value) {
        // Convertir datetime-local en ISO string
        const isoString = convertDateTimeLocalToISO(value);
        if (!isoString) {
          console.error("Impossible de convertir la date:", value);
          return;
        }
        updates[field] = isoString;
        // Activer aussi le flag correspondant
        if (field === "hr_interview_date") {
          updates.hr_interview_scheduled = true;
        } else if (field === "technical_interview_date") {
          updates.technical_interview_scheduled = true;
        } else if (field === "test_scheduled_date") {
          updates.test_requested = true;
        }
      } else {
        updates[field] = undefined;
        // Désactiver le flag si on supprime la date
        if (field === "hr_interview_date") {
          updates.hr_interview_scheduled = false;
        } else if (field === "technical_interview_date") {
          updates.technical_interview_scheduled = false;
        } else if (field === "test_scheduled_date") {
          updates.test_requested = false;
        }
      }

      await onUpdateOffer(offerId, updates);
      setQuickDateEdit(null); // Fermer l'édition rapide après sauvegarde
      // Note: onUpdateOffer met déjà à jour l'état local, pas besoin de onOffersUpdated()
    } catch (err) {
      console.error("Erreur mise à jour date:", err);
    }
  };

  const handleQuickDateSave = (value: string) => {
    if (quickDateEdit) {
      handleQuickDateUpdate(quickDateEdit.offerId, quickDateEdit.field, value);
    }
  };

  // Convertir une date ISO en format datetime-local pour l'input
  // Note: datetime-local utilise l'heure locale, pas UTC
  const formatDateTimeLocal = (
    date: string | Date | null | undefined,
  ): string => {
    if (!date) return "";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      if (isNaN(d.getTime())) return "";
      // Convertir en format datetime-local (YYYY-MM-DDTHH:mm) en heure UTC
      // Puisque convertDateTimeLocalToISO crée une date UTC avec l'heure locale,
      // on doit lire les valeurs UTC pour récupérer l'heure originale
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      const hours = String(d.getUTCHours()).padStart(2, "0");
      const minutes = String(d.getUTCMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  // Convertir datetime-local en ISO string (en préservant l'heure locale)
  const convertDateTimeLocalToISO = (value: string): string => {
    if (!value) return "";
    // datetime-local retourne "YYYY-MM-DDTHH:mm" en heure locale (sans timezone)
    // Le problème: new Date(value) interprète comme locale, puis toISOString() convertit en UTC
    // Solution: créer une date UTC avec l'heure locale pour préserver l'heure exacte
    try {
      // Parser la valeur datetime-local (format: "YYYY-MM-DDTHH:mm")
      const [datePart, timePart] = value.split("T");
      if (!datePart || !timePart) {
        console.error("Format datetime-local invalide:", value);
        return "";
      }

      const [year, month, day] = datePart.split("-").map(Number);
      const [hours, minutes] = timePart.split(":").map(Number);

      // Créer une date UTC avec l'heure locale pour préserver l'heure exacte
      // Date.UTC() crée un timestamp UTC, donc l'heure sera préservée
      const utcDate = new Date(
        Date.UTC(year, month - 1, day, hours, minutes, 0, 0),
      );

      if (isNaN(utcDate.getTime())) {
        console.error("Date invalide:", value);
        return "";
      }

      // Retourner l'ISO string (qui sera en UTC mais avec l'heure locale préservée)
      return utcDate.toISOString();
    } catch (error) {
      console.error("Erreur conversion datetime-local:", error);
      return "";
    }
  };

  const handleSave = async (offerId: string) => {
    try {
      const updates: Partial<UpdateOfferStatusRequest> = {};

      if (editForm.followup_date) {
        const date = new Date(editForm.followup_date + "T00:00:00Z");
        updates.followup_date = date.toISOString();
      } else if (editForm.followup_date === "") {
        updates.followup_date = undefined;
      }

      // Gérer les dates d'entretien RH (datetime-local format)
      if (editForm.hr_interview_date) {
        const isoString = convertDateTimeLocalToISO(editForm.hr_interview_date);
        if (isoString) {
          updates.hr_interview_date = isoString;
          updates.hr_interview_scheduled = true;
        }
      } else if (editForm.hr_interview_date === "") {
        updates.hr_interview_date = undefined;
        updates.hr_interview_scheduled = false;
      }

      // Gérer les dates d'entretien technique (datetime-local format)
      if (editForm.technical_interview_date) {
        const isoString = convertDateTimeLocalToISO(
          editForm.technical_interview_date,
        );
        if (isoString) {
          updates.technical_interview_date = isoString;
          updates.technical_interview_scheduled = true;
        }
      } else if (editForm.technical_interview_date === "") {
        updates.technical_interview_date = undefined;
        updates.technical_interview_scheduled = false;
      }

      // Gérer les dates de test (datetime-local format)
      if (editForm.test_scheduled_date) {
        const isoString = convertDateTimeLocalToISO(
          editForm.test_scheduled_date,
        );
        if (isoString) {
          updates.test_scheduled_date = isoString;
          updates.test_requested = true;
        }
      } else if (editForm.test_scheduled_date === "") {
        updates.test_scheduled_date = undefined;
        updates.test_requested = false;
      }

      if (editForm.notes !== undefined) {
        updates.notes = editForm.notes;
      }

      await onUpdateOffer(offerId, updates);
      setEditingOffer(null);
      setEditForm({});
      // Note: onUpdateOffer met déjà à jour l'état local, pas besoin de onOffersUpdated()
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
    }
  };

  const handleCancel = () => {
    setEditingOffer(null);
    setEditForm({});
  };

  const toggleRow = (offerId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(offerId)) {
        newSet.delete(offerId);
      } else {
        newSet.add(offerId);
      }
      return newSet;
    });
  };

  const handleMoveUp = (offerId: string) => {
    setManualOrder((prev) => {
      const newMap = new Map(prev);

      // Calculer l'ordre actuel basé sur l'ordre manuel ou l'index
      const getCurrentOrder = (id: string, index: number) => {
        return newMap.get(id) ?? index + 1;
      };

      // Créer une liste avec les ordres actuels
      const offersWithOrder = activeOffers
        .map((offer, index) => ({
          offer,
          order: getCurrentOrder(offer.id, index),
          index,
        }))
        .sort((a, b) => a.order - b.order);

      const currentIndex = offersWithOrder.findIndex(
        (item) => item.offer.id === offerId,
      );

      if (currentIndex <= 0) return prev; // Déjà en première position

      // Échanger avec l'offre au-dessus
      const currentItem = offersWithOrder[currentIndex];
      const aboveItem = offersWithOrder[currentIndex - 1];

      newMap.set(currentItem.offer.id, aboveItem.order);
      newMap.set(aboveItem.offer.id, currentItem.order);

      return newMap;
    });
  };

  const handleMoveDown = (offerId: string) => {
    setManualOrder((prev) => {
      const newMap = new Map(prev);

      // Calculer l'ordre actuel basé sur l'ordre manuel ou l'index
      const getCurrentOrder = (id: string, index: number) => {
        return newMap.get(id) ?? index + 1;
      };

      // Créer une liste avec les ordres actuels
      const offersWithOrder = activeOffers
        .map((offer, index) => ({
          offer,
          order: getCurrentOrder(offer.id, index),
          index,
        }))
        .sort((a, b) => a.order - b.order);

      const currentIndex = offersWithOrder.findIndex(
        (item) => item.offer.id === offerId,
      );
      const maxIndex = offersWithOrder.length - 1;

      if (currentIndex >= maxIndex) return prev; // Déjà en dernière position

      // Échanger avec l'offre en-dessous
      const currentItem = offersWithOrder[currentIndex];
      const belowItem = offersWithOrder[currentIndex + 1];

      newMap.set(currentItem.offer.id, belowItem.order);
      newMap.set(belowItem.offer.id, currentItem.order);

      return newMap;
    });
  };

  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return "-";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      if (isNaN(d.getTime())) return "-";
      // Afficher la date et l'heure si l'heure est présente
      // Vérifier si la date originale contient une heure (format ISO avec T)
      const dateStr = typeof date === "string" ? date : date.toISOString();
      if (dateStr.includes("T") && dateStr.length > 10) {
        // Il y a une heure, afficher date + heure
        return d.toLocaleString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        // Pas d'heure, afficher seulement la date
        return d.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
    } catch {
      return "-";
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-slate-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={14} className="text-purple-600 dark:text-purple-400" />
    ) : (
      <ArrowDown size={14} className="text-purple-600 dark:text-purple-400" />
    );
  };

  const isFollowupDue = (
    followupDate: string | Date | null | undefined,
  ): boolean => {
    if (!followupDate) return false;
    const date =
      typeof followupDate === "string" ? new Date(followupDate) : followupDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date <= today;
  };

  const renderOfferRow = (offer: JobOffer, isRejected: boolean = false) => {
    const isExpanded = expandedRows.has(offer.id);
    const isEditing = editingOffer === offer.id;
    const followupDue = isFollowupDue(offer.followup_date);
    const manualOrderValue = manualOrder.get(offer.id);

    return (
      <React.Fragment key={offer.id}>
        <tr
          className={`hover:bg-theme-bg-secondary transition-colors group ${
            isRejected
              ? "bg-red-50/50 dark:bg-red-900/20 border-l-4 border-red-500"
              : followupDue && offer.followup_date
                ? "bg-purple-50/50 dark:bg-purple-900/20 border-l-4 border-purple-500"
                : ""
          }`}
        >
          {/* Ordre manuel */}
          <td className="px-3 py-3 whitespace-nowrap text-sm">
            {!isRejected && (
              <div className="flex items-center gap-1">
                <GripVertical size={16} className="text-theme-text-muted" />
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMoveUp(offer.id)}
                    className="p-0.5 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded transition-colors"
                    title="Monter"
                  >
                    <MoveUp size={12} />
                  </button>
                  <button
                    onClick={() => handleMoveDown(offer.id)}
                    className="p-0.5 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded transition-colors"
                    title="Descendre"
                  >
                    <MoveDown size={12} />
                  </button>
                </div>
                {manualOrderValue !== undefined && (
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">
                    #{manualOrderValue}
                  </span>
                )}
              </div>
            )}
          </td>

          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-theme-text-primary">
            {offer.company_name || "-"}
          </td>

          <td className="px-4 py-3 text-sm text-theme-text-primary">
            <button
              onClick={() => setSelectedOfferForDetails(offer)}
              className="max-w-xs truncate text-left hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer underline decoration-dotted underline-offset-2"
              title="Cliquer pour voir la description complète"
            >
              {offer.title}
            </button>
          </td>

          <td className="px-4 py-3 whitespace-nowrap text-sm text-theme-text-secondary">
            {offer.contract_type || "-"}
          </td>

          <td className="px-4 py-3 whitespace-nowrap text-sm text-theme-text-secondary">
            {offer.location || offer.location_city || "-"}
          </td>

          <td className="px-4 py-3 whitespace-nowrap text-sm">
            {offer.apply_url ? (
              <a
                href={offer.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                <ExternalLink size={14} />
                Lien
              </a>
            ) : (
              <span className="text-theme-text-muted">-</span>
            )}
          </td>

          {/* À postuler */}
          <td className="px-4 py-3 whitespace-nowrap text-sm">
            {offer.is_applied ? (
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <CheckCircle size={16} />
                <span className="font-medium">OK</span>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreApplyOffer(offer);
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white rounded-lg text-xs font-semibold transition-all shadow-md hover:shadow-lg"
                title="Postuler à cette offre"
              >
                Postuler
              </button>
            )}
          </td>

          <td className="px-4 py-3 whitespace-nowrap text-sm text-theme-text-secondary">
            {formatDate(offer.applied_at)}
          </td>

          <td className="px-4 py-3 whitespace-nowrap text-sm">
            {isEditing ? (
              <input
                type="date"
                value={editForm.followup_date || ""}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    followup_date: e.target.value || undefined,
                  })
                }
                className="px-2 py-1 text-xs border border-theme-border rounded bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <div className="flex items-center gap-2">
                {offer.followup_date ? (
                  <>
                    <span
                      className={
                        followupDue
                          ? "text-red-600 dark:text-red-400 font-semibold"
                          : "text-theme-text-secondary"
                      }
                    >
                      {formatDate(offer.followup_date)}
                    </span>
                    {followupDue && (
                      <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full font-medium">
                        À relancer
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-theme-text-muted">-</span>
                )}
              </div>
            )}
          </td>

          {/* Entretien RH */}
          <td className="px-4 py-3 whitespace-nowrap text-sm">
            {isEditing ? (
              <input
                type="datetime-local"
                value={
                  editForm.hr_interview_date
                    ? formatDateTimeLocal(editForm.hr_interview_date)
                    : ""
                }
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    hr_interview_date: e.target.value || undefined,
                  })
                }
                className="px-2 py-1 text-xs border border-theme-border rounded bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            ) : quickDateEdit?.offerId === offer.id &&
              quickDateEdit?.field === "hr_interview_date" ? (
              <div className="flex items-center gap-1">
                <input
                  type="datetime-local"
                  autoFocus
                  defaultValue={formatDateTimeLocal(offer.hr_interview_date)}
                  onBlur={(e) => {
                    if (e.target.value) {
                      handleQuickDateSave(e.target.value);
                    } else {
                      setQuickDateEdit(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      handleQuickDateSave(e.currentTarget.value);
                    } else if (e.key === "Escape") {
                      setQuickDateEdit(null);
                    }
                  }}
                  className="px-2 py-1 text-xs border border-blue-500 rounded bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuickDateEdit(null);
                  }}
                  className="p-0.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  title="Annuler"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {offer.hr_interview_scheduled && offer.hr_interview_date ? (
                  <>
                    <UserCheck
                      size={14}
                      className="text-blue-600 dark:text-blue-400"
                    />
                    <span className="text-blue-600 dark:text-blue-400">
                      {formatDate(offer.hr_interview_date)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickDateUpdate(
                          offer.id,
                          "hr_interview_date",
                          null,
                        );
                      }}
                      className="ml-1 p-0.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer la date"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickDateEdit({
                        offerId: offer.id,
                        field: "hr_interview_date",
                      });
                    }}
                    className="flex items-center gap-1.5 text-theme-text-muted hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Ajouter une date"
                  >
                    <UserCheck size={14} />
                    <span className="text-xs">Ajouter</span>
                  </button>
                )}
              </div>
            )}
          </td>

          {/* Entretien technique */}
          <td className="px-4 py-3 whitespace-nowrap text-sm">
            {isEditing ? (
              <input
                type="datetime-local"
                value={
                  editForm.technical_interview_date
                    ? formatDateTimeLocal(editForm.technical_interview_date)
                    : ""
                }
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    technical_interview_date: e.target.value || undefined,
                  })
                }
                className="px-2 py-1 text-xs border border-theme-border rounded bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={(e) => e.stopPropagation()}
              />
            ) : quickDateEdit?.offerId === offer.id &&
              quickDateEdit?.field === "technical_interview_date" ? (
              <div className="flex items-center gap-1">
                <input
                  type="datetime-local"
                  autoFocus
                  defaultValue={formatDateTimeLocal(
                    offer.technical_interview_date,
                  )}
                  onBlur={(e) => {
                    if (e.target.value) {
                      handleQuickDateSave(e.target.value);
                    } else {
                      setQuickDateEdit(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      handleQuickDateSave(e.currentTarget.value);
                    } else if (e.key === "Escape") {
                      setQuickDateEdit(null);
                    }
                  }}
                  className="px-2 py-1 text-xs border border-indigo-500 rounded bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuickDateEdit(null);
                  }}
                  className="p-0.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  title="Annuler"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {offer.technical_interview_scheduled &&
                offer.technical_interview_date ? (
                  <>
                    <Briefcase
                      size={14}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {formatDate(offer.technical_interview_date)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickDateUpdate(
                          offer.id,
                          "technical_interview_date",
                          null,
                        );
                      }}
                      className="ml-1 p-0.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer la date"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickDateEdit({
                        offerId: offer.id,
                        field: "technical_interview_date",
                      });
                    }}
                    className="flex items-center gap-1.5 text-theme-text-muted hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Ajouter une date"
                  >
                    <Briefcase size={14} />
                    <span className="text-xs">Ajouter</span>
                  </button>
                )}
              </div>
            )}
          </td>

          {/* Test */}
          <td className="px-4 py-3 whitespace-nowrap text-sm">
            {isEditing ? (
              <input
                type="datetime-local"
                value={
                  editForm.test_scheduled_date
                    ? formatDateTimeLocal(editForm.test_scheduled_date)
                    : ""
                }
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    test_scheduled_date: e.target.value || undefined,
                  })
                }
                className="px-2 py-1 text-xs border border-theme-border rounded bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-orange-500"
                onClick={(e) => e.stopPropagation()}
              />
            ) : quickDateEdit?.offerId === offer.id &&
              quickDateEdit?.field === "test_scheduled_date" ? (
              <div className="flex items-center gap-1">
                <input
                  type="datetime-local"
                  autoFocus
                  defaultValue={formatDateTimeLocal(offer.test_scheduled_date)}
                  onBlur={(e) => {
                    if (e.target.value) {
                      handleQuickDateSave(e.target.value);
                    } else {
                      setQuickDateEdit(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      handleQuickDateSave(e.currentTarget.value);
                    } else if (e.key === "Escape") {
                      setQuickDateEdit(null);
                    }
                  }}
                  className="px-2 py-1 text-xs border border-orange-500 rounded bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuickDateEdit(null);
                  }}
                  className="p-0.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  title="Annuler"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {offer.test_requested && offer.test_scheduled_date ? (
                  <>
                    <TestTube
                      size={14}
                      className="text-orange-600 dark:text-orange-400"
                    />
                    <span className="text-orange-600 dark:text-orange-400">
                      {formatDate(offer.test_scheduled_date)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickDateUpdate(
                          offer.id,
                          "test_scheduled_date",
                          null,
                        );
                      }}
                      className="ml-1 p-0.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer la date"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickDateEdit({
                        offerId: offer.id,
                        field: "test_scheduled_date",
                      });
                    }}
                    className="flex items-center gap-1.5 text-theme-text-muted hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    title="Ajouter une date"
                  >
                    <TestTube size={14} />
                    <span className="text-xs">Ajouter</span>
                  </button>
                )}
              </div>
            )}
          </td>

          <td className="px-4 py-3 whitespace-nowrap text-sm">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSave(offer.id)}
                  className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                  title="Enregistrer"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                  title="Annuler"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(offer)}
                  className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded transition-colors"
                  title="Modifier"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => toggleRow(offer.id)}
                  className="p-1.5 text-theme-text-muted hover:bg-theme-bg-tertiary rounded transition-colors"
                  title={isExpanded ? "Masquer détails" : "Afficher détails"}
                >
                  {isExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>
            )}
          </td>
        </tr>

        {isExpanded && (
          <tr>
            <td colSpan={11} className="px-4 py-4 bg-theme-bg-secondary">
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-theme-text-muted">
                      Source:
                    </span>
                    <p className="text-theme-text-primary">
                      {offer.source || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-theme-text-muted">
                      Plateforme:
                    </span>
                    <p className="text-theme-text-primary">
                      {offer.source_platform || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-theme-text-muted">
                      Télétravail:
                    </span>
                    <p className="text-theme-text-primary">
                      {offer.remote_type || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-theme-text-muted">
                      Salaire:
                    </span>
                    <p className="text-theme-text-primary">
                      {offer.salary_info || "-"}
                    </p>
                  </div>
                </div>
                {isEditing ? (
                  <div>
                    <label className="block text-xs font-semibold text-theme-text-muted mb-1">
                      Notes personnelles
                    </label>
                    <textarea
                      value={editForm.notes || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, notes: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-theme-border rounded-lg bg-theme-bg-primary text-theme-text-primary resize-none"
                      rows={3}
                      placeholder="Ajoutez vos notes sur cette offre..."
                    />
                  </div>
                ) : (
                  offer.notes && (
                    <div>
                      <span className="text-xs font-semibold text-theme-text-muted">
                        Notes:
                      </span>
                      <p className="text-sm text-theme-text-primary mt-1 whitespace-pre-wrap">
                        {offer.notes}
                      </p>
                    </div>
                  )
                )}
                {isRejected && offer.rejection_reason && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                      Raison du refus:
                    </span>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                      {offer.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="w-full overflow-x-auto bg-theme-card rounded-2xl border border-theme-card-border shadow-lg">
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-theme-border">
            <thead className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-4 text-left text-xs font-bold text-theme-text-primary uppercase tracking-wider"
                >
                  Ordre
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 text-left text-xs font-bold text-theme-text-primary uppercase tracking-wider cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  onClick={() => handleSort("company_name")}
                >
                  <div className="flex items-center gap-2">
                    Entreprise
                    {getSortIcon("company_name")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 text-left text-xs font-bold text-theme-text-primary uppercase tracking-wider cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center gap-2">
                    Intitulé du poste
                    {getSortIcon("title")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 text-left text-xs font-bold text-theme-text-primary uppercase tracking-wider cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  onClick={() => handleSort("contract_type")}
                >
                  <div className="flex items-center gap-2">
                    Type de contrat
                    {getSortIcon("contract_type")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 text-left text-xs font-bold text-theme-text-primary uppercase tracking-wider cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  onClick={() => handleSort("location")}
                >
                  <div className="flex items-center gap-2">
                    Localisation
                    {getSortIcon("location")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 text-left text-xs font-bold text-theme-text-primary uppercase tracking-wider"
                >
                  Lien
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 text-left text-xs font-bold text-theme-text-primary uppercase tracking-wider"
                >
                  À postuler
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 text-left text-xs font-bold text-theme-text-primary uppercase tracking-wider cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  onClick={() => handleSort("applied_at")}
                >
                  <div className="flex items-center gap-2">
                    Date d'envoi
                    {getSortIcon("applied_at")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 text-left text-xs font-bold text-theme-text-primary uppercase tracking-wider cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  onClick={() => handleSort("followup_date")}
                >
                  <div className="flex items-center gap-2">
                    Relance
                    {getSortIcon("followup_date")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 text-left text-xs font-bold text-theme-text-primary uppercase tracking-wider"
                >
                  <div className="flex items-center gap-1.5">
                    <UserCheck size={14} />
                    Ent. RH
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 text-left text-xs font-bold text-theme-text-primary uppercase tracking-wider"
                >
                  <div className="flex items-center gap-1.5">
                    <Briefcase size={14} />
                    Ent. Tech
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 text-left text-xs font-bold text-theme-text-primary uppercase tracking-wider"
                >
                  <div className="flex items-center gap-1.5">
                    <TestTube size={14} />
                    Test
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 text-left text-xs font-bold text-theme-text-primary uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-theme-card divide-y divide-theme-border">
              {sortedActiveOffers.length === 0 &&
              rejectedOffers.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="px-4 py-8 text-center text-theme-text-muted"
                  >
                    Aucune offre sauvegardée
                  </td>
                </tr>
              ) : (
                <>
                  {/* Offres actives */}
                  {sortedActiveOffers.map((offer) =>
                    renderOfferRow(offer, false),
                  )}

                  {/* Séparateur visuel */}
                  {rejectedOffers.length > 0 &&
                    sortedActiveOffers.length > 0 && (
                      <tr>
                        <td
                          colSpan={13}
                          className="px-4 py-2 bg-red-50/30 dark:bg-red-900/10 border-t-2 border-red-200 dark:border-red-800"
                        >
                          <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                            Offres refusées
                          </div>
                        </td>
                      </tr>
                    )}

                  {/* Offres refusées */}
                  {rejectedOffers.map((offer) => renderOfferRow(offer, true))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pop-up de description de l'offre */}
      {selectedOfferForDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedOfferForDetails(null)}
        >
          <div
            className="bg-theme-card rounded-2xl border border-theme-card-border shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-theme-card-border bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-theme-text-primary mb-2">
                  {selectedOfferForDetails.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-theme-text-secondary">
                  {selectedOfferForDetails.company_name && (
                    <span className="font-semibold text-theme-text-primary">
                      {selectedOfferForDetails.company_name}
                    </span>
                  )}
                  {selectedOfferForDetails.location && (
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {selectedOfferForDetails.location}
                    </span>
                  )}
                  {selectedOfferForDetails.contract_type && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                      {selectedOfferForDetails.contract_type}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedOfferForDetails(null)}
                className="p-2 text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-secondary rounded-lg transition-colors"
                title="Fermer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedOfferForDetails.full_description ? (
                <div
                  className="prose prose-slate dark:prose-invert max-w-none text-theme-text-primary"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      selectedOfferForDetails.full_description,
                    ),
                  }}
                />
              ) : selectedOfferForDetails.description ? (
                <div
                  className="prose prose-slate dark:prose-invert max-w-none text-theme-text-primary"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      selectedOfferForDetails.description,
                    ),
                  }}
                />
              ) : (
                <p className="text-theme-text-muted italic">
                  Aucune description disponible pour cette offre.
                </p>
              )}

              {/* Informations supplémentaires */}
              <div className="mt-6 pt-6 border-t border-theme-border">
                <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
                  Informations complémentaires
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {selectedOfferForDetails.remote_type && (
                    <div>
                      <span className="font-semibold text-theme-text-muted">
                        Télétravail:
                      </span>
                      <p className="text-theme-text-primary">
                        {selectedOfferForDetails.remote_type}
                      </p>
                    </div>
                  )}
                  {selectedOfferForDetails.salary_info && (
                    <div>
                      <span className="font-semibold text-theme-text-muted">
                        Salaire:
                      </span>
                      <p className="text-theme-text-primary">
                        {selectedOfferForDetails.salary_info}
                      </p>
                    </div>
                  )}
                  {selectedOfferForDetails.seniority_level && (
                    <div>
                      <span className="font-semibold text-theme-text-muted">
                        Niveau:
                      </span>
                      <p className="text-theme-text-primary">
                        {selectedOfferForDetails.seniority_level}
                      </p>
                    </div>
                  )}
                  {selectedOfferForDetails.required_experience && (
                    <div>
                      <span className="font-semibold text-theme-text-muted">
                        Expérience:
                      </span>
                      <p className="text-theme-text-primary">
                        {selectedOfferForDetails.required_experience}
                      </p>
                    </div>
                  )}
                  {selectedOfferForDetails.skills &&
                    selectedOfferForDetails.skills.length > 0 && (
                      <div className="col-span-2 md:col-span-3">
                        <span className="font-semibold text-theme-text-muted">
                          Compétences:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedOfferForDetails.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Lien de candidature */}
              {selectedOfferForDetails.apply_url && (
                <div className="mt-6 pt-6 border-t border-theme-border">
                  <a
                    href={selectedOfferForDetails.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    <ExternalLink size={18} />
                    Postuler sur le site de l'entreprise
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal PreApplyModal */}
      {preApplyOffer && (
        <PreApplyModal
          isOpen={!!preApplyOffer}
          onClose={() => setPreApplyOffer(null)}
          onApply={async () => {
            if (preApplyOffer.apply_url) {
              // Marquer l'offre comme postulée
              try {
                await onUpdateOffer(preApplyOffer.id, {
                  is_applied: true,
                  applied_at: new Date().toISOString(),
                });
                // Note: onUpdateOffer met déjà à jour l'état local, pas besoin de onOffersUpdated()
              } catch (err) {
                console.error("Erreur lors de la postulation:", err);
              }
              // Ouvrir le lien
              window.open(
                preApplyOffer.apply_url,
                "_blank",
                "noopener,noreferrer",
              );
            }
            setPreApplyOffer(null);
          }}
          onMarkAsApplied={async () => {
            // Marquer l'offre comme postulée sans ouvrir le lien
            try {
              await onUpdateOffer(preApplyOffer.id, {
                is_applied: true,
                applied_at: new Date().toISOString(),
              });
              // Fermer la pop-up après la mise à jour
              // Note: onUpdateOffer met déjà à jour l'état local, pas besoin de onOffersUpdated()
              setPreApplyOffer(null);
            } catch (err) {
              console.error("Erreur lors de la marque comme postulé:", err);
            }
          }}
          offerTitle={preApplyOffer.title}
          offerUrl={preApplyOffer.apply_url || ""}
        />
      )}
    </div>
  );
};
