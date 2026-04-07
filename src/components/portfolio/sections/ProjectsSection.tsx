import React from "react";
import { Project } from "../../../types";
import { ExternalLink, Github } from "lucide-react";
import { getAbsoluteImageUrl } from "../../../utils/imageUrl";

interface ProjectsSectionProps {
  projects: Project[];
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
}) => {
  const hasProjects = projects && projects.length > 0;

  return (
    <section className="py-16 px-4 bg-theme-bg-secondary">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-theme-text-primary mb-8">
          Projets
        </h2>
        {!hasProjects ? (
          <p className="text-theme-text-muted italic">
            L&apos;utilisateur n&apos;a pas renseigné de projets.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-theme-card border border-theme-border rounded-xl p-6 hover:shadow-lg transition-shadow w-full"
              >
                {project.url_image && (
                  <img
                    src={getAbsoluteImageUrl(project.url_image) || undefined}
                    alt={project.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
                  {project.name}
                </h3>
                {project.description && (
                  <div className="text-theme-text-secondary mb-4 space-y-1">
                    {project.description.split(/\r?\n/).map((line, i) => (
                      <p key={i} className="break-words">
                        {line || "\u00A0"}
                      </p>
                    ))}
                  </div>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.slice(0, 5).map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-theme-bg-tertiary text-theme-text-muted text-xs rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  {project.url_demo && (
                    <a
                      href={project.url_demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                    >
                      <ExternalLink size={16} />
                      Démo
                    </a>
                  )}
                  {project.url_github && (
                    <a
                      href={project.url_github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-theme-text-muted hover:text-theme-text-secondary"
                    >
                      <Github size={16} />
                      Code
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
