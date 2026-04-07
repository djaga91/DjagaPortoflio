import React from "react";
import { Education } from "../../../types";
import { GraduationCap, Calendar } from "lucide-react";
import { Logo } from "../../Logo";

interface EducationSectionProps {
  educations: Education[];
  showLogos?: boolean;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  educations,
  showLogos = true,
}) => {
  const hasEducations = educations && educations.length > 0;

  const formatDate = (date: string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "short" });
  };

  return (
    <section className="py-16 px-4 bg-theme-card">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-theme-text-primary mb-8">
          Formation
        </h2>
        {!hasEducations ? (
          <p className="text-theme-text-muted italic">
            L&apos;utilisateur n&apos;a pas renseigné de formation.
          </p>
        ) : (
          <div className="space-y-6">
            {educations!.map((edu) => (
              <div
                key={edu.id}
                className="bg-theme-bg-secondary border border-theme-border rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  {showLogos ? (
                    <Logo
                      name={edu.school}
                      type="school"
                      size={56}
                      showFallback={false}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="text-orange-600" size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-theme-text-primary">
                      {edu.degree}
                    </h3>
                    <p className="text-lg text-theme-text-secondary">
                      {edu.school}
                    </p>
                    {edu.field_of_study && (
                      <p className="text-sm text-theme-text-muted mt-1">
                        {edu.field_of_study}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-sm text-theme-text-muted mt-2">
                      <Calendar size={14} />
                      {formatDate(edu.start_date)} -{" "}
                      {edu.is_current
                        ? "Aujourd'hui"
                        : formatDate(edu.end_date)}
                    </div>
                    {edu.grade && (
                      <p className="text-sm text-theme-text-muted mt-2">
                        Mention : {edu.grade}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
