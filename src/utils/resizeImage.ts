/**
 * Redimensionne une image côté client avant upload pour réduire le temps d'envoi
 * et la charge serveur. Aligné sur le backend (MAX_IMAGE_DIMENSION 1024).
 */

const DEFAULT_MAX_DIMENSION = 1024;
const DEFAULT_JPEG_QUALITY = 0.82;

/**
 * Redimensionne un fichier image et le renvoie en JPEG.
 *
 * @param file - Fichier image (image/*)
 * @param maxDimension - Côté max en pixels (défaut 1024)
 * @param quality - Qualité JPEG 0–1 (défaut 0.82)
 * @returns Blob JPEG (ou rejet si le fichier n'est pas une image valide)
 */
export function resizeImageFile(
  file: File,
  maxDimension: number = DEFAULT_MAX_DIMENSION,
  quality: number = DEFAULT_JPEG_QUALITY,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2d non disponible"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Échec toBlob"));
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image non chargeable"));
    };

    img.src = url;
  });
}
