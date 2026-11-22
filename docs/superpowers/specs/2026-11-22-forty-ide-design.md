# Forty — un IDE pour apprendre à coder, simplement

*Document de conception — 22 novembre 2026*

## 1. Pourquoi ce projet

Les outils d'apprentissage façon « piscine » existent, mais ils sont **trop compliqués** :
- trop de mots techniques ;
- des consignes en gros blocs de texte, sans explication.

Le but de Forty, c'est d'apprendre l'informatique **comme à la piscine** : des exercices progressifs, corrigés automatiquement. Mais ici, **chaque idée est expliquée simplement, ligne par ligne**, pour quelqu'un qui sait seulement naviguer sur le web.

Forty est aussi pensé pour les élèves **dyslexiques** ou qui ont **du mal à se concentrer** : police au choix, lecture à voix haute, minuteur de concentration, rappels (boire, faire une pause) et encouragements.

Pour qui : **d'abord pour l'auteur**, sur son Mac, avec sa propre clé IA. Ce n'est pas encore un produit à distribuer.

## 2. Objectifs, non-objectifs, anti-objectifs

**Objectifs (v1)**
- Une appli Mac avec un vrai éditeur de code et un vrai terminal.
- Un parcours **Shell obligatoire**. Une fois le Shell fini, on choisit librement le cours suivant parmi **C, Git, Python**, dans l'ordre qu'on veut.
- Chaque exercice est présenté de façon simple, avec une explication ligne par ligne.
- Une **correction automatique** à deux niveaux : « Vérifier » pour s'entraîner, et la **Moulinette** classique de la piscine pour le vrai rendu (Git, tout ou rien, note /100, trace).
- Un **prof IA** qui donne des **indices**, jamais la solution toute faite.
- Des réglages d'accessibilité et de concentration complets.
- 6 thèmes (3 sombres, 3 clairs), avec un style inspiré des IDE JetBrains.

**Non-objectifs (pas dans la v1)**
- Comptes utilisateurs, serveur en ligne, plusieurs élèves.
- Windows et Linux.
- Correction entre élèves (peer-evaluation), mode examen, vidéos.
- Un « vrai » bac à sable isolé (Docker / machine virtuelle).

**Anti-objectifs (si ça arrive, c'est raté, même si ça fonctionne)**
- Un mot technique qui apparaît **sans explication à portée de clic**.
- Des murs de texte. Une consigne, c'est des petites étapes.
- Des rappels qui culpabilisent (« tu as raté ta série ! »). Le ton est toujours bienveillant.
- Un prof IA qui donne la réponse à copier-coller.
- Une interface chargée de boutons et de menus comme VS Code.

## 3. Comment c'est fabriqué (approche choisie)

Trois approches ont été comparées :

| Approche | Avantage | Problème |
|---|---|---|
| **1. Appli à nous avec les pièces de VS Code** ✅ choisie | On contrôle toute l'interface, c'est léger et rapide à faire | On n'a pas les extras de VS Code (pas utiles ici) |
| 2. Module dans VS Code | Le plus rapide | L'interface reste celle de VS Code, trop chargée : ça va contre le but du projet |
| 3. Copie complète de VS Code | Tout VS Code | Énorme, des heures de compilation, très dur à faire évoluer |

**Pièces techniques** *(choix du constructeur, validés en principe)* :
- **Electron** : l'appli Mac (fenêtre, notifications, accès aux fichiers).
- **Monaco** : l'éditeur de code de VS Code.
- **xterm.js + node-pty** : le terminal de VS Code, branché sur un vrai shell du Mac.
- **React + TypeScript + Vite** : l'interface.
- **API Claude** pour le prof IA. La clé est stockée chiffrée dans le trousseau du Mac (`safeStorage` d'Electron).
- **Stockage local** (fichiers JSON dans le dossier de l'appli) : progression, réglages, statistiques.

## 4. Organisation des cours (format piscine)

```
Cours (ex. Shell)
 └─ Module (ex. Shell 00)
     └─ Mission (ex. ex00 — « Créer ton premier fichier »)
```

- **Le Shell est obligatoire.** Il débloque C, Git et Python, qui sont ensuite tous accessibles. L'élève choisit.
- Dans un module, les missions se débloquent l'une après l'autre (on peut relire les anciennes).
- **On passe au module suivant en réussissant la Moulinette** (au moins 50/100), comme à la piscine.
- **Chaque mission a un dossier de rendu** : `~/Forty/<cours>/<module>/<exNN>/`, avec les noms de fichiers attendus, comme à la piscine.
- **Les cours sont des fichiers de contenu** (Markdown + JSON), séparés du code de l'appli. Ajouter un nouveau langage plus tard, c'est ajouter un dossier de contenu, sans toucher au code.

**Contenu de la v1** : le **cours Shell complet** (2 modules, environ 15 à 20 missions, inspirés des bases du Shell de piscine : fichiers, dossiers, droits, redirections, pipes, petits scripts). Pour **C, Git et Python**, la structure est prête avec le premier module de chacun. Les modules suivants viendront en étapes séparées.

## 5. Une mission, écran par écran

Chaque mission suit toujours le même déroulé, pour ne pas surprendre :

1. **L'idée en une phrase**, avec une image du quotidien.
   *« Un dossier, c'est comme un tiroir : tu ranges des fichiers dedans. »*
2. **Exemple commenté ligne par ligne.** On clique sur une ligne de code et une bulle explique ce qu'elle fait, en langage simple. Chaque mot technique est souligné : on le survole et la définition s'affiche (glossaire).
3. **À toi !** La consigne est découpée en **petites étapes à cocher** (3 à 5 maximum), avec le nom du fichier à rendre bien visible.
4. **Bouton « Vérifier ».** La correction d'entraînement tourne (la vraie note, c'est la Moulinette, voir section 6) et affiche un résultat clair :
   - ✅ ce qui marche ;
   - ❌ ce qui ne marche pas, expliqué simplement (« Ton fichier s'appelle `Test.txt`, mais il doit s'appeler `test.txt` : les majuscules comptent »).
5. **Bouton « Je bloque ».** Le prof IA donne des indices **par paliers** :
   - palier 1 : une piste ;
   - palier 2 : une piste plus précise ;
   - palier 3 : un exemple **similaire**, mais pas la solution.

Il y a aussi un **chat avec le prof IA** à tout moment. Le prof connaît la mission en cours, le code de l'élève et la dernière erreur de correction. Sa consigne permanente : expliquer simplement, avec des images du quotidien, ne jamais donner la solution complète, et toujours vérifier que l'élève a compris.

**Croquis de l'écran principal :**
```
┌───────────────────────────────────────────────────────────────────┐
│  ◉ Forty    Shell › Shell 00 › ex02        ⏱ 18:42   💧   ⚙︎      │
├──────────────────┬───────────────────────────────┬────────────────┤
│  📖 Mission      │  ex02.sh                      │  🎓 Prof       │
│                  │  1  #!/bin/sh                 │                │
│  L'idée :        │  2  ls -l                     │  « Tu veux un  │
│  « Un dossier,   │  3                            │   indice ? »   │
│  c'est un        │                               │                │
│  tiroir… »       │                               │  [Je bloque]   │
│                  ├───────────────────────────────┤                │
│  ☐ Étape 1       │  $ terminal                   │                │
│  ☐ Étape 2       │                               │                │
│  [🔊 Écouter]    │                               │                │
│  [✓ Vérifier]    │                               │                │
└──────────────────┴───────────────────────────────┴────────────────┘
```
Les panneaux sont arrondis, avec beaucoup d'espace. Le **mode Focus** masque tout sauf la consigne et l'éditeur.

## 6. Correction : « Vérifier » et la Moulinette

Il y a **deux niveaux de correction**, comme à la piscine où l'on teste soi-même avant le vrai rendu.

### 6.1 « Vérifier » : l'entraînement
- Le bouton est dans chaque mission. Il corrige **cette mission seulement**, tout de suite.
- C'est bienveillant : on peut vérifier autant de fois qu'on veut, et chaque erreur est expliquée simplement.

### 6.2 La Moulinette : le vrai rendu, à l'ancienne
La Moulinette corrige **un module entier**, avec les règles classiques et strictes de la piscine :
- **Rendu par Git** : le travail est rendu dans un dépôt Git local (`~/Forty/rendu/<module>`). Au début, le bouton **« Rendre »** fait le `git add` / `commit` / `push` à ta place et explique chaque commande. Plus tard, on peut le faire soi-même dans le terminal.
- **Tout ou rien par exercice** : si un seul test d'un exercice échoue, l'exercice vaut 0.
- **Arrêt au premier exercice raté** : si ex02 est faux, ex03 et la suite ne sont pas comptés, même s'ils sont justes.
- **Respect strict du rendu** : nom de fichier exact, bon dossier, aucun fichier en trop.
- **Norme** pour le C : vérification du style (avec la `norminette` officielle si elle est installée, sinon un vérificateur simplifié intégré). Une faute de norme vaut 0 à l'exercice.
- **Fonctions interdites** pour le C : on vérifie que seules les fonctions autorisées sont utilisées.
- **Note sur 100**, plus une **trace** : le rapport détaillé, exercice par exercice. La trace est montrée dans sa version brute, comme à la piscine, **et** traduite en phrases simples juste à côté.
- **Validation** : un module est validé à partir de **50/100**. Le module suivant se débloque alors.
- **Délai entre deux rendus** *(réglable)* : par défaut, il faut attendre **15 minutes** avant de relancer la Moulinette sur le même module. Ça pousse à bien tester avec « Vérifier » avant de rendre.
- **Historique** des notes et des traces pour chaque module.

### 6.3 Comment les tests fonctionnent (pour les deux niveaux)
- Chaque mission a un fichier de tests.
- **Shell** : on lance le script avec `bash` dans un dossier temporaire préparé pour le test, puis on compare la sortie, les fichiers créés et les droits.
- **C** : compilation avec `gcc -Wall -Wextra -Werror`, avec un `main` de test fourni, puis comparaison de la sortie.
- **Python** : on lance `python3` avec des tests fournis.
- **Git** : on vérifie l'état du dépôt (commits, branches, fichiers suivis).
- Chaque test a une **limite de temps**, pour qu'une boucle infinie ne bloque pas l'appli.
- Chaque erreur technique (message de gcc, etc.) est **traduite en phrase simple**. Le message brut reste visible dans un « détail » repliable.
- **Sécurité** : le code s'exécute sur le Mac de l'élève, dans des dossiers dédiés. Ce n'est pas un vrai bac à sable. C'est acceptable ici, puisque c'est pour un seul élève sur sa propre machine.

## 7. Accessibilité (dyslexie)

- **Choix de la police** pour le texte : Inter, Lexend, Atkinson Hyperlegible, OpenDyslexic. Pour le code : JetBrains Mono, Fira Code, OpenDyslexic Mono. Toutes ces polices sont libres.
- Réglages de **taille**, d'**espace entre les lettres** et d'**espace entre les lignes**.
- **Lecture à voix haute** des consignes et des réponses du prof (voix du Mac), avec le mot lu surligné.
- **Règle de lecture** : une bande qui surligne la ligne en cours, dans la consigne comme dans l'éditeur.
- **Glossaire** : survol d'un mot technique = définition simple.
- Phrases courtes, icônes en plus des couleurs, jamais d'information donnée **seulement** par la couleur.

## 8. Concentration et bien-être

- **Minuteur de concentration** de type Pomodoro (25 min de travail, 5 min de pause, réglable).
- **Mode Focus** : interface réduite au minimum.
- **Rappels** activables un par un, avec une fréquence réglable : 💧 boire, 🧍 s'étirer / la posture, 👀 reposer ses yeux (règle 20-20-20), ☕ faire une vraie pause. Ce sont des notifications du Mac, plus un petit bandeau dans l'appli.
- **Motivation** : un objectif du jour (ex. 2 missions), une série de jours **sans punition** (un jour raté ne remet rien à zéro de façon brutale), des badges, une barre de progression par cours, des messages d'encouragement après une réussite ou après plusieurs échecs.
- **Bilan de séance** : ce que tu as appris aujourd'hui, en 3 lignes.

## 9. Style visuel

Inspiré de l'interface des IDE **JetBrains** (le style, pas leurs logos ni leurs éléments de marque) :
- police d'interface **Inter**, police de code **JetBrains Mono** (libre) ;
- **coins arrondis** partout (8 à 12 px), boutons arrondis ;
- **marges et espacements généreux**, interface aérée ;
- barre du haut sobre, panneaux séparés par de l'espace plutôt que par des traits ;
- icônes simples et cohérentes.

**Les 6 thèmes** *(couleurs choisies par le constructeur, ajustables après essai)* :

| Thème | Type | Ambiance |
|---|---|---|
| **Minuit** | sombre | bleu nuit profond, accents violets et rose-rouge (dans l'esprit de « Tokyo Night ») |
| **Graphite** | sombre | gris neutre, accent bleu (le classique « IDE ») |
| **Forêt** | sombre | vert sapin très foncé, accents menthe et ambre |
| **Sable** | clair | beige chaud et bleu clair |
| **Nuage** | clair | blanc cassé et gris-bleu, accent bleu |
| **Lavande** | clair | lilas très pâle, accents violet et pêche |

Chaque thème colore à la fois l'interface, l'éditeur et le terminal. Le contraste du texte doit rester confortable (cible AA).

## 10. Réglages et première ouverture

- **Premier lancement** : bienvenue → choix du thème et de la police (avec aperçu en direct) → réglage des rappels → saisie de la clé IA (facultatif : sans clé, tout marche sauf le prof IA) → début du Shell.
- Tous ces choix restent modifiables dans les Réglages.

## 11. Découpage en étapes

1. **Squelette** : appli Electron, éditeur, terminal, les 6 thèmes, le choix des polices.
2. **Moteur de cours** : lecture du contenu, écran de mission, progression, « Vérifier », puis la **Moulinette** (rendu Git, note, trace).
3. **Cours Shell, module 00**, avec explications ligne par ligne et glossaire.
4. **Prof IA** : chat et indices par paliers.
5. **Accessibilité et concentration** : voix, règle de lecture, minuteur, rappels, motivation.
6. **Cours Shell, module 01**, plus le premier module de C, Git et Python.

## 12. Choix laissés au constructeur

- L'organisation exacte des fichiers et les noms internes.
- Le modèle Claude utilisé (un modèle puissant pour le prof, un modèle rapide pour les petites tâches comme le glossaire).
- Le format exact des fichiers de contenu et de tests.
- Les couleurs exactes des thèmes, à faire valider à l'écran.
- La rédaction des missions, en suivant les règles des sections 5 et 7.
- Le shell du terminal intégré : zsh, celui du Mac. Les scripts d'exercice sont testés avec `bash`.
