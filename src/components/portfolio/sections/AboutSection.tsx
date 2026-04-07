import React from "react";
import { Profile } from "../../../types";

interface AboutSectionProps {
  profile: Profile | null;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
  const hasBio = !!profile?.bio?.trim();

  return (
    <section className="py-16 px-4 bg-theme-card">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-theme-text-primary mb-6">
          À propos
        </h2>
        {!hasBio ? (
          <p className="text-theme-text-muted italic">
            L&apos;utilisateur n&apos;a pas renseigné d&apos;à propos.
          </p>
        ) : (
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-theme-text-secondary leading-relaxed whitespace-pre-wrap">
              {profile!.bio}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
