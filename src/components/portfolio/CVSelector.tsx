import React, { useState, useEffect, useRef } from "react";
import { FileText, ChevronDown, Check, Loader2, Upload } from "lucide-react";
import { cvAPI, portfolioAPI } from "../../services/api";

interface CV {
  id: string;
  name: string;
  template: string;
  format?: string;
  cv_url: string;
  generated_at?: string;
  created_at?: string;
}

interface CVSelectorProps {
  selectedCvId: string | null | undefined;
  selectedCvUrl: string | null | undefined;
  onSelectCV: (cvId: string | null, cvUrl?: string | null) => void;
}

export const CVSelector: React.FC<CVSelectorProps> = ({
  selectedCvId,
  selectedCvUrl,
  onSelectCV,
}) => {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        setIsLoading(true);
        const response = await cvAPI.list();
        setCvs(response.cvs || []);
      } catch (error) {
        console.error("Erreur lors du chargement des CV:", error);
        setCvs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCVs();
  }, []);

  const selectedCV = cvs.find((cv) => cv.id === selectedCvId);
  const isCustomCv = Boolean(selectedCvUrl && !selectedCvId);

  const handleCustomCvClick = () => {
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleCustomCvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadError("Veuillez sélectionner un fichier PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Le fichier ne doit pas dépasser 10 Mo.");
      return;
    }
    try {
      setUploading(true);
      setUploadError(null);
      const { cv_url } = await portfolioAPI.uploadCustomCv(file);
      onSelectCV(null, cv_url);
      setIsOpen(false);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : null;
      setUploadError(
        typeof message === "string"
          ? message
          : "Erreur lors de l'import. Réessayez.",
      );
    } finally {
      setUploading(false);
    }
  };

  const displayLabel = isCustomCv
    ? "CV perso"
    : selectedCV
      ? selectedCV.name
      : "Aucun CV sélectionné";

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        CV associé
      </label>
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleCustomCvFile}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between gap-2 py-2 px-3 text-sm rounded-lg border transition-all ${
            selectedCV || isCustomCv
              ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
              : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
          }`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText size={16} />
            <span className="truncate">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Chargement...
                </span>
              ) : (
                displayLabel
              )}
            </span>
          </div>
          <ChevronDown
            size={14}
            className={`flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && !isLoading && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            <div className="p-1">
              {/* Option pour désélectionner */}
              <button
                type="button"
                onClick={() => {
                  onSelectCV(null, null);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                  !selectedCvId && !selectedCvUrl
                    ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {!selectedCvId && !selectedCvUrl && <Check size={14} />}
                <span className={!selectedCvId && !selectedCvUrl ? "" : "ml-6"}>
                  Aucun CV
                </span>
              </button>

              {/* Liste des CV générés */}
              {cvs.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 text-center">
                  Aucun CV généré.
                </div>
              ) : (
                cvs.map((cv) => (
                  <button
                    key={cv.id}
                    type="button"
                    onClick={() => {
                      onSelectCV(cv.id, null);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                      selectedCvId === cv.id
                        ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {selectedCvId === cv.id && <Check size={14} />}
                    <div
                      className={`flex-1 text-left ${selectedCvId === cv.id ? "" : "ml-6"}`}
                    >
                      <div className="font-medium truncate">{cv.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {cv.template} •{" "}
                        {new Date(
                          cv.created_at || cv.generated_at || "",
                        ).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </button>
                ))
              )}

              {/* CV perso : importer un PDF */}
              <div className="border-t border-slate-200 dark:border-slate-600 mt-1 pt-1">
                <button
                  type="button"
                  onClick={handleCustomCvClick}
                  disabled={uploading}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    isCustomCv
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {isCustomCv && <Check size={14} />}
                  <Upload size={20} className={isCustomCv ? "" : "ml-0.5"} />
                  <span
                    className={`whitespace-nowrap ${isCustomCv ? "" : "ml-5"}`}
                  >
                    {uploading
                      ? "Import en cours..."
                      : "CV perso (importer un PDF)"}
                  </span>
                  {uploading && (
                    <Loader2 size={14} className="animate-spin ml-1" />
                  )}
                </button>
                {uploadError && (
                  <p className="px-3 py-1 text-xs text-red-500 dark:text-red-400">
                    {uploadError}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {(selectedCV || isCustomCv) && (
        <p className="text-[10px] text-slate-400">
          Le bouton CV sur le portfolio ouvrira ce CV
        </p>
      )}
    </div>
  );
};
