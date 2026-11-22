# Forty — un IDE pour apprendre à coder, simplement

*Document de conception — 22 novembre 2026 (mis à jour le même jour : plus d'IA, anti-triche, examens, révisions)*

## 1. Pourquoi ce projet

Les outils d'apprentissage façon « piscine » existent, mais ils sont **trop compliqués** :
- trop de mots techniques ;
- des consignes en gros blocs de texte, sans explication.

Le but de Forty, c'est d'apprendre l'informatique **comme à la piscine** : des exercices progressifs, corrigés automatiquement. Mais ici, **chaque idée est expliquée simplement, ligne par ligne**, pour quelqu'un qui sait seulement naviguer sur le web.

Forty est aussi pensé pour les élèves **dyslexiques** ou qui ont **du mal à se concentrer** : police au choix, lecture à voix haute, minuteur de concentration, rappels (boire, faire une pause) et encouragements.

Forty recrée **les conditions de la piscine** : on apprend seul, **sans IA**, en cherchant, en se trompant et en recommençant. Les sites d'IA sont bloqués (le reste d'internet reste ouvert), et des **examens chronométrés** vérifient qu'on a vraiment compris.

Pour qui : **d'abord pour l'auteur**, sur son Mac. Ce n'est pas encore un produit à distribuer.

## 2. Objectifs, non-objectifs, anti-objectifs

**Objectifs (v1)**
- Une appli Mac avec un vrai éditeur de code et un vrai terminal.
- Un parcours **Shell obligatoire**. Une fois le Shell fini, on choisit librement le cours suivant parmi **C, Git, Python**, dans l'ordre qu'on veut.
- Chaque exercice est présenté de façon simple, avec une explication ligne par ligne.
- Une **correction automatique** à deux niveaux : « Vérifier » pour s'entraîner, et la **Moulinette** classique de la piscine pour le vrai rendu (Git, tout ou rien, note /100, trace).
- **Pas d'IA** : les sites d'IA sont bloqués sur tout le Mac pendant les séances, internet est coupé pendant les examens.
- Des **examens chronométrés** (intermédiaires et finaux) qui contrôlent le niveau, avec retour sur les modules ratés.
- Un onglet **Révisions** avec des mini-exercices courts pour ne pas oublier (répétition espacée).
- Des réglages d'accessibilité et de concentration complets.
- 6 thèmes (3 sombres, 3 clairs), avec un style inspiré des IDE JetBrains.

**Non-objectifs (pas dans la v1)**
- Comptes utilisateurs, serveur en ligne, plusieurs élèves.
- Windows et Linux.
- Correction entre élèves (peer-evaluation), vidéos.
- Le **multijoueur** (parler avec d'autres élèves) : idée gardée pour plus tard, rien n'est décidé.
- Un « vrai » bac à sable isolé (Docker / machine virtuelle).

**Anti-objectifs (si ça arrive, c'est raté, même si ça fonctionne)**
- Un mot technique qui apparaît **sans explication à portée de clic**.
- Des murs de texte. Une consigne, c'est des petites étapes.
- Des rappels qui culpabilisent (« tu as raté ta série ! »). Le ton est toujours bienveillant.
- Une IA accessible d'une façon ou d'une autre pendant une séance ou un examen.
- Recopier les énoncés officiels ou les solutions d'élèves (voir section 4).
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

**Sources des exercices** : Forty reprend **le format et la progression de la piscine** (Shell00, Shell01, C00 à C13, examens par niveaux ; exercices du type `ft_putchar`, `ft_strlen`, `ft_atoi`…). Le dépôt `waltergcc/42-Piscine` sert de **référence pour la liste et l'ordre des exercices** (il ne contient que des solutions d'élèves, sans énoncés ni licence). Les énoncés, les explications et les tests de Forty sont **écrits par nous**, dans le style simple de Forty. On ne recopie ni les énoncés officiels, ni les solutions.

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
5. **Bouton « Je bloque ».** Des indices **écrits à l'avance** pour chaque mission, révélés un par un :
   - indice 1 : une piste ;
   - indice 2 : une piste plus précise ;
   - indice 3 : un exemple **similaire**, mais pas la solution.
   *(Choix du constructeur : il n'y a plus de prof IA, donc les indices font partie du contenu de la mission.)*

**Croquis de l'écran principal :**
```
┌───────────────────────────────────────────────────────────────────┐
│  ◉ Forty   [Cours] [Révisions] [Examens]   ⏱ 18:42  🛡 IA bloquée  ⚙︎ │
├──────────────────────┬────────────────────────────────────────────┤
│  📖 Mission          │  ex02.sh                                   │
│                      │  1  #!/bin/sh                              │
│  L'idée :            │  2  ls -l                                  │
│  « Un dossier,       │  3                                         │
│  c'est un tiroir… »  │                                            │
│                      │                                            │
│  ☐ Étape 1           ├────────────────────────────────────────────┤
│  ☐ Étape 2           │  $ terminal                                │
│  [🔊 Écouter]        │                                            │
│  [💡 Je bloque]      │                                            │
│  [✓ Vérifier]        │                                            │
└──────────────────────┴────────────────────────────────────────────┘
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

- **Choix de la police** pour le texte : Inter, Lexend, Atkinson Hyperlegible, OpenDyslexic. Pour le code : JetBrains Mono, Fira Code, Atkinson Hyperlegible Mono. Toutes ces polices sont libres.
- Réglages de **taille**, d'**espace entre les lettres** et d'**espace entre les lignes**.
- **Lecture à voix haute** des consignes et des indices (voix du Mac), avec le mot lu surligné.
- **Règle de lecture** : une bande qui surligne la ligne en cours, dans la consigne comme dans l'éditeur.
- **Glossaire** : survol d'un mot technique = définition simple.
- *Note : OpenDyslexic Mono n'existe pas en paquet npm. Atkinson Hyperlegible Mono la remplace pour l'instant ; OpenDyslexic Mono pourra être ajoutée plus tard, après accord pour télécharger la police depuis son site officiel.*
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

## 10. Anti-triche : pas d'IA, comme à la piscine

**Pendant les séances (cours et révisions)** :
- Forty bloque les **sites et services d'IA sur tout le Mac** : dans tous les navigateurs et dans le terminal. Exemples : ChatGPT, Claude, Gemini, Copilot, Perplexity, Mistral, DeepSeek, et leurs adresses d'API.
- Le **reste d'internet reste ouvert** (documentation, `man`, recherches classiques).
- La liste des sites bloqués est un fichier de contenu, facile à compléter.
- **Comment** *(choix du constructeur)* : Forty ajoute la liste au fichier système `/etc/hosts`, dans un bloc bien délimité, et vide le cache DNS. Cette opération demande **le mot de passe du Mac** (fenêtre officielle de macOS). Un petit assistant installé une seule fois peut éviter de redemander le mot de passe à chaque séance.
- Un badge **« 🛡 IA bloquée »** dans la barre du haut montre que la protection est active.
- On peut désactiver le blocage, mais seulement de façon volontaire, dans les Réglages, avec le mot de passe, **et jamais pendant un examen**.

**Pendant un examen** :
- **Internet est coupé complètement** (pare-feu de macOS, `pf`), sauf Forty lui-même. Seuls Forty, l'éditeur et le terminal restent utilisables.
- **Sécurité** : internet est **toujours rétabli** à la fin de l'examen, si on abandonne, si l'appli plante ou si le Mac redémarre (règle de pare-feu temporaire + nettoyage automatique au démarrage). Un bouton de secours « Rétablir internet » existe aussi dans les Réglages.
- Limite assumée : sur son propre Mac, un élève qui veut vraiment tricher peut défaire ces protections. Le but est de recréer les **conditions** de la piscine, pas une prison.

## 11. Examens

**Quand** :
- Des **examens intermédiaires** tous les **3 à 4 modules**. Le découpage exact dépend du cours : on regroupe les modules qui forment un bloc de connaissances (ex. Shell00 + Shell01 ; C00 à C03 ; C04 à C07…).
- Un **examen final** à la fin de chaque cours.
- Un examen se débloque quand tous les modules du bloc sont validés.

**Comment ça se passe** (comme les examens de la piscine) :
- **Chronométré** : 4 h par défaut pour un examen intermédiaire, plus pour un examen final *(durées réglables dans le contenu de chaque examen)*.
- **Écran examen** : plein écran, éditeur + terminal + consigne, **sans** explications, sans indices, sans glossaire. Internet coupé (section 10).
- **Exercices tirés au hasard par niveau** : on commence au niveau 0. On réussit l'exercice → on monte d'un niveau, avec un nouvel exercice tiré au hasard. On rate → on retente un autre exercice du même niveau. Chaque exercice est corrigé par la Moulinette, avec ses règles strictes.
- Chaque exercice est **lié aux modules** dont il vérifie les connaissances.

**Résultat** :
- Une **note sur 100**, calculée à partir du niveau atteint.
- **50 % ou plus** : l'examen est réussi et le bloc suivant se débloque.
- **Moins de 50 %** : Forty montre **les modules où il y a eu le plus d'erreurs** (grâce au lien exercice → module). Ces modules sont **à refaire** : leurs missions repassent en « à revoir » et leur Moulinette doit être revalidée. Ensuite, l'examen peut être **repassé**.
- Exemple : examen des 10 premiers modules, niveau atteint 4/10, soit 40 %. C'est raté : on refait les modules où les erreurs se concentrent, puis on repasse l'examen jusqu'à dépasser 50 %.
- **Historique** de tous les examens (date, note, niveau atteint, trace).

## 12. Révisions (ne pas oublier)

La **courbe de l'oubli d'Ebbinghaus** montre qu'on oublie vite ce qu'on n'a vu qu'une fois. Forty a donc un **deuxième onglet, « Révisions »**.
- **Des fiches** : chaque module crée automatiquement des petites fiches, une par notion (« Que fait `chmod 755` ? », « Écris `ft_putchar` »…).
- **Des mini-exercices très courts**, de 1 à 3 minutes : une question, une commande à taper, quelques lignes de code à compléter. Ils sont corrigés automatiquement, comme les missions.
- **Répétition espacée** *(choix du constructeur : algorithme de type SM-2 simplifié)* : une fiche réussie revient de plus en plus tard (1 jour, 3 jours, 1 semaine, 2 semaines, 1 mois…). Une fiche ratée revient le lendemain.
- **Chaque jour**, un petit paquet de fiches « à réviser aujourd'hui » (10 minutes maximum), rappelé par une notification douce.
- Si beaucoup de fiches d'un même module sont ratées, Forty propose de **revoir ce module**.

## 13. Réglages et première ouverture

- **Premier lancement** : bienvenue → choix du thème et de la police (avec aperçu en direct) → réglage des rappels → **activation du blocage des sites d'IA** (mot de passe du Mac) → début du Shell.
- Tous ces choix restent modifiables dans les Réglages.

## 14. Découpage en étapes

1. **Squelette** : appli Electron, éditeur, terminal, les 6 thèmes, le choix des polices.
2. **Moteur de cours** : lecture du contenu, écran de mission, progression, « Vérifier », indices, puis la **Moulinette** (rendu Git, note, trace).
3. **Cours Shell, modules 00 et 01**, avec explications ligne par ligne et glossaire.
4. **Anti-triche** : blocage des sites d'IA sur tout le Mac, coupure d'internet pour les examens.
5. **Examens** : écran examen, tirage par niveau, note, retour sur les modules ratés. Premier examen : le bloc Shell.
6. **Révisions** : fiches, mini-exercices, répétition espacée.
7. **Accessibilité et concentration** : voix, règle de lecture, minuteur, rappels, motivation.
8. **Cours C**, puis Git et Python, module par module, avec leurs examens.
9. *Plus tard* : multijoueur (à concevoir).

## 15. Choix laissés au constructeur

- L'organisation exacte des fichiers et les noms internes.
- Le format exact des fichiers de contenu, de tests, d'examens et de fiches.
- Les couleurs exactes des thèmes, à faire valider à l'écran.
- La rédaction des missions, des indices et des fiches, en suivant les règles des sections 5 et 7.
- La liste exacte des sites d'IA bloqués.
- Le découpage précis des blocs d'examen pour chaque cours.
- Le shell du terminal intégré : zsh, celui du Mac. Les scripts d'exercice sont testés avec `bash`.
