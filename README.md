# Equipe5 - Shoot Them Up Multi-Joueur

## Description

Ce projet est un jeu en ligne multi-joueur de type "shoot them up" réalisé dans le cadre de la SAÉ. Le jeu permet à 1 à 4 joueurs de contrôler un avatar sur un plateau 2D, d'éviter des ennemis qui se déplacent en vagues sinusoïdales, de collecter des bonus variés et de tirer sur les ennemis pour marquer des points. Le jeu supporte le multi-joueur en temps réel via Socket.io, avec des parties solo ou coopératives. Les scores sont sauvegardés dans un fichier JSON et un classement des 10 meilleurs scores est maintenu.

## Fonctionnalités

- **Page d'accueil / Formulaire de connexion** : Choix du pseudo, sélection d'un avatar parmi 4 options, rejoindre une partie existante ou en démarrer une nouvelle, sélection de la difficulté (entrainement, escarmouche, assaut, bredhell).

- **Jeu** :
  - Déplacement de l'avatar avec la souris (direction basée sur la position du curseur, vitesse proportionnelle à la distance) ou le clavier (ZQSD ou flèches, avec inertie et accélération).
  - Ennemis qui apparaissent périodiquement, se déplacent en vagues sinusoïdales, et tirent des projectiles. Leur vitesse, fréquence d'apparition et de tir évoluent selon la difficulté.
  - Bonus qui apparaissent aléatoirement après la destruction d'ennemis (10% de chance) : soin (1-5 PV), invincibilité temporaire, changement de taille (agrandissement ou réduction), puissance de tir améliorée (tirs traversent les projectiles ennemis), gain/perte d'XP, bonus ultime "BredHellisNothing" (tous les effets positifs).
  - Collisions : avec ennemis (perte de 1 PV pour le joueur, destruction de l'ennemi), projectiles ennemis (perte de 1 PV si pas invincible), bonus (application de l'effet), autres joueurs (pas de collision).
  - Tirs : appui sur espace pour tirer, cooldown de 0.2s, positionnement relatif au joueur.
  - Système de vies : 3 vies de base, maximum 15, jeu terminé si toutes les vies perdues.
  - Pause : accessible via bouton ou touche P, permet d'accéder aux paramètres ou quitter.
  - Score : calculé en fonction des ennemis tués, multiplicateur selon difficulté, bonus XP.

- **Écran "Rejouer"** : Affichage du pseudo, score final, ennemis abattus, difficulté, temps de survie, bouton pour rejouer (reset de la partie).

- **Tableau des meilleurs scores** : Top 10 des scores avec pseudo, nombre d'ennemis, difficulté, temps, score, trié par score décroissant.

- **Liste des parties** : Affichage des parties disponibles (roomId, nombre de joueurs/4), possibilité de rejoindre.

- **Crédits** : Présentation de l'équipe avec prénom, nom, groupe, surnom, jeu vidéo préféré et pourcentage de contribution.

- **Pause et Paramètres** : Accès aux paramètres en jeu, retour au jeu.

## Stack Technique

- **Frontend** : HTML5 Canvas pour le rendu graphique (joueurs, ennemis, tirs, bonus), TypeScript pour la logique client, Vite pour le build et le développement.
- **Backend** : Node.js avec Socket.io pour la communication en temps réel (événements : createGame, joinGame, input, shoot, mouseInput, requestPause, getLeaderboard, resetGame, leaveGame, disconnect).
- **Tests** : Tests unitaires avec Node.js test runner (Jest-like), couvrant les classes serveur (Player, Ennemy, GameController, etc.).
- **Outils** : Prettier pour le formatage, TypeScript pour le typage, fs pour la sauvegarde des scores en JSON.
- **Configuration** : Port serveur 8080, tick rate 120 FPS, canvas 1250x850.

## Installation et Lancement

1. Cloner le repository.
2. Installer les dépendances : `npm install`.
3. Lancer le serveur en développement : `npm run dev` (Vite lance sur port 8000 avec proxy vers 8080).
4. Ouvrir `index.html` dans un navigateur pour accéder au jeu.
5. Pour les tests : `npm test`.

## Diagrammes de Séquence

Voici des diagrammes de séquence simplifiés pour les échanges principaux entre client et serveur via WebSocket (Socket.io).

### Connexion et création de partie solo

```text
Client -> Serveur: createGame (pseudo, difficulty, imgsrc)
Serveur -> Client: confirmation (roomId, gameState)
Serveur -> Client: gameState (état initial : joueurs, ennemis, etc.)
```
![diagramme connection et création partie solo](/public/diagrammes/Connexion_et_création_de_partie_solo.png)

### Rejoindre une partie

```text
Client -> Serveur: listGames
Serveur -> Client: availableGames (liste des rooms)
Client -> Serveur: joinGame (roomId, pseudo, idImg)
Serveur -> Client: success/error
Serveur -> Tous les clients de la room: playerJoined (nouveau joueur)
```
![diagramme rejoindre une partie](/public/diagrammes/Rejoindre_une_partie.png)

### Déplacement avec clavier

```text
Client -> Serveur: input (direction {x, y})
Serveur -> Tous les clients: gameState (mise à jour position joueur)
```
![diagramme déplacement avec clavier](/public/diagrammes/Déplacement_avec_clavier.png)

### Déplacement avec souris

```text
Client -> Serveur: mouseInput (position {x, y})
Serveur -> Client: (calcul direction côté serveur)
Serveur -> Tous les clients: gameState (mise à jour position joueur)
```
![diagramme déplacement avec souris](/public/diagrammes/Déplacement_avec_souris.png)

### Tir

```text
Client -> Serveur: shoot
Serveur -> (logique tir côté serveur)
Serveur -> Tous les clients: gameState (nouveau tir joueur)
```
![diagramme tir](/public/diagrammes/Tirs.png)

### Collecte de bonus

```text
Serveur -> (détection collision côté serveur)
Serveur -> Client: (application effet bonus côté serveur)
Serveur -> Tous les clients: gameState (bonus disparu)
```
![diagramme collecte de bonus](/public/diagrammes/Collecte_des_bonus.png)

### Pause

```text
Client -> Serveur: requestPause
Serveur -> Tous les clients: gameState (isPause toggled)
```
![diagramme mise en pause](/public/diagrammes/Pause.png)

### Fin de partie et sauvegarde score

```text
Serveur -> (détection game over côté serveur)
Serveur -> Tous les clients: gameState (isPause true)
Serveur -> (sauvegarde scores dans JSON)
```
![diagramme fin de partie et sauvegarde des scores](/public/diagrammes/Fin_de_partie_et_sauvegarde_score.png)

## Difficultés Techniques et Solutions

- **Gestion des collisions en temps réel multi-joueur** : Avec plusieurs entités mobiles et joueurs simultanés, les calculs de collision pouvaient être coûteux et désynchronisés. Solution : Centralisation de toute la logique de collision côté serveur (dans GameController.update), envoi périodique de l'état complet via gameState à 120 FPS, interpolation côté client pour fluidité.

- **Synchronisation des états joueurs/ennemis** : Les positions et effets (bonus) devaient être cohérents entre clients. Solution : Serveur comme source de vérité, envoi d'états sérialisés (GameState) via Socket.io, gestion des événements asynchrones avec callbacks.

- **Contrôles hybrides souris/clavier avec physique** : Gestion de l'inertie, accélération, deadzone pour souris, limites de canvas. Solution : Logique de physique dans Player.update (accélération, friction, clamping vitesse), distinction souris/clavier côté serveur avec setMousePosition/setDirection.

- **Rendu Canvas performant** : Affichage de nombreuses entités (joueurs, ennemis, tirs, bonus) sans lag. Solution : Boucle de rendu requestAnimationFrame côté client, nettoyage du canvas à chaque frame, utilisation d'images préchargées (sprites).

- **Sauvegarde et gestion des scores** : Persister les scores dans un JSON, top 10 trié. Solution : Classe ManagerScore avec fs.writeFileSync/readFileSync, ajout avec tri et slice.

- **Gestion des connexions multi-joueur** : Rejoindre/quitter parties, nettoyage des rooms vides. Solution : Map des games côté serveur, événements leaveGame/disconnect pour nettoyage, émission playerLeft aux autres joueurs.

- **Tests unitaires** : Couverture des classes serveur sans dépendances externes. Solution : Utilisation de Node.js test runner, mocks pour fs et autres, tests sur logique Player, Ennemy, GameController.

- **Architecture client-serveur** : Séparation logique, événements Socket.io. Solution : Serveur en TypeScript avec http.createServer + io, client avec io-client, types partagés dans common/.

## Points d'Amélioration et Achèvement

- **Achèvement** : Toutes les fonctionnalités de base sont implémentées : multi-joueur, difficultés, bonus, scores, vues. Le jeu est jouable de A à Z.

- **Améliorations** :
  - Ajout d'effets sonores (Web Audio API) pour tirs, collisions, bonus.
  - Support mobile avec gyroscope (DeviceOrientationEvent) pour contrôles.
  - Système de niveaux progressifs avec vagues d'ennemis croissantes.
  - Amélioration de l'IA des ennemis (patterns plus variés, boss).
  - Optimisation pour plus de 4 joueurs ou maps plus grandes.
  - Interface plus polie avec animations CSS (transitions entre vues).
  - Chat en jeu pour communication multi-joueur.
  - Statistiques détaillées (précision tirs, bonus collectés).

## Ce dont nous sommes le plus fier

Nous sommes particulièrement fiers de l'architecture client-serveur robuste permettant un multi-joueur fluide jusqu'à 4 joueurs, avec synchronisation précise des états via Socket.io et logique centralisée côté serveur. Le système de bonus variés et équilibrés (avec probabilités et effets temporisés) ajoute de la profondeur stratégique, et les contrôles hybrides souris/clavier offrent une expérience intuitive et responsive grâce à la physique d'inertie. Les tests unitaires couvrent 100% des classes critiques, assurant une base solide. Enfin, le design original des avatars et bonus, inspiré du thème "Victor", reflète notre créativité sans recours à l'IA générative.

## Équipe

Alex Marescaux
Matthieu Calesse
Lucas Couraudon
Mathieu Poumaere

## Licence

Ce projet est réalisé dans un cadre éducatif.
