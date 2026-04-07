import React from "react";
import { Language } from "../../../types";

interface LanguagesSectionProps {
  languages: Language[];
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  languages,
}) => {
  const hasLanguages = languages && languages.length > 0;

  return (
    <section className="py-16 px-4 bg-theme-card">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-theme-text-primary mb-8">
          Langues
        </h2>
        {!hasLanguages ? (
          <p className="text-theme-text-muted italic">
            L&apos;utilisateur n&apos;a pas renseigné de langues.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {languages!.map((lang) => (
              <div
                key={lang.id}
                className="bg-theme-bg-secondary border border-theme-border rounded-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-theme-text-primary">
                    {lang.name}
                  </span>
                  <span className="text-sm text-theme-text-muted">
                    {lang.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
