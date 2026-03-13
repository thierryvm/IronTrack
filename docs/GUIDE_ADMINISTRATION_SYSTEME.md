# Guide d'Administration Système IronTrack

**Version**: 1.0.0  
**Dernière mise à jour**: 2025-01-29  
**Public**: Administrateurs système et super-administrateurs  

## 🎯 Vue d'ensemble

Ce guide est destiné aux administrateurs qui gèrent le système IronTrack en production. Il couvre les outils d'administration, la maintenance et les procédures opérationnelles.

## 🔐 Accès Administration

### Interface d'administration
- **URL**: `/admin` (nécessite rôle admin/super_admin)
- **Authentification**: voir `.env.local` pour l'email admin (compte de test)
- **Niveaux d'accès**: moderator, admin, super_admin

### Navigation principale
- **Dashboard**: Vue d'ensemble des métriques système
- **Gestion utilisateurs**: Administration des comptes et rôles
- **Support tickets**: Système de support intégré
- **Logs système**: Audit trails et monitoring
- **Optimisation images**: Outils de performance (nouveau)

## ⚡ Système d'Optimisation d'Images

### 🎯 Accès et utilisation
**Localisation**: `/admin/image-optimization`

**Fonctionnalités principales**:
- **Scan automatique**: Détection des images à optimiser
- **Optimisation batch**: Traitement par lots de 50 images
- **Feedback temps réel**: Progression et statistiques live
- **Cache management**: Warnings et gestion cache Supabase

### 📊 Métriques et performance
- **Compression**: Jusqu'à 78% sur images optimisables
- **Seuils intelligents**: Minimum 1KB ou 0.5% de gain
- **Formats supportés**: JPEG, PNG, WebP, HEIC
- **Paramètres compression**:
  - JPEG: 75% qualité
  - PNG: 75% qualité  
  - WebP: 80% qualité

### 🔧 Procédure d'optimisation
1. **Sélectionner bucket**: `exercise-images` (par défaut)
2. **Lancer scan**: Analyse automatique des images
3. **Valider traitement**: Vérifier nombre d'images détectées
4. **Démarrer optimisation**: Process batch automatique
5. **Monitoring**: Suivre progression temps réel
6. **Vérification**: Contrôler résultats et compression

### ⚠️ Précautions importantes
- **Cache Supabase**: Attendre 5-10 minutes entre scans successifs
- **Backup automatique**: Images originales remplacées (pas de sauvegarde)
- **Seuil minimum**: Seules les images >1KB gain sont optimisées
- **Déjà optimisées**: Exclusion automatique des images traitées

## 👥 Gestion des Utilisateurs

### Niveaux de permissions
- **user**: Accès standard application
- **moderator**: Modération contenus + support niveau 1
- **admin**: Administration complète sauf gestion admins
- **super_admin**: Accès total + gestion des administrateurs

### Actions administratives
- **Bannissement temporaire**: Suspension compte utilisateur
- **Modification rôles**: Élévation/réduction permissions
- **Audit activité**: Consultation logs utilisateur
- **Export données**: Extraction informations RGPD

## 🎫 Système de Support

### Interface tickets
- **Vue d'ensemble**: Liste tous tickets actifs
- **Filtrage**: Par statut, priorité, utilisateur
- **Réponses**: Interface conversation intégrée
- **Escalade**: Changement statut et priorité

### États des tickets
- **open**: Nouveau ticket non traité
- **in_progress**: En cours de traitement
- **waiting_user**: Attente réponse utilisateur
- **resolved**: Résolu, attente validation
- **closed**: Fermé définitivement

## 📊 Monitoring et Logs

### Logs d'audit
**Localisation**: `/admin/logs`

**Types d'événements trackés**:
- Connexions administrateurs
- Modifications données sensibles
- Actions utilisateurs critiques
- Erreurs système importantes

### Métriques système
- **Utilisateurs actifs**: Compteurs jour/semaine/mois
- **Performance DB**: Temps réponse requêtes
- **Utilisation stockage**: Supabase Storage quotas
- **Erreurs**: Frequency et types d'erreurs

## 🔧 Maintenance Système

### Tâches quotidiennes
- **Vérification logs erreurs**: Review des erreurs critiques
- **Monitoring performances**: Contrôle métriques Vercel/Supabase
- **Support tickets**: Traitement tickets prioritaires

### Tâches hebdomadaires  
- **Optimisation images**: Lancement scan/optimisation storage
- **Audit utilisateurs**: Review comptes suspects/inactifs
- **Backup validation**: Vérification sauvegardes automatiques

### Tâches mensuelles
- **Mise à jour sécurité**: Review et application patches
- **Analyse performances**: Optimisation queries DB
- **Nettoyage données**: Purge logs anciens et données temporaires

## 🚨 Procédures d'Urgence

### Incident sécurité
1. **Isolation**: Bannir utilisateur/IP suspect
2. **Documentation**: Logger incident dans admin_logs
3. **Notification**: Alerter équipe technique
4. **Investigation**: Audit complet activité suspecte

### Panne système
1. **Diagnostic**: Vérifier status Vercel + Supabase
2. **Mitigation**: Actions correctives immédiates
3. **Communication**: Update status page si nécessaire
4. **Post-mortem**: Analyse et prévention récurrence

## 📞 Contacts et Support

### Équipe technique
- **Développeur principal**: Contact via GitHub Issues
- **Infrastructure**: Supabase/Vercel Support
- **Sécurité**: Protocole incident security@

### Ressources externes
- **Supabase Dashboard**: Monitoring BDD
- **Vercel Dashboard**: Performance application
- **GitHub Repository**: Code source et issues

---

**© 2025 IronTrack - Guide Administration Système**  
*Version 1.0.0 - Optimisation d'images intégrée*