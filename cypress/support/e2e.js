// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

beforeEach(() => {
    cy.intercept('GET', '/api/v1/getFamillesDocuments', [
        { id: 'B', libelle: 'Audiovisuel' }
    ]).as('getFamillesDocuments');

    cy.intercept('GET', '/api/v1/getRuleSets', [
        { id: 1, libelle: 'Les Zones 200' }
    ]).as('getRuleSets');

    cy.intercept('GET', '/api/v1/getAnalyses', {
        analyses: [
            {
                "id":"QUICK",
                "libelle":"RAPIDE",
                "description":"... permet de détecter les erreurs les plus urgentes à corriger (règles essentielles)",
                "nbRules":151,
                "famillesDocument":null,
                "ruleSets":null
            },
            {
                "id":"COMPLETE",
                "libelle":"EXPERTE",
                "description":"... permet de détecter toutes les erreurs et incohérences à corriger (règles essentielles et avancées)",
                "nbRules":173,
                "famillesDocument":null,
                "ruleSets":null
            },
            {
                "id":"FOCUS",
                "libelle":"CIBLÉE",
                "description":"... permet de filtrer, par type de document et/ou par jeux de règles thématiques, un type d'erreur précis à corriger",
                "nbRules":null,
                "famillesDocument":[
                    {"id":"B","libelle":"Audiovisuel","nbRules":15},
                    {"id":"K","libelle":"Carte","nbRules":18},
                    {"id":"O","libelle":"Doc Elec","nbRules":22},
                    {"id":"N","libelle":"Enregistrement","nbRules":17},
                    {"id":"I","libelle":"Image","nbRules":16},
                    {"id":"F","libelle":"Manuscrit","nbRules":17},
                    {"id":"A","libelle":"Monographie","nbRules":20},
                    {"id":"Z","libelle":"Multimédia","nbRules":13},
                    {"id":"G","libelle":"Musique","nbRules":16},
                    {"id":"V","libelle":"Objet","nbRules":15},
                    {"id":"PC","libelle":"Partie composante","nbRules":18},
                    {"id":"M","libelle":"Partition","nbRules":16},
                    {"id":"BD","libelle":"Ressource continue","nbRules":10}
                ],
                "ruleSets":[
                    {"id":10,"libelle":"Test jeu de règle AFE","description":"ceci est un test","position":0,"nbRules":1},
                    {"id":1,"libelle":"Données codées (1XX)","description":"fait uniquement jouer les règles qui portent sur les zones 1XX","position":1,"nbRules":32},
                    {"id":4,"libelle":"Informations descriptives (2XX)","description":"fait uniquement jouer les règles qui portent sur les zones 2XX","position":2,"nbRules":13},
                    {"id":2,"libelle":"Indexation-matière (6XX)","description":"fait uniquement jouer les règles qui portent sur les zones 6XX","position":3,"nbRules":14},
                    {"id":7,"libelle":"Responsabilités (7XX)","description":"fait uniquement jouer les règles qui portent sur les zones 7XX","position":4,"nbRules":21},
                    {"id":3,"libelle":"Liens ($0/$3)","description":"fait uniquement jouer les règles qui concernent une absence ou erreur de liens ($0 ou $3) dans les zones 4XX, 5XX, 6XX et 7XX","position":5,"nbRules":12},
                    {"id":6,"libelle":"Dates","description":"fait uniquement jouer les règles qui concernent une absence ou erreur dans les dates","position":6,"nbRules":2},
                    {"id":5,"libelle":"Translittération ($6/$7)","description":"fait uniquement jouer les règles qui concernent une absence ou erreur dans les sous-zones dédiées à la translittération ($6 et $7)","position":7,"nbRules":63},
                    {"id":9,"libelle":"Identification (0XX)","description":"fait uniquement jouer les règles qui portent sur les zones 0XX","position":9,"nbRules":4}
                ]
            }
        ]
    }).as('getAnalyses');

    cy.intercept('GET', '/api/v1/getGeneratedId', '1').as('getGeneratedId');

    cy.visit('http://localhost:8080');
});

beforeEach(() => {
    // Réglage de la taille de la fenêtre
    cy.viewport(1400, 1000);
})
