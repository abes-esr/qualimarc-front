# Réécriture de la suite e2e Cypress pour Vuetify 3

Date : 2026-10-19
Branche : `test/e2e-vuetify3` (depuis `develop`)

## Contexte

La suite e2e (3 specs, 7 tests) n'avait pas été touchée depuis février 2023 : elle cible des sélecteurs Vuetify 2 qui n'existent plus depuis la migration de l'application vers Vuetify 3.10.5. Vérifié : les 7 tests échouent à l'identique sur `develop` (état de base), sans rapport avec les bumps dépendabot.

## Arbitrages

| Décision | Alternative écartée | Justification |
|---|---|---|
| Stub `cy.intercept` de `GET **/getAnalyses` + fixture `cypress/fixtures/analyses.json` | Démarrer l'API backend locale | Le bloc « Type d'analyse » ne rend pas les radios sans réponse API ; stubber isole le front, supprime la dépendance à un backend et rend la suite déterministe. |
| Sélecteurs natifs Vuetify 3 : `[data-cy="X"] input` (`be.checked`), `v-btn` réel (`be.disabled`), chips dans `.v-field__input`, panneaux `.v-expansion-panel-title/text` | data-cy sur des wrappers div | Le `aria-checked` sur div V2 n'existe plus ; V3 expose de vrais inputs radio/coche. |
| `selectFile` avec `mimeType: "text/plain"` | CSV sans type mime | La règle de validation du champ fichier exige `text/csv` ou `text/plain`. |
| Test du fichier : assertion sur les 10 chips ajoutés | Vérifier le texte affiché du champ fichier (`.v-file-input__text`, sélecteur V2) | V3 ne garde pas ce sélecteur ; les chips sont le signal fonctionnel réel. |
| Zéro modification du code applicatif | Ajouter des attributs de test dans les composants | Portée minimale : la PR reste une PR de test pure. |
| URL dans `cypress.config.js` : `baseUrl: "http://localhost:8080"`, `env.url` supprimé | Conserver `env.url` + `cy.visit(env.url)` | `baseUrl` est le mécanisme standard Cypress ; l'ancien `env.url` n'était plus utilisé. |

## Scénarios conservés (identiques à l'existant)

1. `AjoutPPN.cy.js` — ajout PPN par PPN, ajout d'une liste en une saisie (`123456789,123456790 45df753` → 2 valides + 1 invalide dans l'alerte), import d'un fichier (fixture `ppnList.csv`, 10 PPNs), vidage via `del_all_ppn`.
2. `AnalyseType.cy.js` — sélection des 3 types d'analyse (QUICK, COMPLETE, FOCUS).
3. `BoutonDisable.cy.js` — bouton « Lancer l'analyse » désactivé sans PPN, activé dès qu'un PPN valide est saisi, quel que soit le type d'analyse.

## Vérification prévue

`npx vite preview --port 8080 --strictPort` (dist develop) puis `npx cypress run` → cible 7/7 vert.
