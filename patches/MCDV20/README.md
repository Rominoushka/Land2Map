# Land2Map MCDV20 - paquet de patch

Paquet généré : `Land2Map_MCDV20_objets_exports_patch.zip`

Contenu attendu :

- `objets_land2map_v20.csv` : 337 objets cible, réseau par réseau.
- `attributs_land2map_v20.csv` : 6 955 attributs avec visible, forcé, valeur forcée, obligatoire et exportable.
- `listes_land2map_v20.csv` : listes métier de base.
- `PA_Objet_patch_MCDV20.csv` : patch théorique pour `PA_Objet`.
- `PA_PaletteItem_patch_MCDV20.csv` : patch théorique pour `PA_PaletteItem`.
- `patch_sql_theorique_mcdv20.sql` : tables intermédiaires SQL pour inspection / reprise.
- `inventaire_theme_reel.csv` : inventaire du thème réel.
- `modele_mcdv20.json` : modèle complet sérialisé.

Règles MCD principales :

- Préfixes attributaires limités à 10 caractères : `trc_`, `che_`, `fou_`, `brt_`, `ouv_`, `afl_`, `eqp_`, `sup_`.
- `calque` forcé et non visible.
- `*_type` forcé et non visible.
- `*_classe` forcé et non visible pour les variantes Classe A/B/C.
- `*_etat` forcé et non visible pour les variantes Abandonné.
- `*_pose` forcé et non visible pour les variantes Aérien.
- Variante `Aérien` uniquement pour : `ECL`, `BTA`, `HTA`, `HTB`, `TEL`, `CFA`, `SGN`.

Note : le ZIP binaire complet est généré côté assistant. S’il n’est pas visible dans ce dossier, déposer le fichier `Land2Map_MCDV20_objets_exports_patch.zip` à côté de ce README.