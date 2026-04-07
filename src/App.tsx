import { useState } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PortfolioPreview } from "./components/portfolio/PortfolioPreview";

import {
  djagaUserFR,
  djagaProfileFR,
  djagaExperiencesFR,
  djagaEducationsFR,
  djagaProjectsFR,
  djagaSkillsFR,
  djagaLanguagesFR,
  djagaCertificationsFR,
  djagaConfigFR
} from "./data/djagaProfile_fr";

import {
  djagaUserEN,
  djagaProfileEN,
  djagaExperiencesEN,
  djagaEducationsEN,
  djagaProjectsEN,
  djagaSkillsEN,
  djagaLanguagesEN,
  djagaCertificationsEN,
  djagaConfigEN
} from "./data/djagaProfile_en";

function App() {
  const [lang, setLang] = useState<"fr" | "en">("fr");

  const isFR = lang === "fr";

  const user = isFR ? djagaUserFR : djagaUserEN;
  const profile = isFR ? djagaProfileFR : djagaProfileEN;
  const experiences = isFR ? djagaExperiencesFR : djagaExperiencesEN;
  const educations = isFR ? djagaEducationsFR : djagaEducationsEN;
  const projects = isFR ? djagaProjectsFR : djagaProjectsEN;
  const skills = isFR ? djagaSkillsFR : djagaSkillsEN;
  const languages = isFR ? djagaLanguagesFR : djagaLanguagesEN;
  const certifications = isFR ? djagaCertificationsFR : djagaCertificationsEN;
  const config = isFR ? djagaConfigFR : djagaConfigEN;

  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen relative font-sans text-theme-text-primary bg-theme-bg-primary transition-colors duration-300">
        
        {/* Language Switcher Floating Button */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-theme-card dark:bg-[#1a1c23] border border-theme-border rounded-full p-1 shadow-lg">
          <button 
            onClick={() => setLang('fr')} 
            className={`px-4 py-1.5 text-sm font-bold rounded-full transition-colors ${lang === 'fr' ? 'bg-orange-500 text-white' : 'text-theme-text-secondary hover:bg-theme-bg-secondary'}`}
          >
            FR 🇫🇷
          </button>
          <button 
            onClick={() => setLang('en')} 
            className={`px-4 py-1.5 text-sm font-bold rounded-full transition-colors ${lang === 'en' ? 'bg-orange-500 text-white' : 'text-theme-text-secondary hover:bg-theme-bg-secondary'}`}
          >
            EN 🇬🇧
          </button>
        </div>

        <div className="w-full">
          <PortfolioPreview
            key={`public-${config.template || "default"}-${lang}`}
            config={config}
            user={user}
            profile={profile}
            experiences={experiences}
            educations={educations}
            projects={projects}
            skills={skills}
            languages={languages}
            certifications={certifications}
            interests={[]}
            isPreview={false}
            lang={lang}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
