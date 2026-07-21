# Sahm — Site à publier sur GitHub Pages

## Étape 1 — Créer le dépôt sur GitHub

1. Va sur [github.com/new](https://github.com/new)
2. Nom du dépôt : par exemple `sahm` (note bien ce nom, il te servira à l'étape 2)
3. Laisse "Public" coché (nécessaire pour GitHub Pages gratuit)
4. Ne coche PAS "Add a README" — clique directement sur "Create repository"

## Étape 2 — Adapter le nom du dépôt dans le projet

Ouvre le fichier `vite.config.js` et remplace `"/sahm/"` par
`"/NOM-DE-TON-DEPOT/"` (avec les slashs), en te basant sur le nom choisi à l'étape 1.

## Étape 3 — Pousser le code

Dans un terminal, à la racine de ce dossier :

```bash
git init
git add -A
git commit -m "Premier envoi du site Sahm"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/NOM-DE-TON-DEPOT.git
git push -u origin main
```

(Remplace `TON-PSEUDO` et `NOM-DE-TON-DEPOT` par tes vraies valeurs.)

## Étape 4 — Activer GitHub Pages

1. Sur la page de ton dépôt GitHub, va dans **Settings** → **Pages**
2. Sous "Build and deployment", choisis **Source : GitHub Actions**
3. C'est tout — un workflow (`.github/workflows/deploy.yml`, déjà inclus) va
   automatiquement construire et publier le site à chaque `git push`

## Étape 5 — Récupérer le lien à partager

Après 1-2 minutes, va dans l'onglet **Actions** du dépôt pour vérifier que le
déploiement a réussi (coche verte). Le site sera ensuite visible à cette adresse :

```
https://TON-PSEUDO.github.io/NOM-DE-TON-DEPOT/
```

C'est ce lien que tu partages avec ton collègue — il pourra l'ouvrir directement
dans son navigateur, sans rien installer.

## Étape 6 — Brancher ton nom de domaine (www.sahmm.ma)

Le fichier `public/CNAME` est déjà prêt avec `www.sahmm.ma` dedans — il sera copié
automatiquement dans le site publié. Il te reste 2 choses à faire :

### A. Chez ton registrar (là où tu as acheté sahmm.ma)

Va dans la gestion DNS de ton domaine et ajoute un enregistrement :

| Type  | Nom (host) | Valeur                  |
|-------|------------|--------------------------|
| CNAME | www        | TON-PSEUDO.github.io    |

(Remplace `TON-PSEUDO` par ton pseudo GitHub réel.)

Si tu veux aussi que `sahmm.ma` (sans "www") fonctionne et redirige vers
`www.sahmm.ma`, ajoute en plus ces 4 enregistrements A sur l'hôte racine (`@`) :

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Certains registrars marocains (comme l'ANRT/registre.ma) peuvent limiter les types
d'enregistrements disponibles — si le CNAME sur "www" n'est pas proposé, contacte
leur support pour voir quelles options ils permettent.

### B. Sur GitHub

1. Dans ton dépôt : **Settings → Pages**
2. Sous "Custom domain", tape `www.sahmm.ma` puis Save
3. Attends quelques minutes (parfois jusqu'à 24h pour la propagation DNS), puis
   recoche la case **"Enforce HTTPS"** une fois qu'elle devient disponible

Ton site sera alors accessible directement sur **https://www.sahmm.ma**.

## Automatisation des données de marché (toutes les 15 min)

Le fichier `scripts/update_data.py` récupère les cours en direct (différés de
15 min) depuis **e-bourse.ma**, la plateforme éducative officielle de la
Bourse de Casablanca (partenaire TradingView) — ce site autorise l'accès
automatisé, contrairement au site principal casablanca-bourse.com.

Le workflow `.github/workflows/deploy.yml` exécute ce script **automatiquement
toutes les 15 minutes** (en plus de chaque `git push`), puis reconstruit et
republie le site avec les données fraîches. Tu n'as rien à faire une fois que
c'est poussé sur GitHub — GitHub Actions s'en charge tout seul, gratuitement.

### ⚠️ Point important à vérifier après la mise en ligne

Ce script a été écrit sans pouvoir être testé en conditions réelles (pas
d'accès internet dans l'environnement où il a été créé). Après ton premier
`git push` :

1. Va dans l'onglet **Actions** de ton dépôt GitHub
2. Attends qu'une exécution programmée se déclenche (dans les 15 min), ou
   lance-la toi-même : Actions → "Déployer sur GitHub Pages" → "Run workflow"
3. Clique sur l'exécution, puis sur le job **build**, puis sur l'étape
   **"Récupérer les données de marché (e-bourse.ma)"**
4. Si tu vois `OK — XX valeurs, MASI=...`, tout fonctionne
5. Si tu vois une erreur en rouge, le site continuera de fonctionner quand
   même (grâce à `continue-on-error: true` et au fichier de secours
   `public/data/marche.json` déjà fourni), mais les données resteront figées
   sur leur dernière valeur connue. Dans ce cas, copie le message d'erreur et
   partage-le pour qu'on corrige le script ensemble.

### Tester le script en local (optionnel, avancé)

```bash
pip install requests
python scripts/update_data.py
```

## Pour tester en local avant de pousser (optionnel)

```bash
npm install
npm run dev
```

Puis ouvre l'adresse affichée dans le terminal (en général `http://localhost:5173`).

## À savoir

- Le simulateur de portefeuille utilise un système de stockage propre à Claude.ai
  (`window.storage`). En dehors de Claude.ai, il fonctionne quand même mais sans
  sauvegarde entre les visites (tout reste en mémoire pendant la session).
- Toutes les autres données (OPCVM, dividendes, capitalisation, indices mondiaux,
  matières premières) sont des captures figées à la date de création du site,
  pas des flux en temps réel.
