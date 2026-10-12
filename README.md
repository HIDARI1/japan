# Japon 2026 — Programme Activités jour par jour

## Ouvrir le site

Le site lit son contenu dans le dossier `data/` : il doit être ouvert via une adresse `http://` (un double-clic sur `index.html` ne suffit pas).

- **Sur ordinateur** : dans ce dossier, lancer `python -m http.server 8000`, puis ouvrir <http://localhost:8000>.
- **Sur le téléphone** : publier le dossier sur un hébergement statique gratuit (GitHub Pages, Netlify Drop…), ouvrir l’adresse puis « Ajouter à l’écran d’accueil ». Après une première visite, le site fonctionne hors connexion (la carte aussi, pour les zones déjà affichées).

## Modifier le contenu

Tout le contenu est dans des fichiers JSON, modifiables avec n’importe quel éditeur de texte :

| Fichier | Contenu |
|---|---|
| `data/jours.json` | les 16 jours : titre, logement de la nuit (`nuit`), notes, activités (`heure`, `nom`, `categorie`, `ville`, `cout`, `notes`, `description`, `etape` = lieu sur la carte) |
| `data/trajets.json` | les étapes de trajet de chaque jour, avec leur position (`lat`, `lon`) |
| `data/hebergements.json` | les 5 logements |
| `data/voyage.json` | nom du voyage, date et heure de départ (compte à rebours), mention du pied de page |
| `data/checklist.json` | la checklist « à vérifier & réserver » (tirée des notes du programme) |
| `data/categories.json`, `data/villes.json` | libellés, emojis et couleurs |

On peut aussi tout modifier directement dans le site (boutons ✎, 🗑 et « + Ajouter ») : ces changements restent sur l’appareil. Pour les rendre permanents : **Outils → Données → Télécharger** les fichiers modifiés, puis les remplacer dans `data/`.

Aperçu du mode « Jour J » avant le départ : ajouter `?now=2026-12-24T12:30` à l’adresse (ex. `http://localhost:8000/?now=2026-12-24T12:30#/aujourdhui`).

## Dossiers

- `_old/` : copie intacte de l’ancien site (`programme-japon.html` + export `itineraire-japoni.json`, réimportable via Outils → Données).
- `_templates/` : les templates fournis, décompressés.

## Crédits

Animations adaptées de pens CodePen sous licence MIT (voir `_templates/*/LICENSE.txt`) : « Tidal — Surf Report » (vagues procédurales, compteurs, courbe), « Animated image slider » (slider des étapes), « Travel Features section » (carrousel des expériences), « Button State Builder » (états des boutons). Carte : Leaflet 1.9.4 et © contributeurs OpenStreetMap.
