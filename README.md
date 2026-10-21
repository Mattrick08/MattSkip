# YouTube Ad Skipper

Extension navigateur (et userscript) qui passe les pubs YouTube par **accélération** plutôt que par blocage réseau :

1. détecte la pub (classe `ad-showing` du lecteur) ;
2. coupe le son et passe `playbackRate` à 16 ;
3. saute à la fin de la vidéo publicitaire et clique sur « Passer » si le bouton existe ;
4. restaure le son et la vitesse d'origine à la fin de la pub ;
5. ferme les bandeaux publicitaires en overlay.

## Installation (extension)

### Chrome / Edge / Brave
1. Télécharger ou cloner ce dépôt.
2. Ouvrir `chrome://extensions` (ou `edge://extensions`).
3. Activer le **Mode développeur**.
4. **Charger l'extension non empaquetée** → sélectionner le dossier du projet.

### Firefox
1. Ouvrir `about:debugging#/runtime/this-firefox`.
2. **Charger un module complémentaire temporaire…** → sélectionner `manifest.json`.
   (Temporaire : à refaire à chaque redémarrage de Firefox, sauf signature de l'extension.)

## Installation (userscript)

Installer Tampermonkey ou Violentmonkey, puis ouvrir `youtube-ad-skipper.user.js` et confirmer l'installation.

## Structure

| Fichier | Rôle |
|---|---|
| `manifest.json` | Manifeste de l'extension (Manifest V3) |
| `content.js` | Logique de détection et de skip |
| `youtube-ad-skipper.user.js` | Même logique, version userscript |

## Limites

- YouTube change régulièrement ses classes CSS : si le bouton « Passer » n'est plus cliqué, ajuster `SKIP_SELECTORS` dans `content.js`.
- Utiliser un contournement de pubs peut aller à l'encontre des conditions d'utilisation de YouTube. Usage personnel, à vos risques.

## Licence

MIT
