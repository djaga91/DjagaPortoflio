# 🏆 Animation du Badge Légendaire

## Vue d'ensemble

Animation de célébration qui s'affiche sur le **Dashboard** après avoir coché "Je suis pris" sur une offre d'emploi ET obtenu le badge Légendaire.

## 🎯 Fonctionnalités

### Déclenchement
1. L'utilisateur coche "Je suis pris" sur une offre d'emploi dans **Mes Offres**
2. Le backend vérifie si l'utilisateur a complété son profil suffisamment
3. Si oui → Badge Légendaire débloqué
4. Un flag est stocké dans `localStorage` : `show_legendary_animation_{user_id} = true`

### Affichage
Lorsque l'utilisateur retourne sur le **Dashboard** :
1. Le système détecte le flag dans `localStorage`
2. L'animation du renard couronné apparaît en bas à gauche
3. Bulle de texte : **"Prends ta couronne toi aussi ! 👑"**
4. L'écran devient sombre (overlay noir 80%)
5. **EXCEPTION** : La zone "Mes Badges" reste éclairée avec :
   - `z-index: 9999` (au-dessus de l'overlay)
   - Background blanc/slate-900 opaque
   - Border dorée (amber-400/500)
   - Ring ambré brillant
   - Shadow ambrée

### Fermeture
- **Clic n'importe où** sur l'écran → Animation se ferme
- **Timeout 6 secondes** → Animation se ferme automatiquement
- L'animation est marquée comme vue : `legendary_animation_shown_{user_id} = true`
- Elle ne s'affiche plus jamais pour cet utilisateur

## 📁 Fichiers

### Composants créés
- `/frontend-game/src/components/LegendaryBadgeAnimation.tsx` - Composant d'animation

### Fichiers modifiés
- `/frontend-game/src/pages/DashboardView.tsx` - Gestion de l'affichage de l'animation
- `/frontend-game/src/pages/MesOffresView.tsx` - Déclenchement via localStorage

### Assets
- `/frontend-game/public/fox-crowned.json` - Animation Lottie du renard couronné (375 KB)

## 🎨 Design

### Animation
- **Position** : Bas à gauche
- **Taille** : 64x64 → 80x80 (sm → md) - Plus grande que l'animation de login
- **Loop** : Oui (tant que visible)
- **Durée visible** : 6 secondes (+ long que login pour savourer)

### Bulle de texte
- **Texte** : "Prends ta couronne toi aussi ! 👑"
- **Style** : 
  - Background blanc/slate-800
  - Border dorée (amber-400/500)
  - Shadow ambrée
  - Glow doré
- **Position** : Collée au renard (comme LoginAnimation)

### Overlay
- **Opacité** : 80% noir
- **Backdrop blur** : sm
- **z-index** : 9998
- **Cliquable** : Oui (ferme l'animation)

### Zone "Mes Badges" éclairée
Pendant l'animation, cette zone reste visible avec :
```css
z-index: 9999
background: white (opaque) / slate-900 (opaque)
border: amber-400 / amber-500
ring: 4px amber-400/50 / amber-500/50
shadow: shadow-2xl shadow-amber-500/50
```

## 🔧 Logique technique

### localStorage flags

| Key | Valeur | Description |
|-----|--------|-------------|
| `show_legendary_animation_{user_id}` | `'true'` | Flag temporaire pour déclencher l'animation |
| `legendary_animation_shown_{user_id}` | `'true'` | Animation déjà vue (permanent) |

### Workflow complet

```
1. MesOffresView: Coche "Je suis pris"
   └─> Backend vérifie le badge légendaire
       └─> Si débloqué: localStorage.setItem('show_legendary_animation_123', 'true')

2. Navigation vers Dashboard
   └─> useEffect détecte le flag
       └─> Animation s'affiche
           └─> localStorage.setItem('legendary_animation_shown_123', 'true')
           └─> localStorage.removeItem('show_legendary_animation_123')

3. Fermeture (clic ou timeout)
   └─> Animation disparaît
```

## 🚀 Test

### Conditions de test
1. Avoir un profil bien complété (≥90%)
2. Cocher "Je suis pris" sur une offre
3. Attendre le toast "BADGE LÉGENDAIRE DÉBLOQUÉ"
4. Naviguer vers Dashboard → Animation apparaît
5. Cliquer ou attendre 6s → Animation disparaît
6. Revenir sur Dashboard → Animation ne réapparaît plus

### Reset pour tester à nouveau
```javascript
// Dans la console du navigateur
localStorage.removeItem('legendary_animation_shown_123'); // Remplacer 123 par votre user_id
localStorage.setItem('show_legendary_animation_123', 'true');
// Rafraîchir le dashboard
```

## 🎯 Points d'attention

- ✅ L'animation ne s'affiche qu'une seule fois par utilisateur
- ✅ L'animation n'apparaît que sur le Dashboard (pas sur d'autres pages)
- ✅ La zone "Mes Badges" reste visible pendant l'overlay
- ✅ L'animation est responsive (tailles différentes mobile/desktop)
- ✅ Le vocabulaire est professionnel (pas "gaming")
- ✅ L'utilisateur peut fermer l'animation à tout moment (clic)

## 📝 Notes

- L'animation Lottie fait 375 KB - Acceptable car chargée une seule fois
- Le composant suit le même pattern que `LoginAnimation.tsx`
- Le z-index 9999 sur "Mes Badges" permet de passer au-dessus de l'overlay (9998)
- La durée de 6 secondes est volontairement plus longue pour célébrer dignement
