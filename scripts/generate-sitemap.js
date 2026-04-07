/**
 * Script de génération du sitemap.xml pour PortfoliA
 *
 * Usage: node scripts/generate-sitemap.js
 *
 * Ce script génère un sitemap statique pour aider les moteurs de recherche
 * à indexer les pages publiques de la SPA.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SITE_URL = 'https://portfolia.fr';
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

// Routes publiques à inclure dans le sitemap
// Note: Les routes protégées (dashboard, profile, etc.) ne sont pas incluses
const PUBLIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/login', priority: '0.8', changefreq: 'monthly' },
  { path: '/register', priority: '0.8', changefreq: 'monthly' },
  { path: '/legal', priority: '0.5', changefreq: 'yearly' },
  { path: '/legal?tab=privacy', priority: '0.5', changefreq: 'yearly' },
  { path: '/legal?tab=terms', priority: '0.5', changefreq: 'yearly' },
  { path: '/forgot-password', priority: '0.3', changefreq: 'yearly' },
];

// Date de dernière modification (aujourd'hui)
const lastmod = new Date().toISOString().split('T')[0];

/**
 * Génère le contenu XML du sitemap
 */
function generateSitemapXML() {
  const urlEntries = PUBLIC_ROUTES.map(route => {
    return `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Écrit le sitemap dans le fichier de sortie
 */
function writeSitemap() {
  const xml = generateSitemapXML();

  // S'assurer que le dossier public existe
  const publicDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, xml, 'utf-8');
  console.log(`✅ Sitemap généré avec succès: ${OUTPUT_PATH}`);
  console.log(`📍 ${PUBLIC_ROUTES.length} URLs incluses`);
  console.log(`📅 Dernière modification: ${lastmod}`);
}

// Exécution
writeSitemap();
