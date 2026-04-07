import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";

// ============================================================
// GLITCHTIP INITIALIZATION (compatible Sentry SDK)
// GlitchTip = alternative open-source à Sentry
// ============================================================
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN; // Variable nommée SENTRY pour compatibilité SDK
const IS_PRODUCTION = import.meta.env.MODE === "production";

// GlitchTip désactivé en local (évite les erreurs SSL avec proxy d'entreprise)
// Activé uniquement en production avec DSN configuré
if (SENTRY_DSN && IS_PRODUCTION) {
  // Import dynamique avec gestion d'erreur silencieuse
  const initSentry = async () => {
    try {
      if (typeof window !== "undefined" && IS_PRODUCTION) {
        const loadSentry = () => {
          const moduleName = "@" + "sentry" + "/" + "react";
          // @ts-ignore - Import conditionnel, peut ne pas exister en dev
          return import(/* @vite-ignore */ moduleName);
        };
        const sentryModule = await loadSentry();
        if (sentryModule?.default) {
          const Sentry = sentryModule.default;
          Sentry.init({
            dsn: SENTRY_DSN,
            integrations: [Sentry.browserTracingIntegration()],
            tracesSampleRate: 1.0,
            environment: import.meta.env.MODE,
            release: `portfolia-frontend@${import.meta.env.VITE_APP_VERSION || "0.1.0"}`,
          });
        }
      }
    } catch (error) {
      // GlitchTip/Sentry non disponible, on continue sans (erreur silencieuse)
      if (IS_PRODUCTION) {
        console.warn("GlitchTip non disponible, continuons sans:", error);
      }
    }
  };
  initSentry();
}

// Fonction de test GlitchTip - Accessible depuis la console: window.__testSentry()
declare global {
  interface Window {
    __testSentry: () => void;
  }
}

window.__testSentry = async () => {
  if (!IS_PRODUCTION) {
    console.warn("⚠️ GlitchTip désactivé en mode développement.");
    console.log(
      "💡 Testez en production ou avec npm run build && npm run preview",
    );
    return;
  }
  if (!SENTRY_DSN) {
    console.error("❌ VITE_SENTRY_DSN non configuré !");
    console.log(
      "💡 Ajoutez VITE_SENTRY_DSN dans vos variables d'environnement Vercel.",
    );
    return;
  }
  try {
    const loadSentry = () => {
      const moduleName = "@" + "sentry" + "/" + "react";
      // @ts-ignore - Import conditionnel, peut ne pas exister en dev
      return import(/* @vite-ignore */ moduleName);
    };
    const Sentry = await loadSentry();
    console.log("🔥 Déclenchement erreur test GlitchTip...");
    const testError = new Error(
      "Test GlitchTip Frontend - Erreur volontaire pour vérifier le monitoring",
    );
    Sentry.captureException(testError);
    console.log("✅ Erreur envoyée à GlitchTip ! Vérifiez votre dashboard.");
  } catch (e) {
    console.error("❌ GlitchTip non disponible:", e);
  }
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
