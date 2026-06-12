# Land2Map · Programmation palette

Webapp responsive pour valider la programmation d'une palette Land2Map depuis le MCD : réseaux, sélections, icônes, blocs DWG, attributs et listes.

## Utilisation

Ouvrir `index.html` depuis GitHub Pages ou localement.

Actions de validation volontairement limitées :

- `Valider`
- `Corriger`
- `Exclure`

Le bouton `Modifier` ouvre le détail de l'objet : sélection, calque, icône, bloc DWG, commentaire, attributs et listes.

## Sauvegarde dans Git

La webapp ne contient aucun token en dur.

Pour sauvegarder les décisions dans le dépôt :

1. Cliquer sur `Git`.
2. Renseigner un token GitHub fine-grained avec droit `Contents: read/write` sur `Rominoushka/Land2Map`.
3. Cliquer sur `Sauvegarder dans Git`.

La sauvegarde écrit un commit dans :

`data/validation_state.json`

Le token reste uniquement dans le navigateur (`localStorage`).

## Fichiers

- `index.html` : interface.
- `styles.css` : ergonomie iPhone/iPad/desktop.
- `app.js` : logique applicative et sauvegarde GitHub.
- `data/palette_data.json` : référentiel initial issu de l'Excel V3/V4.
- `data/validation_state.json` : état de validation sauvegardé dans Git.
