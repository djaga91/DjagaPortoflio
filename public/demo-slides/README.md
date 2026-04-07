# 🎨 Slides de Démo PortfoliA V1

Ce dossier contient les 4 slides HTML pour la présentation de démo de PortfoliA V1.

## 📋 Liste des Slides

1. **`slide-1-equipe.html`** - Présentation de l'équipe (6 membres)
2. **`slide-2-demo.html`** - Parcours utilisateur de la démo
3. **`slide-3-roadmap.html`** - Roadmap V1.1, V1.2 et partenariats
4. **`slide-4-cta.html`** - Call to Action final

## 🎨 Design

- **Format :** 16:9 (1920x1080px)
- **DA :** Respecte la charte graphique PortfoliA
  - Fond : `#0f172b` (slate-950)
  - Orange Fox : `#f0661b`
  - Violet : `#8b5cf6`
  - Indigo : `#6366f1`
  - Effets : Blur, grilles, vignettes radiales
- **Police :** Plus Jakarta Sans (Google Fonts)

## 🖼️ Comment faire les screenshots

### Méthode 1 : Manuel (rapide)

1. Ouvrir chaque slide dans Chrome/Firefox :
   ```bash
   # Depuis le dossier frontend-game/public/demo-slides/
   open slide-1-equipe.html
   open slide-2-demo.html
   open slide-3-roadmap.html
   open slide-4-cta.html
   ```

2. Presser **F11** pour passer en plein écran

3. Faire une capture d'écran :
   - **Mac :** `Cmd + Shift + 4` puis `Espace` (capture fenêtre)
   - **Windows :** `Win + Shift + S` (outil Capture)
   - **Linux :** `Shift + Print Screen`

4. Sauvegarder les images en PNG ou JPEG

### Méthode 2 : Automatisée (avec Playwright)

Si vous avez Playwright installé dans le backend :

```bash
cd backend
source venv/bin/activate  # Activer l'environnement Python

# Créer un script de capture
python scripts/capture_slides.py
```

Contenu du script `backend/scripts/capture_slides.py` :

```python
from playwright.sync_api import sync_playwright
import os

slides = [
    "slide-1-equipe.html",
    "slide-2-demo.html",
    "slide-3-roadmap.html",
    "slide-4-cta.html"
]

output_dir = "../docs/presentations/slides-screenshots"
os.makedirs(output_dir, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1920, "height": 1080})

    for i, slide in enumerate(slides, start=1):
        file_path = f"file://{os.path.abspath(f'../frontend-game/public/demo-slides/{slide}')}"
        page.goto(file_path)
        page.wait_for_timeout(2000)  # Attendre le chargement
        page.screenshot(path=f"{output_dir}/slide-{i}.png")
        print(f"✅ Screenshot: slide-{i}.png")

    browser.close()

print("🎉 Toutes les slides ont été capturées !")
```

### Méthode 3 : Extension Chrome (haute résolution)

1. Installer l'extension **GoFullPage** ou **Awesome Screenshot**
2. Ouvrir chaque slide
3. Cliquer sur l'extension → Full Page Screenshot
4. Sauvegarder

## 📝 Personnalisation

### Modifier les noms de l'équipe

Dans `slide-1-equipe.html`, remplacer les placeholders :

```html
<!-- Tech Lead -->
<p class="text-white text-2xl font-bold">[Nom du Lead]</p>

<!-- Membres -->
<p class="text-white text-xl font-bold mb-1">[Membre 2]</p>
<p class="text-white text-xl font-bold mb-1">[Membre 3]</p>
<!-- etc. -->
```

Par les vrais noms :

```html
<p class="text-white text-2xl font-bold">Amine Benkirane</p>
<p class="text-white text-xl font-bold mb-1">Jean Dupont</p>
<!-- etc. -->
```

### Ajouter de vraies photos

Remplacer les emojis `👤` par des balises `<img>` :

```html
<!-- Au lieu de -->
<div class="text-3xl font-bold">👤</div>

<!-- Utiliser -->
<img src="../team/photo-membre-1.jpg" alt="Membre 1" class="w-24 h-24 rounded-xl object-cover shadow-lg" />
```

Placer les photos dans `frontend-game/public/team/`.

### Modifier les rôles

Adapter les rôles selon les compétences réelles :

```html
<p class="text-slate-400 text-sm">Backend & IA</p>
<p class="text-slate-400 text-sm">Frontend & UX</p>
<p class="text-slate-400 text-sm">DevOps & Cloud</p>
<!-- etc. -->
```

## 🔗 Intégration PowerPoint/Keynote

Si vous voulez importer les slides dans PowerPoint ou Keynote :

1. Faire les screenshots (méthodes ci-dessus)
2. Créer une présentation vierge 16:9
3. Insérer chaque image en plein écran
4. (Optionnel) Ajouter des transitions

**Avantage :** Plus facile pour naviguer pendant la présentation
**Inconvénient :** Perte de qualité si compression

## 📂 Organisation recommandée

```
docs/presentations/
├── DEMO_V1_SUPPORT.md          # Support de présentation (ce document)
├── slides-screenshots/          # Screenshots des slides (à créer)
│   ├── slide-1-equipe.png
│   ├── slide-2-demo.png
│   ├── slide-3-roadmap.png
│   └── slide-4-cta.png
└── PRESENTATION_DEMO_V1.pptx   # (Optionnel) PowerPoint avec slides
```

## 🎤 Utilisation en Présentation

### Option 1 : HTML en direct

- Ouvrir les 4 fichiers HTML dans des onglets Chrome
- Passer en mode présentation (F11)
- Naviguer avec `Cmd/Ctrl + Tab`

**Avantages :** Qualité parfaite, effets visuels préservés
**Inconvénients :** Nécessite d'avoir le navigateur

### Option 2 : Screenshots + PowerPoint

- Importer les screenshots dans PowerPoint/Keynote
- Mode présentateur classique

**Avantages :** Contrôle total, transitions fluides
**Inconvénients :** Perte des effets hover/blur dynamiques

### Option 3 : PDF

Générer un PDF depuis Chrome :

1. Ouvrir chaque slide
2. `Cmd/Ctrl + P` (Imprimer)
3. Destination : "Enregistrer au format PDF"
4. Taille : A4 paysage ou Personnalisée (1920x1080)
5. Fusionner tous les PDFs avec Preview/Adobe

## 🚀 Conseils pour la Démo

1. **Tester avant :** Ouvrir toutes les slides 1h avant pour vérifier l'affichage
2. **Backup :** Avoir les screenshots sur clé USB au cas où
3. **Navigation fluide :** Préparer l'ordre des onglets
4. **Timing :** 1 min par slide (sauf démo en direct qui dure 10-15 min)
5. **Confiance :** Vous avez bossé des mois, montrez-le avec fierté ! 🦊

## 📞 Contact

Pour toute question sur les slides :
- Ouvrir une issue GitHub
- Contacter l'équipe PortfoliA

---

**Bonne présentation ! 🎉**

*L'équipe PortfoliA*
