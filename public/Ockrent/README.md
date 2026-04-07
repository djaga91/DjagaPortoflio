# 📊 Présentation OCKRent - Transformation Digitale

Présentation HTML interactive pour le projet Data Management & Ethics d'Efrei Paris (2025-2026).

## 🎯 Vue d'ensemble

Cette présentation couvre la transformation digitale complète d'OCKRent, depuis le diagnostic initial jusqu'à la mise en place d'une architecture Data Lake moderne avec gouvernance des données.

## 📂 Structure des fichiers

```
Ockrent/
├── presentation-ockrent.html    # Fichier principal de navigation
├── slide-ockrent-1.html         # Slide 1 : Titre & Introduction
├── slide-ockrent-2.html         # Slide 2 : Le Constat
├── slide-ockrent-3.html         # Slide 3 : Roadmap 18 Mois
├── slide-ockrent-4.html         # Slide 4 : Gouvernance
├── slide-ockrent-5.html         # Slide 5 : Architecture Data Lake
├── slide-ockrent-6.html         # Slide 6 : 4 Référentiels Maîtres
├── slide-ockrent-7.html         # Slide 7 : Cas d'usage Business
├── slide-ockrent-8.html         # Slide 8 : Maintenance Prédictive
├── slide-ockrent-9.html         # Slide 9 : Qualité & Sécurité
├── slide-ockrent-10.html        # Slide 10 : Conclusion
├── planDiapo.md                 # Plan de la présentation
├── rapport.md                   # Rapport complet (1314 lignes)
└── README.md                    # Ce fichier
```

## 🚀 Utilisation

### Lancer la présentation

1. **Option 1 : Ouvrir directement dans le navigateur**
   ```bash
   # Depuis le dossier frontend-game/public/Ockrent/
   open presentation-ockrent.html
   ```

2. **Option 2 : Via le serveur de développement**
   ```bash
   # Depuis frontend-game/
   npm run dev
   # Puis naviguer vers : http://localhost:3000/Ockrent/presentation-ockrent.html
   ```

### Contrôles de navigation

#### Souris
- **Boutons "Précédent" / "Suivant"** : Navigation séquentielle
- **Points de progression** : Cliquer pour accéder directement à une slide
- **Numéro de slide** (en haut à droite) : Affiche la position actuelle

#### Clavier
- **Flèche droite (→)** ou **Espace** : Slide suivante
- **Flèche gauche (←)** : Slide précédente
- **Touches 1-9** : Accès direct aux slides 1 à 9
- **Touche 0** : Accès direct à la slide 10

## 📋 Contenu des slides

### Slide 1 : Titre & Introduction
- Titre du projet
- Noms de l'équipe (Amine M'ZALI, Mehdi SAADI, Samy BOUAÏSSA)
- Contexte Efrei Paris 2025-2026

### Slide 2 : Le Constat - L'urgence d'une transition
- Organisation en silos (Lavande, Tulipe, Acacia, IRIS)
- Shadow IT critique (Excel, PowerPoint)
- Absence de vision 360° client
- Risque de surbooking

### Slide 3 : La Roadmap 18 Mois
- Phase 1 : Fondations & Gouvernance (0-3 mois)
- Phase 2 : Construction du Socle Unifié (4-9 mois)
- Phase 3 : Nouveaux Canaux & Services (6-12 mois)
- Phase 5 : Plateforme Analytique & Data Science (12-18 mois)
- Phase 6 : Vision Future (12-18+ mois)

### Slide 4 : La Gouvernance
- Modèle Hub & Spoke
- Rôles clés (CDO, DPO, Data Owners, Data Stewards)
- 4 Principes fondamentaux :
  - Data is Findable
  - Data is Secured
  - Data is Fit for Purpose
  - Data is Shared

### Slide 5 : L'Architecture Cible - Data Lake Unifié
- Flux de données complet :
  - Sources (Agences, Web/Mobile, SI Central)
  - Ingestion (ETL/ELT)
  - Stockage (Zones Raw et Curated)
  - Processing (Transformation & Qualité)
  - Consommation (BI, Data Science, APIs)

### Slide 6 : Les 4 Référentiels Maîtres
- **Client (MDM)** : Golden Record, vision 360°
- **Produit/Flotte (MDM)** : VIN unique, statut temps réel
- **Agence (REF DATA)** : GPS, horaires, abandon Excel
- **Réservation (TRANSACTIONNEL)** : Lien Client↔Véhicule

### Slide 7 : Cas d'usage - Maximisation du Revenu
- **Yield Management** : Tarification dynamique
  - Inputs : Réservation, Produit, Client, Concurrents, Météo/Events
  - Processing : Algorithme pricing, élasticité-prix
  - Output : Mise à jour tarif automatique
- **Optimisation Ressources** : Staffing & Flotte
  - Prévision charge de travail
  - Planning RH optimisé
  - Transferts inter-agences

### Slide 8 : Cas d'usage - Maintenance Prédictive
- Enjeu : Anticiper les pannes avant qu'elles n'arrivent
- Architecture IoT :
  - Télémétrie temps réel (codes erreur, pression pneus, batterie)
  - Analyse prédictive via Data Lake
  - Blocage automatique véhicule
  - Notification atelier
- KPIs : -60% pannes, -40% coûts dépannage

### Slide 9 : Qualité & Sécurité
- **Data Quality Process** :
  1. Discover (Profilage)
  2. Define (Règles métier)
  3. Integrate (Quality at Source)
  4. Monitor (DQ Dashboards)
- **Sécurité & RGPD** :
  - Classification C0 à C3
  - Chiffrement AES-256
  - Pseudonymisation
  - Data Catalog avec tagging automatique PII

### Slide 10 : Conclusion & Prochaines Étapes
- Bilan de ce qui a été construit
- Timeline d'implémentation sur 18 mois
- Facteurs clés de succès
- Impact attendu :
  - +25% CA via Pricing Dynamique
  - -60% Pannes en location
  - 100% Vision 360° Client
  - 0 Surbooking

## 🎨 Design & Technologies

- **Framework CSS** : Tailwind CSS (via CDN)
- **Typographie** : Plus Jakarta Sans (Google Fonts)
- **Palette de couleurs** :
  - Fond principal : Dégradé slate (#0f172a → #1e293b)
  - Accents : Orange (#f0661b) et Rouge (#dc2626)
  - Code couleur par référentiel :
    - Bleu : Client
    - Orange : Produit/Flotte
    - Vert émeraude : Agence
    - Violet : Réservation

## 📊 Points forts de la présentation

### Visuel
- Design moderne et professionnel
- Animations fluides (transitions CSS)
- Code couleur cohérent par thématique
- Iconographie claire (emojis significatifs)

### Contenu
- Structure logique suivant le plan du rapport
- Informations condensées mais complètes
- Schémas de flux de données détaillés
- KPIs et impacts chiffrés

### Navigation
- Contrôles intuitifs (souris + clavier)
- Indicateur de progression visuel
- Accès direct à n'importe quelle slide
- Titre contextuel en haut à gauche

## 📝 Modifications possibles

Pour personnaliser la présentation :

1. **Couleurs** : Modifier les classes Tailwind dans chaque slide
2. **Contenu** : Éditer directement les fichiers HTML des slides
3. **Nombre de slides** : Ajouter/supprimer dans `presentation-ockrent.html` :
   - Ajouter `<div class="slide" id="slide-X">` avec iframe
   - Ajouter point de progression dans `.progress`
   - Mettre à jour `totalSlides` et `slideTitles[]` dans le script
4. **Typographie** : Remplacer le lien Google Fonts dans `<head>`

## 🔗 Liens utiles

- **Rapport complet** : `rapport.md` (1314 lignes)
- **Plan de présentation** : `planDiapo.md`
- **Tailwind CSS** : https://tailwindcss.com/docs
- **Google Fonts** : https://fonts.google.com/

## 👥 Équipe

- **Amine M'ZALI**
- **Mehdi SAADI**
- **Samy BOUAÏSSA**

**Projet** : Data Management & Ethics
**École** : Efrei Paris
**Année** : 2025-2026

---

**Note** : Cette présentation a été générée automatiquement à partir du rapport complet et du plan de diapos fournis.
