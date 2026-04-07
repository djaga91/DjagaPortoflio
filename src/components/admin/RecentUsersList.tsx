/**
 * RecentUsersList - Liste scrollable des derniers utilisateurs inscrits
 */

import React, { useEffect, useState } from "react";
import { Users, Mail, Calendar, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { api } from "../../services/api";

interface RecentUser {
  id: number;
  email: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  is_verified: boolean;
  created_at: string | null;
  tier: string;
}

export const RecentUsersList: React.FC = () => {
  const [users, setUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/admin/users/recent?limit=20");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch recent users:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (user: RecentUser): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  const getDisplayName = (user: RecentUser): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.username) {
      return user.username;
    }
    return user.email.split("@")[0];
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case "pro":
        return "from-indigo-500 to-purple-500";
      case "enterprise":
        return "from-amber-500 to-orange-500";
      default:
        return "from-slate-500 to-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
        <p className="text-theme-text-secondary text-center py-8">
          Chargement...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-theme-card rounded-2xl p-6 border border-theme-card-border">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Users size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-theme-text-primary">
            Derniers utilisateurs
          </h3>
          <p className="text-sm text-theme-text-secondary">
            {users.length} inscriptions récentes
          </p>
        </div>
      </div>

      {/* Liste scrollable */}
      <div className="max-h-96 overflow-y-auto space-y-2 custom-scrollbar">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 bg-theme-bg-secondary rounded-xl hover:bg-theme-bg-tertiary transition-colors"
            >
              {/* Avatar avec initiales */}
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${getTierColor(
                  user.tier,
                )} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
              >
                {getInitials(user)}
              </div>

              {/* Info user */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-theme-text-primary truncate">
                    {getDisplayName(user)}
                  </p>
                  {user.is_verified ? (
                    <CheckCircle
                      size={14}
                      className="text-emerald-500 flex-shrink-0"
                    />
                  ) : (
                    <XCircle
                      size={14}
                      className="text-slate-400 flex-shrink-0"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-theme-text-secondary">
                  <Mail size={12} />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              {/* Date relative */}
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center gap-1 text-xs text-theme-text-tertiary">
                  <Calendar size={12} />
                  <span>
                    {user.created_at
                      ? formatDistanceToNow(new Date(user.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })
                      : "N/A"}
                  </span>
                </div>
                {user.tier !== "free" && (
                  <span className="text-xs font-bold text-[#f0661b] uppercase">
                    {user.tier}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-theme-text-secondary text-center py-8">
            Aucun utilisateur récent
          </p>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(148, 163, 184, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f0661b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e07230;
        }
      `}</style>
    </div>
  );
};
