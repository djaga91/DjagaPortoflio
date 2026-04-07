# 🎨 Composants Portfolio - Guide Rapide

## 🚀 Accès au Portfolio

### Pour l'utilisateur :
1. **Cliquer sur "Mon Portfolio"** dans la barre latérale gauche (menu de navigation)
2. Le portfolio s'affiche automatiquement en mode visualisation

## 🎯 Utilisation du Drag & Drop

### Activation du mode édition :
1. Cliquer sur le bouton **"⚙️ Édition"** en haut à droite
2. La barre latérale gauche apparaît avec toutes les sections

### Réorganiser les sections :

**Méthode 1 : Drag & Drop**
- Cliquer et maintenir sur l'icône ☰ (GripVertical) à gauche de chaque section
- Glisser vers le haut/bas
- Relâcher pour valider

**Méthode 2 : Boutons flèches**
- Survoler une section
- Cliquer sur ↑ pour monter, ↓ pour descendre

**Méthode 3 : Masquer/Afficher**
- Cliquer sur l'icône 👁️ à droite
- Section masquée = invisible sur le portfolio public

## 💾 Sauvegarde

- Automatique : Après 2 secondes d'inactivité
- Manuelle : Bouton "💾 Sauvegarder" en haut à droite

## 🔧 Structure des fichiers

```
components/portfolio/
├── PortfolioBuilder.tsx      # Composant parent (orchestre tout)
├── PortfolioEditor.tsx       # Barre latérale gauche (drag & drop)
├── PortfolioPreview.tsx      # Vue de rendu
└── sections/
    ├── HeroSection.tsx
    ├── AboutSection.tsx
    ├── ExperiencesSection.tsx
    ├── EducationSection.tsx
    ├── ProjectsSection.tsx
    ├── SkillsSection.tsx
    ├── LanguagesSection.tsx
    ├── CertificationsSection.tsx
    └── ContactSection.tsx
```

## 📝 Notes techniques

- Utilise `@dnd-kit/core` et `@dnd-kit/sortable` pour le drag & drop
- Configuration stockée dans `profile.portfolio_config` (JSONB)
- API : `/api/portfolio/config` (GET/PUT)


