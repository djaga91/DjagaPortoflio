/**
 * CampaignsAdminView - Dashboard de gestion des campagnes marketing
 *
 * Permet de :
 * - Créer des campagnes (QR codes / liens raccourcis)
 * - Voir les statistiques de scans
 * - Générer et télécharger les QR codes
 * - Visualiser les graphiques de performance
 *
 * NOTE: Nécessite l'installation de :
 * - npm install qrcode.react recharts
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  QrCode,
  BarChart3,
  Smartphone,
  Monitor,
  Tablet,
  Link2,
  Copy,
  Download,
  Trash2,
  Eye,
  X,
  Loader2,
  ExternalLink,
  Target,
  Users,
} from "lucide-react";
import {
  campaignsAPI,
  type MarketingCampaign,
  type CampaignStats,
  type CampaignCreateRequest,
} from "../services/api";
import { useGameStore } from "../store/gameStore";

// QR Code generation
import { QRCodeCanvas } from "qrcode.react";

// Charts for stats visualization
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const CampaignsAdminView: React.FC = () => {
  const { setActiveToast, user } = useGameStore();
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    useState<MarketingCampaign | null>(null);
  const [campaignStats, setCampaignStats] = useState<CampaignStats | null>(
    null,
  );
  const [statsLoading, setStatsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CampaignCreateRequest>({
    name: "",
    target_url: "",
    slug: "",
    description: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  const qrRef = useRef<HTMLDivElement>(null);

  // Vérifier que l'utilisateur est admin
  useEffect(() => {
    if (user && !user.is_superuser) {
      setActiveToast({
        type: "error",
        title: "Accès refusé",
        message: "Cette page est réservée aux administrateurs",
      });
    }
  }, [user, setActiveToast]);

  // Charger les campagnes
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setLoading(true);
        const data = await campaignsAPI.list();
        setCampaigns(data.campaigns);
      } catch (error) {
        console.error("Erreur chargement campagnes:", error);
        setActiveToast({
          type: "error",
          title: "Erreur",
          message: "Impossible de charger les campagnes",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.is_superuser) {
      loadCampaigns();
    }
  }, [user, setActiveToast]);

  // Créer une campagne
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.target_url) {
      setActiveToast({
        type: "error",
        title: "Champs requis",
        message: "Le nom et l'URL cible sont obligatoires",
      });
      return;
    }

    try {
      setFormLoading(true);
      const newCampaign = await campaignsAPI.create({
        name: formData.name,
        target_url: formData.target_url,
        slug: formData.slug || undefined,
        description: formData.description || undefined,
      });
      setCampaigns([newCampaign, ...campaigns]);
      setShowCreateModal(false);
      setFormData({ name: "", target_url: "", slug: "", description: "" });
      setActiveToast({
        type: "success",
        title: "Campagne créée !",
        message: `Slug: ${newCampaign.slug}`,
      });
    } catch (error: any) {
      console.error("Erreur création campagne:", error);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message:
          error.response?.data?.detail || "Impossible de créer la campagne",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Supprimer une campagne
  const handleDelete = async (campaign: MarketingCampaign) => {
    if (
      !confirm(
        `Supprimer la campagne "${campaign.name}" et toutes ses statistiques ?`,
      )
    ) {
      return;
    }

    try {
      await campaignsAPI.delete(campaign.id);
      setCampaigns(campaigns.filter((c) => c.id !== campaign.id));
      setActiveToast({
        type: "success",
        title: "Campagne supprimée",
        message: campaign.name,
      });
    } catch (error) {
      console.error("Erreur suppression:", error);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message: "Impossible de supprimer la campagne",
      });
    }
  };

  // Voir les stats
  const handleViewStats = async (campaign: MarketingCampaign) => {
    setSelectedCampaign(campaign);
    setShowStatsModal(true);
    setStatsLoading(true);

    try {
      const stats = await campaignsAPI.getStats(campaign.id, 7);
      setCampaignStats(stats);
    } catch (error) {
      console.error("Erreur stats:", error);
      setActiveToast({
        type: "error",
        title: "Erreur",
        message: "Impossible de charger les statistiques",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Voir le QR code
  const handleViewQR = (campaign: MarketingCampaign) => {
    setSelectedCampaign(campaign);
    setShowQRModal(true);
  };

  // Copier le lien
  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setActiveToast({
      type: "success",
      title: "Lien copié !",
      message: url,
    });
  };

  // Télécharger le QR code en PNG
  const downloadQR = () => {
    if (!qrRef.current || !selectedCampaign) return;

    const canvas = qrRef.current.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = `qr-${selectedCampaign.slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  if (!user?.is_superuser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Target className="w-16 h-16 text-theme-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-theme-text-primary">
            Accès refusé
          </h2>
          <p className="text-theme-text-secondary mt-2">
            Cette page est réservée aux administrateurs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-text-primary flex items-center gap-3">
            <QrCode className="w-8 h-8 text-purple-500" />
            Campagnes Marketing
          </h1>
          <p className="text-theme-text-secondary mt-1">
            Créez des QR codes et liens raccourcis pour tracker vos campagnes
            d'acquisition
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Campagne
        </button>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-theme-card border border-theme-card-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-theme-text-secondary">
                Campagnes actives
              </p>
              <p className="text-2xl font-bold text-theme-text-primary">
                {campaigns.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme-card-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-theme-text-secondary">Total scans</p>
              <p className="text-2xl font-bold text-theme-text-primary">
                {campaigns.reduce((acc, c) => acc + c.total_scans, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-theme-card border border-theme-card-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-theme-text-secondary">
                Taux de conversion
              </p>
              <p className="text-2xl font-bold text-theme-text-primary">--%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des campagnes */}
      <div className="bg-theme-card border border-theme-card-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-theme-border">
          <h2 className="font-semibold text-theme-text-primary">
            Vos campagnes
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center p-12">
            <QrCode className="w-12 h-12 text-theme-text-muted mx-auto mb-3" />
            <p className="text-theme-text-secondary">Aucune campagne créée</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              Créer votre première campagne
            </button>
          </div>
        ) : (
          <div className="divide-y divide-theme-border">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-4 hover:bg-theme-bg-secondary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-theme-text-primary truncate">
                        {campaign.name}
                      </h3>
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                        /{campaign.slug}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-theme-text-secondary flex items-center gap-1">
                        <Link2 className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">
                          {campaign.target_url}
                        </span>
                      </span>
                      <span className="text-sm text-theme-text-secondary flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {campaign.total_scans} scans
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => copyLink(campaign.redirect_url)}
                      className="p-2 text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-secondary rounded-lg transition-colors"
                      title="Copier le lien"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleViewQR(campaign)}
                      className="p-2 text-theme-text-muted hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                      title="Voir le QR code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleViewStats(campaign)}
                      className="p-2 text-theme-text-muted hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Voir les statistiques"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <a
                      href={campaign.redirect_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-theme-text-muted hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Tester le lien"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(campaign)}
                      className="p-2 text-theme-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Création */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-theme-card border border-theme-card-border rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-theme-text-primary">
                Nouvelle Campagne
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-theme-bg-secondary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                  Nom de la campagne *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Flyer Paris Janvier 2026"
                  className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                  URL de destination *
                </label>
                <input
                  type="url"
                  value={formData.target_url}
                  onChange={(e) =>
                    setFormData({ ...formData, target_url: e.target.value })
                  }
                  placeholder="https://portfolia.fr"
                  className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                  Slug personnalisé (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="flyer-paris (généré automatiquement si vide)"
                  className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  pattern="^[a-zA-Z0-9_-]*$"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                  Description (optionnelle)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Notes sur cette campagne..."
                  rows={2}
                  className="w-full px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-theme-border text-theme-text-primary rounded-xl hover:bg-theme-bg-secondary transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {showQRModal && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-theme-card border border-theme-card-border rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-theme-text-primary">
                QR Code
              </h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-1 hover:bg-theme-bg-secondary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-theme-text-secondary mb-4">
                {selectedCampaign.name}
              </p>

              <div
                ref={qrRef}
                className="bg-white p-4 rounded-xl inline-block mx-auto"
              >
                <QRCodeCanvas
                  value={selectedCampaign.redirect_url}
                  size={200}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>

              <p className="text-xs text-theme-text-muted mt-3 font-mono break-all">
                {selectedCampaign.redirect_url}
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => copyLink(selectedCampaign.redirect_url)}
                  className="flex-1 px-4 py-2 border border-theme-border text-theme-text-primary rounded-xl hover:bg-theme-bg-secondary transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copier
                </button>
                <button
                  onClick={downloadQR}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Stats */}
      {showStatsModal && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-theme-card border border-theme-card-border rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-theme-text-primary">
                Statistiques : {selectedCampaign.name}
              </h2>
              <button
                onClick={() => setShowStatsModal(false)}
                className="p-1 hover:bg-theme-bg-secondary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : campaignStats ? (
              <div className="space-y-6">
                {/* Trafic */}
                <div>
                  <h3 className="font-medium text-theme-text-primary mb-3">
                    📊 Trafic
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-theme-bg-secondary rounded-xl p-4">
                      <p className="text-sm text-theme-text-secondary">
                        Total clics
                      </p>
                      <p className="text-2xl font-bold text-theme-text-primary">
                        {campaignStats.total_clicks ||
                          campaignStats.total_scans}
                      </p>
                    </div>
                    <div className="bg-theme-bg-secondary rounded-xl p-4">
                      <p className="text-sm text-theme-text-secondary">
                        Visiteurs uniques
                      </p>
                      <p className="text-2xl font-bold text-theme-text-primary">
                        {campaignStats.unique_visitors}
                      </p>
                      <p className="text-xs text-theme-text-muted mt-1">
                        Basé sur IP (RGPD)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Conversions détaillées */}
                <div>
                  <h3 className="font-medium text-theme-text-primary mb-3">
                    🎯 Conversions
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                      <p className="text-xs text-green-400">
                        Nouvelles inscriptions
                      </p>
                      <p className="text-2xl font-bold text-green-500">
                        {campaignStats.conversions?.new_registrations ??
                          campaignStats.total_conversions}
                      </p>
                      <p className="text-xs text-green-400/70 mt-1">
                        Via ce lien
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                      <p className="text-xs text-blue-400">Users existants</p>
                      <p className="text-2xl font-bold text-blue-500">
                        {campaignStats.conversions?.existing_users_clicked ?? 0}
                      </p>
                      <p className="text-xs text-blue-400/70 mt-1">
                        Déjà inscrits
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl p-4">
                      <p className="text-xs text-orange-400">Non convertis</p>
                      <p className="text-2xl font-bold text-orange-500">
                        {campaignStats.conversions?.not_converted ??
                          campaignStats.unique_visitors -
                            campaignStats.total_conversions}
                      </p>
                      <p className="text-xs text-orange-400/70 mt-1">
                        Sans inscription
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl p-4">
                      <p className="text-xs text-purple-400">Taux conversion</p>
                      <p className="text-2xl font-bold text-purple-500">
                        {(
                          campaignStats.conversions?.conversion_rate ??
                          campaignStats.conversion_rate
                        ).toFixed(1)}
                        %
                      </p>
                      <p className="text-xs text-purple-400/70 mt-1">
                        Inscriptions / Visiteurs
                      </p>
                    </div>
                  </div>
                </div>

                {/* Répartition par device */}
                <div>
                  <h3 className="font-medium text-theme-text-primary mb-3">
                    Par appareil
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-theme-bg-secondary rounded-xl p-3 text-center">
                      <Smartphone className="w-6 h-6 mx-auto text-blue-500 mb-1" />
                      <p className="text-lg font-bold text-theme-text-primary">
                        {campaignStats.device_breakdown.mobile}
                      </p>
                      <p className="text-xs text-theme-text-secondary">
                        Mobile
                      </p>
                    </div>
                    <div className="bg-theme-bg-secondary rounded-xl p-3 text-center">
                      <Monitor className="w-6 h-6 mx-auto text-green-500 mb-1" />
                      <p className="text-lg font-bold text-theme-text-primary">
                        {campaignStats.device_breakdown.desktop}
                      </p>
                      <p className="text-xs text-theme-text-secondary">
                        Desktop
                      </p>
                    </div>
                    <div className="bg-theme-bg-secondary rounded-xl p-3 text-center">
                      <Tablet className="w-6 h-6 mx-auto text-purple-500 mb-1" />
                      <p className="text-lg font-bold text-theme-text-primary">
                        {campaignStats.device_breakdown.tablet}
                      </p>
                      <p className="text-xs text-theme-text-secondary">
                        Tablette
                      </p>
                    </div>
                  </div>
                </div>

                {/* Graphique scans par jour */}
                <div>
                  <h3 className="font-medium text-theme-text-primary mb-3">
                    Scans (7 derniers jours)
                  </h3>
                  {ResponsiveContainer ? (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={campaignStats.daily_scans}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151"
                          />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(val: string) => {
                              const d = new Date(val);
                              return `${d.getDate()}/${d.getMonth() + 1}`;
                            }}
                          />
                          <YAxis
                            tick={{ fontSize: 12 }}
                            allowDecimals={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "none",
                              borderRadius: "8px",
                            }}
                            labelFormatter={(val) => {
                              const d = new Date(String(val));
                              return d.toLocaleDateString("fr-FR");
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#9333EA"
                            strokeWidth={2}
                            dot={{ fill: "#9333EA" }}
                            name="Scans"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="bg-theme-bg-secondary rounded-xl p-6 text-center">
                      <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-theme-text-secondary text-sm">
                        Installez recharts pour voir les graphiques
                      </p>
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-2 block">
                        npm install recharts
                      </code>
                      <div className="mt-4 text-left">
                        <p className="text-xs text-theme-text-muted">
                          Données :
                        </p>
                        <ul className="text-xs text-theme-text-secondary mt-1 space-y-1">
                          {campaignStats.daily_scans.map((day) => (
                            <li key={day.date}>
                              {new Date(day.date).toLocaleDateString("fr-FR")}:{" "}
                              {day.count} scans
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-theme-text-secondary py-8">
                Aucune donnée disponible
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsAdminView;
