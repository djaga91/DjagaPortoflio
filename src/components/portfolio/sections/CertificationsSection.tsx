import React from "react";
import { Certification } from "../../../types";
import { Award, ExternalLink } from "lucide-react";

interface CertificationsSectionProps {
  certifications: Certification[];
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  certifications,
}) => {
  const hasCertifications = certifications && certifications.length > 0;

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long" });
  };

  return (
    <section className="py-16 px-4 bg-theme-bg-secondary">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-theme-text-primary mb-8">
          Certifications
        </h2>
        {!hasCertifications ? (
          <p className="text-theme-text-muted italic">
            L&apos;utilisateur n&apos;a pas renseigné de certifications.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications!.map((cert) => (
              <div
                key={cert.id}
                className="bg-theme-card border border-theme-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="text-orange-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-theme-text-primary">
                      {cert.name}
                    </h3>
                    <p className="text-sm text-theme-text-secondary">
                      {cert.issuer}
                    </p>
                    <p className="text-xs text-theme-text-muted mt-1">
                      {formatDate(cert.date_obtained)}
                    </p>
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 mt-2"
                      >
                        Voir le certificat
                        <ExternalLink size={14} />
                      </a>
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
