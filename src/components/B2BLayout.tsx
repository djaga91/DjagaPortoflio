/**
 * B2BLayout - Layout wrapper pour les pages B2B
 *
 * Inclut la navigation B2B à gauche et le contenu principal à droite.
 */

import React, { useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";
import { B2BNavigation } from "./B2BNavigation";
import { api } from "../services/api";

interface Organization {
  id: string;
  name: string;
  slug: string;
  type: "school" | "company";
  logo_url?: string;
}

interface B2BLayoutProps {
  children: React.ReactNode;
}

export const B2BLayout: React.FC<B2BLayoutProps> = ({ children }) => {
  const { view, setView } = useGameStore();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const orgId = localStorage.getItem("current_org_id");
  const orgType =
    (localStorage.getItem("current_org_type") as "school" | "company") ||
    "school";

  useEffect(() => {
    const fetchOrg = async () => {
      if (!orgId) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/api/organizations/${orgId}`);
        setOrg(res.data);
      } catch (err) {
        console.error("Erreur chargement organisation:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrg();
  }, [orgId]);

  // Si pas d'organisation, afficher un message
  if (!loading && !orgId) {
    return (
      <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Accès non autorisé
          </h2>
          <p className="text-gray-400 mb-6">
            Vous n'avez pas d'organisation associée à votre compte.
          </p>
          <button
            onClick={() => setView("dashboard")}
            className="px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg-primary flex">
      {/* Navigation latérale B2B */}
      <B2BNavigation
        orgType={orgType}
        orgName={org?.name}
        orgLogo={org?.logo_url}
        currentView={view}
      />

      {/* Contenu principal */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
};

export default B2BLayout;
