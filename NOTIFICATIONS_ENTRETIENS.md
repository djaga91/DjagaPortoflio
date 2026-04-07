# 🔔 Système de Notifications d'Entretiens et Tests

## Vue d'ensemble

Le système de notifications affiche automatiquement les **entretiens RH**, **entretiens techniques** et **tests** prévus pour **aujourd'hui** directement dans la cloche de notifications.

## 🎯 Fonctionnement

### Détection automatique

Le système vérifie toutes les **30 secondes** les offres sauvegardées et détecte :

1. **Entretiens RH** : `hr_interview_date` = aujourd'hui ET `hr_interview_completed` = false
2. **Entretiens Techniques** : `technical_interview_date` = aujourd'hui ET `technical_interview_completed` = false
3. **Tests** : `test_scheduled_date` = aujourd'hui ET `test_completed` = false

### Affichage dans la cloche

**Badge compteur** :
- Affiche le **total** : notifications backend + entretiens/tests actifs
- Exemple : 6 notifications backend + 3 entretiens = **9** sur la cloche

**Panneau de notifications** :
- **Section "Aujourd'hui"** en haut (fond orange clair)
- Liste des entretiens/tests avec :
  - Icône spécifique (👤 RH, 💼 Tech, 📄 Test)
  - Titre de l'offre
  - Nom de l'entreprise
  - Heure de l'entretien
- Puis les notifications classiques dessous

### Interactions

1. **Clic sur une notification d'entretien** :
   - Le compteur diminue (6 → 5)
   - Navigation vers "Mes Offres"
   - La notification est "dismissée" (disparaît de la liste)

2. **Notification dismissée** :
   - Reste dismissée pendant toute la session
   - Réapparaît si la page est rafraîchie (normal)

3. **Suppression définitive** :
   - Se produit automatiquement quand on coche :
     - ✅ "Entretien RH effectué"
     - ✅ "Entretien Technique effectué"  
     - ✅ "Test passé"

## 📊 Exemples

### Cas 1 : Journée chargée

**Aujourd'hui :**
- 3 entretiens RH (Entreprise A, B, C)
- 2 entretiens techniques (Entreprise D, E)
- 1 test à faire (Entreprise F)

**Résultat :**
- Badge cloche : **6** 🔔
- Panneau : Section "Aujourd'hui (6)" avec les 6 items

### Cas 2 : Après avoir cliqué sur 2 notifications

**Actions :**
- Clic sur entretien RH - Entreprise A
- Clic sur test - Entreprise F

**Résultat :**
- Badge cloche : **4** 🔔 (6 - 2)
- Panneau : Section "Aujourd'hui (4)" avec 4 items restants

### Cas 3 : Après avoir coché "Entretien effectué"

**Actions :**
- Dans "Mes Offres", cocher "Entretien RH effectué" pour Entreprise B

**Résultat :**
- Badge cloche : **3** 🔔 (4 - 1)
- La notification pour Entreprise B disparaît définitivement

## 🎨 Design

### Badge compteur
- Position : Top-right de la cloche
- Couleur : Rouge (`bg-red-500`)
- Texte : Blanc, bold
- Max : "9+" si > 9

### Section "Aujourd'hui"
- Header : Fond orange clair (`bg-orange-50` / `dark:bg-orange-900/20`)
- Icône : ⏰ Clock
- Text : "Aujourd'hui (N)" en orange

### Cartes d'entretien
- Fond : Orange très clair (`bg-orange-50/50`)
- Hover : Orange plus foncé
- Icône : Gradient orange → rouge
- Indicateur : Point orange (non bleu)

### Types d'entretiens

| Type | Icône | Label | Couleur |
|------|-------|-------|---------|
| RH | 👤 UserCheck | Entretien RH | Orange |
| Tech | 💼 Briefcase | Entretien Technique | Orange |
| Test | 📄 FileCheck | Test à faire | Orange |

## 🔧 Code

### Interface

```typescript
interface TodayInterview {
  id: string;                    // "hr_123", "tech_456", "test_789"
  type: 'hr' | 'tech' | 'test';  // Type d'entretien
  offerTitle: string;             // Titre de l'offre
  companyName: string;            // Nom de l'entreprise
  date: string;                   // Date ISO complète
  time: string;                   // Heure formatée "14:30"
  completed: boolean;             // Si déjà effectué
  offerId: string;                // ID de l'offre
}
```

### État

```typescript
const [todayInterviews, setTodayInterviews] = useState<TodayInterview[]>([]);
const [dismissedInterviews, setDismissedInterviews] = useState<Set<string>>(new Set());
```

### Fonctions clés

- `fetchTodayInterviews()` : Récupère les offres et filtre celles d'aujourd'hui
- `markInterviewAsDismissed(id)` : Ajoute l'ID au Set des dismissés
- `handleInterviewClick(interview)` : Dismiss + navigation vers Mes Offres

## 📝 Notes

1. **Rafraîchissement** : Toutes les 30 secondes (même intervalle que les notifs backend)
2. **Timezone** : Les dates sont comparées en timezone locale
3. **Dismiss temporaire** : Les notifications dismissées reviennent après refresh (comportement voulu)
4. **Suppression définitive** : Uniquement via les checkboxes dans "Mes Offres"
5. **Priorité** : Les entretiens/tests apparaissent TOUJOURS en premier (avant les notifs backend)

## 🧪 Test

1. **Créer une offre** avec un entretien aujourd'hui :
   ```
   Entretien RH : 24/01/2026 14:30
   ```

2. **Vérifier** :
   - Badge cloche : **1** 🔔
   - Panneau : "Aujourd'hui (1)"
   - Notification visible avec détails

3. **Cliquer** sur la notification :
   - Badge : **0** 🔔
   - Navigation vers "Mes Offres"

4. **Rafraîchir** la page :
   - Badge : **1** 🔔 (revient)

5. **Cocher** "Entretien RH effectué" :
   - Badge : **0** 🔔 (disparaît définitivement)

## 🚀 Améliorations futures

- [ ] Persist dismissed dans localStorage
- [ ] Notifications push (si possible)
- [ ] Rappel 1h avant l'entretien
- [ ] Indicateur "dans 30 min" si proche
- [ ] Tri par heure (le plus proche en premier)
