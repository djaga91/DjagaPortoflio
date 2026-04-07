import React from "react";
import { Skill } from "../../../types";
import { SkillIcon } from "../templates/SkillIcon";

interface SkillsSectionProps {
  skills: Skill[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  const hasSkills = skills && skills.length > 0;

  return (
    <section className="py-16 px-4 bg-theme-card">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-theme-text-primary mb-8">
          Compétences
        </h2>
        {!hasSkills ? (
          <p className="text-theme-text-muted italic">
            L&apos;utilisateur n&apos;a pas renseigné de compétences.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {skills!.map((skill) => (
              <div
                key={skill.id}
                className="inline-flex items-center gap-2 px-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-secondary hover:border-orange-500 transition-colors"
              >
                <SkillIcon
                  skillName={skill.name}
                  size={18}
                  useBadge={true}
                  showLabel={false}
                />
                <span className="font-medium">{skill.name}</span>
                {skill.level && (
                  <span className="ml-2 text-xs text-theme-text-muted">
                    ({skill.level})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
