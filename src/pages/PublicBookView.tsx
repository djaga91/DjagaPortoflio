import React, { useState, useEffect } from "react";
import { Mail, Phone, FileText, Loader2, ArrowLeft } from "lucide-react";
import { bookAPI } from "../services/api";
import { FlipBook } from "../components/FlipBook";
import type { BookPage, BookConfig } from "../types";

const DEFAULT_CONFIG: BookConfig = {
  palette: {
    background: "#FAF9F6",
    text: "#1A1A2E",
    accent: "#B8860B",
    page: "#FFFFFF",
  },
  font_title: "Playfair Display",
  font_body: "Inter",
  title: "",
  subtitle: "",
  contact_email: "",
  contact_phone: "",
  show_badges: true,
  show_cv_button: true,
  cv_id: null,
  dark_mode: false,
};

interface PublicBookViewProps {
  username: string;
}

export const PublicBookView: React.FC<PublicBookViewProps> = ({ username }) => {
  const [pages, setPages] = useState<BookPage[]>([]);
  const [config, setConfig] = useState<BookConfig>(DEFAULT_CONFIG);
  const [userInfo, setUserInfo] = useState<{
    username: string;
    first_name: string | null;
    last_name: string | null;
    profile_picture_url: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await bookAPI.getPublicBook(username);
        setUserInfo(data.user);
        setConfig({ ...DEFAULT_CONFIG, ...data.config });
        setPages(
          data.pages.map((p: any) => ({
            id: p.id,
            user_id: "",
            url: p.url,
            thumbnail_url: p.thumbnail_url,
            caption: p.caption,
            page_order: p.page_order,
            created_at: "",
          })),
        );
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setError("Aucun book portfolio trouvé pour cet utilisateur.");
        } else {
          setError("Erreur lors du chargement du book.");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: config.palette.background }}
      >
        <Loader2
          className="w-10 h-10 animate-spin"
          style={{ color: config.palette.accent }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-lg text-gray-600">{error}</p>
        <a
          href="/"
          className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </a>
      </div>
    );
  }

  const displayName =
    [userInfo?.first_name, userInfo?.last_name].filter(Boolean).join(" ") ||
    username;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: config.palette.background,
        color: config.palette.text,
      }}
    >
      {/* Google Fonts */}
      <link
        href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(config.font_title)}:wght@400;700&family=${encodeURIComponent(config.font_body)}:wght@300;400;500&display=swap`}
        rel="stylesheet"
      />

      {/* Header */}
      <header className="py-12 md:py-16 text-center">
        {userInfo?.profile_picture_url && (
          <img
            src={userInfo.profile_picture_url}
            alt={displayName}
            className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2"
            style={{ borderColor: config.palette.accent }}
          />
        )}

        <h1
          className="text-3xl md:text-4xl font-bold mb-2"
          style={{ fontFamily: config.font_title }}
        >
          {config.title || displayName}
        </h1>

        {config.subtitle && (
          <p
            className="text-lg opacity-70"
            style={{ fontFamily: config.font_body }}
          >
            {config.subtitle}
          </p>
        )}

        <div
          className="w-16 h-0.5 mx-auto mt-6"
          style={{ backgroundColor: config.palette.accent }}
        />
      </header>

      {/* Flipbook */}
      <main className="pb-8">
        <FlipBook pages={pages} config={config} className="py-4 md:py-8" />
      </main>

      {/* Contact footer */}
      {(config.contact_email ||
        config.contact_phone ||
        config.show_cv_button) && (
        <footer
          className="py-8 border-t"
          style={{
            borderColor: `${config.palette.text}15`,
            fontFamily: config.font_body,
          }}
        >
          <div className="max-w-md mx-auto text-center space-y-3">
            <h3
              className="text-lg font-semibold mb-4"
              style={{ fontFamily: config.font_title }}
            >
              Contact
            </h3>

            {config.contact_email && (
              <a
                href={`mailto:${config.contact_email}`}
                className="flex items-center justify-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
              >
                <Mail className="w-4 h-4" />
                {config.contact_email}
              </a>
            )}

            {config.contact_phone && (
              <a
                href={`tel:${config.contact_phone}`}
                className="flex items-center justify-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
              >
                <Phone className="w-4 h-4" />
                {config.contact_phone}
              </a>
            )}

            {config.show_cv_button && config.cv_id && (
              <a
                href={`/api/cv/${config.cv_id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-full text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: config.palette.accent,
                  color: config.palette.page,
                }}
              >
                <FileText className="w-4 h-4" />
                Télécharger mon CV
              </a>
            )}
          </div>

          <p
            className="text-center text-xs opacity-30 mt-8"
            style={{ fontFamily: config.font_body }}
          >
            Créé avec PortfoliA
          </p>
        </footer>
      )}
    </div>
  );
};

export default PublicBookView;
