# 🚀 Test Simple - Animation Badge Légendaire

## Script de test à copier-coller dans la console

Ouvrez la console (F12) et exécutez ce script :

```javascript
// Version ultra-simple
const userId = "c5b621f5-5c1c-4815-b6bb-df0845529d63"; // Votre user_id
localStorage.setItem(`show_legendary_animation_${userId}`, 'true');
console.log('✅ Flag créé !');
console.log('🔄 Changez de page puis revenez sur Dashboard');
```

**OU** avec auto-détection de l'user_id :

```javascript
const userStr = localStorage.getItem('user');
if (userStr) {
  const user = JSON.parse(userStr);
  const userId = user.id;
  
  // Nettoyer l'ancien flag si présent
  localStorage.removeItem(`legendary_animation_shown_${userId}`);
  
  // Créer le nouveau flag
  localStorage.setItem(`show_legendary_animation_${userId}`, 'true');
  
  console.log('✅ Flag créé pour user:', userId);
  console.log('🔄 Maintenant:');
  console.log('   1. Cliquez sur "Mes Offres"');
  console.log('   2. Revenez sur "Mon Bureau"');
  console.log('   ➡️ L\'animation devrait apparaître !');
  
  // Vérification
  const check = localStorage.getItem(`show_legendary_animation_${userId}`);
  console.log('📋 Vérification - Flag présent:', check);
} else {
  console.error('❌ Utilisateur non connecté');
}
```

## Workflow complet

1. **Copier le script** ci-dessus
2. **Coller dans la console** (F12)
3. **Appuyer sur Entrée**
4. **Naviguer** : Mes Offres → Mon Bureau
5. **✨ L'animation apparaît !**

## Vérification manuelle

Pour vérifier que le flag est bien présent :

```javascript
const userId = "c5b621f5-5c1c-4815-b6bb-df0845529d63";
console.log('Flag trigger:', localStorage.getItem(`show_legendary_animation_${userId}`));
console.log('Already shown:', localStorage.getItem(`legendary_animation_shown_${userId}`));
```

Résultat attendu :
```
Flag trigger: "true"
Already shown: null
```

## Si ça ne marche toujours pas

Vérifiez dans la console après avoir navigué vers Dashboard :

```
[LEGENDARY] Debug: { userId: "...", shouldShowAnimation: "true", ... }
```

Si `shouldShowAnimation` est toujours `null`, le flag n'a pas été créé correctement.

## Reset complet

Si vous voulez recommencer de zéro :

```javascript
const userId = "c5b621f5-5c1c-4815-b6bb-df0845529d63";
localStorage.removeItem(`legendary_animation_shown_${userId}`);
localStorage.removeItem(`show_legendary_animation_${userId}`);
console.log('🧹 Nettoyage complet effectué');
```
