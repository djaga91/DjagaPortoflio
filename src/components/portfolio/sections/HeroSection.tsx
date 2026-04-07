import React from "react";
import { User } from "../../../types";
import { Profile } from "../../../types";
import { getAbsoluteImageUrl } from "../../../utils/imageUrl";

interface HeroSectionProps {
  user: User | null;
  profile: Profile | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ user, profile }) => {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-gradient-to-br from-theme-bg-primary via-theme-bg-secondary to-theme-bg-primary">
      <div className="max-w-4xl mx-auto">
        {/* Photo de profil */}
        {profile?.profile_picture_url && (
          <div className="mb-6">
            <img
              src={
                getAbsoluteImageUrl(profile.profile_picture_url) || undefined
              }
              alt={user?.full_name || "Profil"}
              className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-theme-border shadow-lg"
            />
          </div>
        )}

        {/* Nom */}
        <h1 className="text-4xl md:text-5xl font-bold text-theme-text-primary mb-4">
          {user?.full_name || "Votre Nom"}
        </h1>

        {/* Titre/Bio */}
        {profile?.bio && (
          <p className="text-xl md:text-2xl text-theme-text-secondary mb-6 max-w-2xl mx-auto">
            {profile.bio}
          </p>
        )}

        {/* Localisation */}
        {profile?.location && (
          <p className="text-theme-text-muted mb-8">📍 {profile.location}</p>
        )}

        {/* Liens sociaux */}
        <div className="flex gap-4 justify-center items-center">
          {profile?.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              LinkedIn
            </a>
          )}
          {profile?.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
