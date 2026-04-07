import React, { useRef, useState, useCallback, useMemo } from "react";
import HTMLFlipBook from "react-pageflip";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import type { BookPage, BookConfig } from "../types";

interface FlipBookProps {
  pages: BookPage[];
  config: BookConfig;
  className?: string;
}

const PageComponent = React.forwardRef<
  HTMLDivElement,
  { page: BookPage; config: BookConfig }
>(({ page, config }, ref) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      ref={ref}
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: config.palette.page }}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin opacity-30" />
        </div>
      )}
      <img
        src={page.url}
        alt={page.caption || `Page ${page.page_order + 1}`}
        className="w-full h-full object-contain"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }}
      />
      {page.caption && (
        <div
          className="absolute bottom-0 left-0 right-0 p-3 text-center text-sm"
          style={{
            color: config.palette.text,
            backgroundColor: `${config.palette.page}dd`,
            fontFamily: config.font_body,
          }}
        >
          {page.caption}
        </div>
      )}
    </div>
  );
});
PageComponent.displayName = "PageComponent";

const BlankPage = React.forwardRef<HTMLDivElement, { config: BookConfig }>(
  ({ config }, ref) => (
    <div
      ref={ref}
      className="w-full h-full"
      style={{ backgroundColor: config.palette.page }}
    />
  ),
);
BlankPage.displayName = "BlankPage";

export const FlipBook: React.FC<FlipBookProps> = ({
  pages,
  config,
  className = "",
}) => {
  const flipBookRef = useRef<{
    pageFlip: () => {
      flipNext: () => void;
      flipPrev: () => void;
      getCurrentPageIndex: () => number;
    };
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = pages.length;

  /*
   * showCover={true} makes page 0 a single right page (cover) and
   * the last page a single left page (back cover).
   * Total page count MUST be even for this to work correctly.
   * If odd, we append one blank page so the last real image stays as back cover.
   */
  const needsPadding = totalPages % 2 !== 0;

  const bookChildren = useMemo(() => {
    const children: React.ReactElement[] = pages.map((page) => (
      <PageComponent key={page.id} page={page} config={config} />
    ));
    if (needsPadding) {
      children.splice(
        children.length - 1,
        0,
        <BlankPage key="__pad" config={config} />,
      );
    }
    return children;
  }, [pages, config, needsPadding]);

  const goNext = useCallback(() => {
    flipBookRef.current?.pageFlip()?.flipNext();
  }, []);

  const goPrev = useCallback(() => {
    flipBookRef.current?.pageFlip()?.flipPrev();
  }, []);

  const onFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen((prev) => !prev);
  }, [isFullscreen]);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") {
        setLightboxIdx(null);
        if (isFullscreen) {
          document.exitFullscreen?.();
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, isFullscreen]);

  if (pages.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed"
        style={{
          borderColor: config.palette.accent,
          color: config.palette.text,
        }}
      >
        <p className="text-lg opacity-50">Aucune page dans ce book</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center ${className}`}
      style={{ backgroundColor: config.palette.background }}
    >
      <div className="w-full flex justify-center">
        {/* @ts-ignore - react-pageflip types are incomplete */}
        <HTMLFlipBook
          ref={flipBookRef}
          width={400}
          height={560}
          size="stretch"
          minWidth={280}
          maxWidth={600}
          minHeight={400}
          maxHeight={840}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={onFlip}
          className="shadow-2xl"
          style={{}}
          startPage={0}
          drawShadow={true}
          flippingTime={600}
          usePortrait={true}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          showPageCorners={true}
          disableFlipByClick={false}
          useMouseEvents={true}
          swipeDistance={30}
          clickEventForward={true}
          renderOnlyPageLengthChange={false}
        >
          {bookChildren}
        </HTMLFlipBook>
      </div>

      {/* Navigation */}
      <div
        className="flex items-center gap-4 mt-4 select-none"
        style={{ color: config.palette.text }}
      >
        <button
          onClick={goPrev}
          disabled={currentPage === 0}
          className="p-2 rounded-full transition-colors hover:bg-black/10 disabled:opacity-30"
          aria-label="Page précédente"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span
          className="text-sm font-medium"
          style={{ fontFamily: config.font_body }}
        >
          {currentPage + 1} / {totalPages}
        </span>

        <button
          onClick={goNext}
          disabled={currentPage >= totalPages - 1}
          className="p-2 rounded-full transition-colors hover:bg-black/10 disabled:opacity-30"
          aria-label="Page suivante"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-full transition-colors hover:bg-black/10"
          aria-label="Plein écran"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={() => setLightboxIdx(currentPage)}
          className="text-xs underline opacity-60 hover:opacity-100 transition-opacity"
          style={{ fontFamily: config.font_body }}
        >
          Agrandir
        </button>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setLightboxIdx(null)}
            aria-label="Fermer"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx((prev) => Math.max(0, (prev ?? 0) - 1));
            }}
            aria-label="Page précédente"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <img
            src={pages[lightboxIdx]?.url}
            alt={pages[lightboxIdx]?.caption || ""}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx((prev) =>
                Math.min(totalPages - 1, (prev ?? 0) + 1),
              );
            }}
            aria-label="Page suivante"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
          {pages[lightboxIdx]?.caption && (
            <p className="absolute bottom-6 text-white/80 text-center max-w-lg">
              {pages[lightboxIdx].caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FlipBook;
