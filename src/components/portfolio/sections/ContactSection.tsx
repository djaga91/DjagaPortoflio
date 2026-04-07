import React from "react";
import { Profile, User } from "../../../types";
import {
  Linkedin,
  Github,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

interface ContactSectionProps {
  profile: Profile | null;
  user?: User | null;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  profile,
  user,
}) => {
  const hasEmail = !!user?.email;
  const hasPhone = !!profile?.phone?.trim();
  const hasLocation = !!profile?.location?.trim();
  const hasLinkedIn = !!profile?.linkedin_url?.trim();
  const hasGithub = !!profile?.github_url?.trim();
  const hasPortfolio = !!profile?.portfolio_url?.trim();
  const hasContact =
    hasEmail ||
    hasPhone ||
    hasLocation ||
    hasLinkedIn ||
    hasGithub ||
    hasPortfolio;

  return (
    <section className="py-16 px-4 bg-theme-bg-secondary">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-theme-text-primary mb-8">
          Contact
        </h2>
        {!hasContact ? (
          <p className="text-theme-text-muted italic">
            L&apos;utilisateur n&apos;a pas renseigné de contact.
          </p>
        ) : (
          <div className="space-y-6">
            {hasEmail && (
              <div className="flex items-center gap-3 flex-wrap">
                <Mail className="w-5 h-5 text-theme-text-muted flex-shrink-0" />
                <a
                  href={`mailto:${user!.email}`}
                  className="text-theme-text-primary hover:text-orange-500 transition-colors break-all"
                >
                  {user!.email}
                </a>
              </div>
            )}
            {hasPhone && (
              <div className="flex items-center gap-3 flex-wrap">
                <Phone className="w-5 h-5 text-theme-text-muted flex-shrink-0" />
                <a
                  href={`tel:${profile!.phone!.replace(/\s/g, "")}`}
                  className="text-theme-text-primary hover:text-orange-500 transition-colors"
                >
                  {profile!.phone}
                </a>
              </div>
            )}
            {hasLocation && (
              <div className="flex items-center gap-3 flex-wrap">
                <MapPin className="w-5 h-5 text-theme-text-muted flex-shrink-0" />
                <span className="text-theme-text-primary">
                  {profile!.location}
                </span>
              </div>
            )}
            <div className="flex gap-4 flex-wrap pt-2">
              {hasLinkedIn && (
                <a
                  href={profile!.linkedin_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-[#0077b5] text-white rounded-lg hover:bg-[#006399] transition-colors"
                >
                  <Linkedin size={20} />
                  LinkedIn
                </a>
              )}
              {hasGithub && (
                <a
                  href={profile!.github_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-theme-bg-tertiary border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-card transition-colors"
                >
                  <Github size={20} />
                  GitHub
                </a>
              )}
              {hasPortfolio && (
                <a
                  href={profile!.portfolio_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-theme-card border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-bg-tertiary transition-colors"
                >
                  <ExternalLink size={20} />
                  Portfolio
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
