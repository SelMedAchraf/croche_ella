## 1. Vue d'ensemble du système de connexion Google

L'application utilise **Supabase Auth** combiné avec le **Fournisseur Google OAuth 2.0** pour permettre aux utilisateurs de se connecter de manière sécurisée sans avoir besoin d'une base de données de comptes utilisateurs personnalisée (e-mail/mot de passe).

## 2. Configuration Google Cloud

Avant que Supabase puisse authentifier les utilisateurs via Google, vous devez créer des identifiants OAuth dans la console Google Cloud.

**Étapes :**
1. Allez sur la [Console Google Cloud](https://console.cloud.google.com/).
2. Créez un **Nouveau projet** (par ex. "Croche Ella Auth").
3. Naviguez vers **API et services > Identifiants**.
4. Cliquez sur **Configurer l'écran de consentement** (Configure Consent Screen), cliquez sur "Premier pas" (Get Started), et remplissez les détails :
   - **Nom de l'application** : `Croche Ella Auth`
   - **E-mail d'assistance** (Support Email) : L'adresse que vos clients verront s'ils ont besoin d'aide avec la connexion (par ex. `crocheella19@gmail.com`).
   - **Audience** : Sélectionnez `Externe` (External).
   - **Coordonnées de développeur / Contact Information** : L'adresse e-mail (la vôtre ou `seloughamedachraf@gmail.com`) que Google utilisera pour envoyer des notifications techniques importantes sur le projet. *(Vos clients ne verront jamais cette adresse)*.
   - Cliquez sur **Enregistrer et continuer**.
5. Retournez dans **Identifiants** (Credentials), cliquez sur **Créer des identifiants**, et sélectionnez **ID client OAuth**.
6. Définissez le Type d'application sur **Application Web**.
7. Sous **URI de redirection autorisés**, ajoutez l'URL de redirection exacte de votre Supabase.
   *Pour la trouver, allez sur votre **Tableau de bord Supabase > Authentication > Providers > Google**. Vous trouverez l'URI sous "Callback URL (for OAuth)". Copiez cette URL exacte (elle ressemble à `https://xqflfxplxcxwiftsdccv.supabase.co/auth/v1/callback`) et collez-la ici.*
8. Cliquez sur **Créer** et notez votre **ID client** et votre **Code secret du client** (Client Secret).

---

## 3. Configuration Supabase

Une fois que vous avez les identifiants client Google, vous devez activer le fournisseur dans Supabase.

**Étapes :**
1. Allez sur votre [Tableau de bord Supabase](https://supabase.com/dashboard/).
2. Sélectionnez votre projet.
3. Dans la barre de navigation à gauche, ouvrez **Authentication** et naviguez vers l'onglet **Providers** (Fournisseurs).
4. Trouvez **Google** dans la liste et cliquez pour la développer.
5. Basculez le bouton **Enable Google** sur la position ON (Activé).
6. Collez l'**ID client** (Client ID) et le **Code secret du client** (Client Secret) que vous avez reçus de Google Cloud.
7. Assurez-vous que **Skip nonce checks** est sur OFF, sauf si requis pour des flux de travail iOS/Android spécifiques.
8. Cliquez sur **Save** (Enregistrer).

---

## 4. Variables d'environnement

Votre frontend React (`frontend/.env`) a besoin d'accéder à l'URL Supabase et à la clé Anon pour initialiser le client. **Ne codez pas en dur** ces identifiants dans les fichiers sources.

**Variables requises :**
```env
VITE_SUPABASE_URL=https://votre-url-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-publique-anon-supabase
```

*(Ces variables constituent le standard, elles devraient déjà être présentes dans votre installation Supabase).*

---

## 5. Configuration pour le développement local

Lors des tests de connexion Google sur `localhost`, vous devez configurer des URI autorisés supplémentaires pour que la redirection ne renvoie pas d'erreur.

**Tableau de bord Supabase :**
1. Allez dans **Authentication > URL Configuration**.
2. Assurez-vous que `http://localhost:5173` est listé sous **Site URL** ou **Redirect URLs**.

**Console Google Cloud :**
1. Vous n'avez généralement pas besoin de `localhost` dans les URI de redirection de la console Google Cloud si vous utilisez Supabase Auth, car Supabase gère la transaction OAuth côté serveur en utilisant `https://<ref-projet>.supabase.co/auth/v1/callback`, puis lance la redirection automatiquement en local.

---

## 6. Configuration pour la production

Pour le déploiement en production :

1. Dans **Authentication > URL Configuration** de Supabase, mettez à jour la **Site URL** avec votre domaine en direct (par ex. `https://crocheella.com`).
2. Ajoutez l'URL de rappel de production aux **Redirect URLs** (par ex. `https://crocheella.com/auth/callback`).
3. Chaque fois qu'un utilisateur se connecte en production, Supabase vérifiera que le domaine correspond bien à cette liste blanche.
4. Assurez-vous que votre plateforme de déploiement en production (Vercel, Render, etc.) a renseigné `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans les variables d'environnement de son tableau de bord.