# 🎨 Bannière LinkedIn PortfoliA

## 📐 Spécifications Techniques

- **Dimensions** : 1584 x 396 pixels (format officiel LinkedIn)
- **Format** : PNG
- **Poids** : ~150-300 Ko
- **Couleurs** : Identité PortfoliA (orange #f0661b + violet #8b5cf6)

## 📁 Fichiers

| Fichier | Description |
|---------|-------------|
| `linkedin-banner.html` | Template HTML pour générer la bannière |
| `linkedin-banner.png` | Bannière finale prête à l'emploi |

## 🎯 Particularités du Design

### Zone de Sécurité

La bannière respecte la zone réservée au **logo de profil LinkedIn** qui se superpose en bas à gauche (~170x170 pixels).

Le contenu principal est décalé vers la droite pour éviter cette zone :
- Logo PortfoliA : Visible à gauche du texte
- Slogan : "Soyez plus qu'un simple CV"
- Description : "CV, Portfolio, Lettres : générez toute votre identité pro en un clic"
- URL : portfolia.fr avec barre gradient

### Éléments Visuels

✨ **Effets de fond** :
- Gradient orange (gauche) : Chaleur et dynamisme
- Gradient violet (droite) : Innovation et tech
- Grille subtile : Professionnalisme
- Vignette radiale : Profondeur

## 📤 Comment Utiliser sur LinkedIn

### 1. Télécharger la bannière
La bannière est disponible dans `/frontend-game/public/linkedin-banner.png`

### 2. Upload sur LinkedIn

1. **Aller sur votre profil LinkedIn**
2. **Cliquer sur l'icône "Modifier"** (crayon) en haut à droite de la bannière actuelle
3. **Sélectionner "Modifier l'arrière-plan"**
4. **Télécharger** `linkedin-banner.png`
5. **Ajuster** si nécessaire (LinkedIn permet de recadrer)
6. **Appliquer**

### 3. Prévisualisation

Avant d'uploader, vérifiez que :
- ✅ Votre photo de profil ne cache pas de texte important
- ✅ Le slogan est bien lisible
- ✅ Les couleurs correspondent à votre identité de marque

## 🔄 Régénérer la Bannière

Si vous souhaitez modifier le contenu :

### Méthode 1 : Modification manuelle

1. Éditer `linkedin-banner.html`
2. Ouvrir dans un navigateur (1584x396)
3. Capturer avec un outil de screenshot
4. Remplacer `linkedin-banner.png`

### Méthode 2 : Automatisée (avec script backend)

```bash
cd backend
python scripts/capture_linkedin_banner.py
```

## 🎨 Variantes Possibles

Vous pouvez créer des variantes en modifiant `linkedin-banner.html` :

| Variante | Modification |
|----------|--------------|
| **Personnalisé** | Ajouter votre nom/titre à droite |
| **Event** | Changer le slogan pour un événement spécifique |
| **Saisonnier** | Adapter les couleurs (Noël, Été, etc.) |
| **Multilingue** | Traduire en anglais pour profil international |

## 📊 Dimensions LinkedIn (Référence)

| Élément | Dimensions recommandées |
|---------|------------------------|
| Bannière de profil | 1584 x 396 px |
| Photo de profil | 400 x 400 px (affichée en 268 x 268) |
| Logo d'entreprise | 300 x 300 px |
| Bannière de page entreprise | 1128 x 191 px |

## 💡 Conseils

1. **Cohérence visuelle** : Utilisez les mêmes couleurs sur votre portfolio, CV et bannière
2. **Lisibilité** : Vérifiez que le texte est lisible sur mobile
3. **Mise à jour** : Changez votre bannière 2-3 fois par an pour rester dynamique
4. **A/B Testing** : Testez plusieurs versions et voyez laquelle génère le plus d'engagement

---

**Créé le** : 16 décembre 2024
**Dernière mise à jour** : 16 décembre 2024
**Version** : 1.0
