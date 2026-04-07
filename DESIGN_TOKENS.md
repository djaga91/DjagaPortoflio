# Design Tokens - PortfoliA

Guide de référence pour maintenir la cohérence visuelle du frontend.
Basé sur les guidelines [NoVibeCode.md](../docs/guide/NoVibeCode.md).

## Fichier de référence

Les tokens sont définis dans :
```
frontend-game/src/styles/design-tokens.ts
frontend-game/src/styles/index.css (variables CSS + classes utilitaires)
```

---

## 🔤 Typographie

### Stack de polices

| Police | Variable Tailwind | Usage | Chargée depuis |
|--------|-------------------|-------|----------------|
| **Inter** | `font-sans` | UI principale (application) | Google Fonts |
| **Playfair Display** | `font-serif` | Portfolios utilisateur (option) | Google Fonts |
| **Space Mono** | `font-mono` | Code, identifiants, URLs | Google Fonts |

### Poids chargés

| Police | Poids | Nom |
|--------|-------|-----|
| Inter | 400, 500, 600, 700 | normal, medium, semibold, bold |
| Playfair Display | 400, 500, 600, 700 | (option portfolio serif) |
| Space Mono | 400, 700 | normal, bold |

> ⚠️ **Optimisation** : On ne charge plus les poids 300, 800, 900 qui étaient inutilisés.

---

### Hiérarchie typographique

#### Titres et textes

| Niveau | Classe utilitaire | Tailwind équivalent | Usage |
|--------|-------------------|---------------------|-------|
| **Display** | `.text-display` | `text-4xl md:text-5xl font-bold tracking-tight` | Hero sections, landing |
| **H1** | `.text-h1` | `text-2xl md:text-3xl font-bold tracking-tight` | Titre de page |
| **H2** | `.text-h2` | `text-xl md:text-2xl font-semibold` | Titre de section |
| **H3** | `.text-h3` | `text-lg font-semibold` | Titre de card |
| **H4** | `.text-h4` | `text-base font-semibold` | Sous-titre, label important |
| **Body** | `.text-body` | `text-base font-normal` | Paragraphe principal |
| **Body small** | `.text-body-sm` | `text-sm text-theme-text-secondary` | Texte secondaire |
| **Caption** | `.text-caption` | `text-xs font-medium tracking-wide uppercase` | Labels, badges, tags |

#### Règles d'usage

| Élément | Doit utiliser | Exemple |
|---------|---------------|---------|
| Titre de page (Dashboard, Profil...) | `text-h1` | "Tableau de bord" |
| Titre de section dans page | `text-h2` | "Vos objectifs du jour" |
| Titre de card/modal | `text-h3` | "Ajouter une expérience" |
| Label de champ | `text-body-sm` + `font-medium` | "Nom de l'entreprise" |
| Placeholder | `text-body` | "Entrez le nom..." |
| Hint sous champ | `text-caption` | "Obligatoire" |
| Badge/Tag | `text-caption` | "PRO", "NOUVEAU" |

---

### Poids de police

| Classe | Poids | Usage |
|--------|-------|-------|
| `font-bold` | 700 | Titres Display, H1, H2 |
| `font-semibold` | 600 | H3, H4, boutons, CTA |
| `font-medium` | 500 | Labels de formulaire, nav active |
| `font-normal` | 400 | Corps de texte, paragraphes |

> ❌ **Interdit** : `font-extrabold` (800) et `font-black` (900) - trop agressifs, non chargés.

---

### Letter-spacing (tracking)

| Classe | Usage |
|--------|-------|
| `tracking-tight` | Titres Display et H1 uniquement |
| `tracking-wide` | Captions, labels uppercase |
| *(aucun)* | Tout le reste (valeur par défaut) |

> ⚠️ **Règle** : Ne pas utiliser `tracking-tight` sur du texte courant ou des tailles < 24px.

---

### Line-height (leading)

| Classe | Usage |
|--------|-------|
| `leading-tight` | Titres multi-lignes |
| `leading-relaxed` | Paragraphes longs, bio |
| `leading-normal` | Par défaut |

---

### Polices spéciales

#### `font-mono` (Space Mono)
Réservé exclusivement à :
- ✅ Codes d'invitation / tokens
- ✅ URLs affichées
- ✅ Blocs de code
- ✅ Debug view
- ❌ Jamais pour du texte UI normal

#### `font-serif` (Playfair Display)
Réservé exclusivement à :
- ✅ Templates de portfolio (option utilisateur)
- ❌ Jamais dans l'interface applicative

---

### Exemples d'application

```tsx
// ✅ CORRECT - Titre de page
<h1 className="text-2xl md:text-3xl font-bold tracking-tight text-theme-text-primary">
  Tableau de bord
</h1>

// ✅ CORRECT - Titre de section
<h2 className="text-xl md:text-2xl font-semibold text-theme-text-primary">
  Vos objectifs du jour
</h2>

// ✅ CORRECT - Titre de card
<h3 className="text-lg font-semibold text-theme-text-primary">
  Ajouter une expérience
</h3>

// ✅ CORRECT - Label de champ
<label className="text-sm font-medium text-theme-text-secondary">
  Nom de l'entreprise
</label>

// ✅ CORRECT - Badge/Tag
<span className="text-xs font-medium tracking-wide uppercase text-indigo-600">
  Pro
</span>

// ❌ INCORRECT - Mélange incohérent
<h2 className="text-2xl font-extrabold tracking-tight"> // font-extrabold interdit
<p className="text-base tracking-tight"> // tracking-tight sur body interdit
```

---

## Spacing (Espacement)

Système basé sur 4pt/8pt.

| Token | Tailwind | Pixels | Usage |
|-------|----------|--------|-------|
| `xs` | `p-1`, `gap-1` | 4px | Espacement minimal |
| `sm` | `p-2`, `gap-2` | 8px | Entre éléments liés |
| `md` | `p-3`, `gap-3` | 12px | Espacement compact |
| `lg` | `p-4`, `gap-4` | 16px | Standard (sections) |
| `xl` | `p-6`, `gap-6` | 24px | Large |
| `2xl` | `p-8`, `gap-8` | 32px | Entre groupes majeurs |

---

## Border Radius

**Système standardisé :**

| Usage | Classe | Pixels |
|-------|--------|--------|
| Boutons, inputs | `rounded-lg` | 8px |
| Cards, containers | `rounded-xl` | 12px |
| Modals, sections | `rounded-2xl` | 16px |
| Badges, tags, avatars | `rounded-full` | 50% |

**À ÉVITER :**
- `rounded-3xl` (24px) - trop arrondi
- `rounded-[2rem]` - valeurs custom

---

## Couleurs de marque

### Primary (Orange Fox)
```css
--brand-orange: #FF8C42
--brand-orange-dark: #E07230
--brand-orange-light: #FFB27E
```

### Secondary (Violet - adapté du logo)
```css
--brand-violet: #7c3aed
--brand-violet-dark: #6d28d9
--brand-indigo: #6366F1
--brand-indigo-dark: #4F46E5
```

**Note :** Le violet est une couleur de marque validée (présente dans le logo).

---

## Hover Effects

**Règle :** Utiliser des transitions subtiles, pas d'animations agressives.

| Effet | Classe | Description |
|-------|--------|-------------|
| Scale hover | `hover:scale-[1.02]` | Légère augmentation |
| Scale click | `active:scale-95` | Feedback de clic |
| Transition | `transition-all duration-200` | Animation fluide |

**À ÉVITER :**
- `hover:scale-105` ou plus - trop agressif
- `hover:scale-110` - trop agressif
- `animate-bounce` sur éléments non-essentiels

---

## Animations

### Animations AUTORISÉES
- `transition-all duration-200` - Transitions hover
- `animate-spin` - Indicateurs de chargement (Loader2)
- `animate-pulse` - Indicateurs discrets
- `animate-in fade-in` - Entrée de page

### Animations SUPPRIMÉES (vibe-coded)
- `animate-bounce` sur emojis/badges
- `@keyframes float-*` - flottement
- `@keyframes glow-pulse` - lueur pulsante
- `@keyframes shine` - effet de brillance
- `@keyframes shimmer` - miroitement

---

## Icône Sparkles

**Règle :** Réservée aux fonctionnalités IA uniquement.

### Usages AUTORISÉS
- Bouton "Reformuler avec IA"
- Bouton "Générer CV/Lettre"
- Badge "Propulsé par l'IA"
- "Smart Matching" / "Analyse IA"

### Usages INTERDITS
- Décoration de badges/achievements
- Stats ou métriques
- Titres de sections génériques

**Alternatives pour le remplacement :**
| Contexte | Icône Lucide |
|----------|--------------|
| Badges | `Trophy`, `Award` |
| Catégorie "Tous" | `Grid3X3` |
| Catégorie "Créateur" | `Palette` |
| Stats "créés" | `PlusCircle` |
| Suggestions | `Lightbulb` |
| Récompenses | `Gift` |

---

## Emojis

### Emojis AUTORISÉS
- Feedback émotionnel (célébrations de niveau)
- Salutation contextuelle (👋 dans "Bonjour")
- Options de menu IA (reformulation)

### Emojis INTERDITS (remplacer par icônes)
- Labels de formulaires (📍 → icône MapPin)
- Boutons d'action
- Headers de sections

---

## Classes Thème

Toujours utiliser les classes `theme-*` pour le support dark mode :

| Usage | Classe |
|-------|--------|
| Fond card | `bg-theme-card` |
| Fond page | `bg-theme-bg-primary` |
| Fond input | `bg-theme-bg-secondary` |
| Texte principal | `text-theme-text-primary` |
| Texte secondaire | `text-theme-text-secondary` |
| Bordure | `border-theme-border` |

---

## Checklist avant commit

### Typographie
- [ ] Pas de `font-extrabold` ou `font-black` (non chargés)
- [ ] `tracking-tight` uniquement sur Display et H1
- [ ] `font-mono` uniquement pour code/identifiants
- [ ] Hiérarchie respectée : Display > H1 > H2 > H3 > H4 > Body

### Composants
- [ ] Pas de `hover:scale-105` ou plus
- [ ] Pas de `rounded-3xl` (utiliser `rounded-2xl`)
- [ ] Pas de `animate-bounce` sauf indicateur scroll
- [ ] Pas de `Sparkles` sauf features IA
- [ ] Pas d'emojis dans les labels de formulaires

### Thème
- [ ] Classes `theme-*` utilisées (pas `bg-white` direct)
- [ ] Dark mode testé

---

## Classes utilitaires typographiques

Ces classes sont définies dans `src/styles/index.css` et peuvent être utilisées directement :

```tsx
// Exemples d'utilisation
<h1 className="text-display text-theme-text-primary">Hero Title</h1>
<h1 className="text-h1 text-theme-text-primary">Page Title</h1>
<h2 className="text-h2 text-theme-text-primary">Section Title</h2>
<h3 className="text-h3 text-theme-text-primary">Card Title</h3>
<p className="text-body text-theme-text-primary">Paragraph text</p>
<p className="text-body-sm">Secondary text</p>
<span className="text-caption text-indigo-600">BADGE</span>
<label className="text-label">Field label</label>
<span className="text-hint">Helper text</span>
<code className="text-code">const x = 1</code>
```

| Classe | Usage |
|--------|-------|
| `text-display` | Hero sections, landing |
| `text-h1` | Titre de page |
| `text-h2` | Titre de section |
| `text-h3` | Titre de card/modal |
| `text-h4` | Sous-titre |
| `text-body` | Paragraphe |
| `text-body-sm` | Texte secondaire |
| `text-caption` | Badges, tags (uppercase) |
| `text-label` | Labels de formulaire |
| `text-hint` | Texte d'aide |
| `text-code` | Code inline |

---

## Mise à jour

Dernière mise à jour : Janvier 2026
Audit NoVibeCode effectué et corrections appliquées.
