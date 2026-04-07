#!/usr/bin/env node
/**
 * Script d'application du système typographique PortfoliA
 *
 * Ce script remplace les patterns typographiques ad-hoc par les classes utilitaires
 * définies dans DESIGN_TOKENS.md
 *
 * Usage: node scripts/apply-typography-system.js [--dry-run]
 *
 * Options:
 *   --dry-run  : Affiche les changements sans les appliquer
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const SRC_DIR = path.join(__dirname, '..', 'src');

// Dossiers à exclure (templates portfolio gardent leur typo spécifique)
const EXCLUDED_DIRS = [
  'src/components/portfolio/templates',
];

// Extensions de fichiers à traiter
const FILE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

// Remplacements à effectuer (ordre important : du plus spécifique au moins spécifique)
const REPLACEMENTS = [
  // === DISPLAY (Hero, Landing) ===
  { from: /text-4xl lg:text-5xl font-bold/g, to: 'text-display' },
  { from: /text-4xl md:text-5xl font-bold/g, to: 'text-display' },
  { from: /text-3xl md:text-4xl font-bold/g, to: 'text-display' },
  { from: /text-4xl font-bold/g, to: 'text-display' },

  // === H1 (Titre de page) ===
  { from: /text-2xl md:text-3xl font-bold/g, to: 'text-h1' },
  { from: /text-xl sm:text-2xl font-bold/g, to: 'text-h1' },
  { from: /text-3xl font-bold/g, to: 'text-h1' },
  { from: /text-2xl font-bold/g, to: 'text-h1' },

  // === H2 (Titre de section) ===
  { from: /text-xl md:text-2xl font-semibold/g, to: 'text-h2' },
  { from: /text-xl font-semibold/g, to: 'text-h2' },
  { from: /text-xl font-bold/g, to: 'text-h2' },

  // === H3 (Titre de card) ===
  { from: /text-lg font-semibold/g, to: 'text-h3' },
  { from: /text-lg font-bold/g, to: 'text-h3' },

  // === H4 (Sous-titre) ===
  { from: /text-base font-semibold/g, to: 'text-h4' },
];

// Statistiques
let stats = {
  filesScanned: 0,
  filesModified: 0,
  replacements: 0,
  details: []
};

/**
 * Vérifie si un chemin doit être exclu
 */
function isExcluded(filePath) {
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  return EXCLUDED_DIRS.some(excluded => relativePath.includes(excluded));
}

/**
 * Récupère tous les fichiers à traiter récursivement
 */
function getFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!item.startsWith('.') && item !== 'node_modules') {
        files = files.concat(getFiles(fullPath));
      }
    } else if (FILE_EXTENSIONS.includes(path.extname(item))) {
      if (!isExcluded(fullPath)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Applique les remplacements sur un fichier
 */
function processFile(filePath) {
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileReplacements = [];

  for (const { from, to } of REPLACEMENTS) {
    const matches = content.match(from);
    if (matches) {
      fileReplacements.push({
        pattern: from.toString(),
        replacement: to,
        count: matches.length
      });
      content = content.replace(from, to);
    }
  }

  if (content !== originalContent) {
    stats.filesModified++;
    stats.replacements += fileReplacements.reduce((sum, r) => sum + r.count, 0);
    stats.details.push({
      file: relativePath,
      replacements: fileReplacements
    });

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }

  stats.filesScanned++;
}

/**
 * Affiche le rapport
 */
function printReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📝 RAPPORT - Système Typographique PortfoliA');
  console.log('='.repeat(60) + '\n');

  if (DRY_RUN) {
    console.log('⚠️  MODE DRY-RUN : Aucune modification n\'a été appliquée\n');
  }

  console.log(`📁 Fichiers scannés : ${stats.filesScanned}`);
  console.log(`✏️  Fichiers modifiés : ${stats.filesModified}`);
  console.log(`🔄 Remplacements : ${stats.replacements}\n`);

  if (stats.details.length > 0) {
    console.log('📋 Détails par fichier :\n');

    for (const detail of stats.details) {
      console.log(`  📄 ${detail.file}`);
      for (const r of detail.replacements) {
        console.log(`     • ${r.pattern.slice(0, 40)}... → ${r.replacement} (${r.count}x)`);
      }
      console.log('');
    }
  }

  console.log('='.repeat(60));

  if (DRY_RUN) {
    console.log('\n💡 Pour appliquer les changements, relancez sans --dry-run :');
    console.log('   node scripts/apply-typography-system.js\n');
  } else {
    console.log('\n✅ Changements appliqués avec succès !');
    console.log('💡 Vérifiez les modifications avec : git diff\n');
  }
}

// === MAIN ===
console.log('\n🎨 Application du système typographique PortfoliA...\n');

if (DRY_RUN) {
  console.log('🔍 Mode dry-run activé (aucune modification)\n');
}

const files = getFiles(SRC_DIR);
console.log(`📂 ${files.length} fichiers trouvés dans src/\n`);

for (const file of files) {
  processFile(file);
}

printReport();
