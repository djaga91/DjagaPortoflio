import React from "react";
import { Experience } from "../../../types";
import { Calendar, MapPin } from "lucide-react";
import { Logo } from "../../Logo";

interface ExperiencesSectionProps {
  experiences: Experience[];
  showLogos?: boolean;
}

export const ExperiencesSection: React.FC<ExperiencesSectionProps> = ({
  experiences,
  showLogos = true,
}) => {
  const hasExperiences = experiences && experiences.length > 0;

  const formatDate = (date: string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "short" });
  };

  return (
    <section className="py-16 px-4 bg-theme-bg-secondary">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-theme-text-primary mb-8">
          Expériences
        </h2>
        {!hasExperiences ? (
          <p className="text-theme-text-muted italic">
            L&apos;utilisateur n&apos;a pas renseigné d&apos;expériences.
          </p>
        ) : (
          <div className="space-y-8">
            {experiences!.map((exp) => (
              <div
                key={exp.id}
                className="bg-theme-card border border-theme-border rounded-xl p-6"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-4 flex-1">
                    {showLogos && (
                      <Logo
                        name={exp.company}
                        type="company"
                        size={56}
                        className="mt-1"
                        showFallback={false}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-theme-text-primary">
                        {exp.title}
                      </h3>
                      <p className="text-lg text-orange-600">{exp.company}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-theme-text-muted mb-4">
                  {exp.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      {exp.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(exp.start_date)} -{" "}
                    {exp.is_current ? "Aujourd'hui" : formatDate(exp.end_date)}
                  </div>
                </div>
                {exp.description && (
                  <p className="text-theme-text-secondary whitespace-pre-wrap">
                    {exp.description}
                  </p>
                )}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {exp.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-theme-bg-tertiary text-theme-text-muted text-xs rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
