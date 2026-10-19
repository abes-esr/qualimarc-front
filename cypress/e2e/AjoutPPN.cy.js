describe("Ajout de PPN et vidage de la liste", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/getAnalyses", { fixture: "analyses.json" }).as("getAnalyses");
    cy.visit("/");
    cy.wait("@getAnalyses");
  });

  function ajouteSaisie(texte) {
    cy.get('[data-cy="COMBOBOX_AJOUT_PPN"] input').click().type(`${texte}{enter}`);
  }

  function blocRecherche() {
    return cy.get('[data-cy="COMBOBOX_AJOUT_PPN"]').parents("section");
  }

  function verifiePpnValidesEtInvalides() {
    cy.get('[data-cy="COMBOBOX_AJOUT_PPN"] .v-chip__content').eq(0).should("contain", "123456789");
    cy.get('[data-cy="COMBOBOX_AJOUT_PPN"] .v-chip__content').eq(1).should("contain", "123456790");

    blocRecherche().find(".v-alert").should("be.visible");
    blocRecherche().find(".v-expansion-panel-title").click();
    blocRecherche().find(".v-expansion-panel-text .v-chip__content").should("contain", "45df753");
  }

  function videLaListe() {
    cy.get('[data-cy="del_all_ppn"]').click();
    cy.get('[data-cy="COMBOBOX_AJOUT_PPN"] .v-chip').should("not.exist");
    cy.get('[data-cy="COMBOBOX_AJOUT_PPN"] input').should("have.value", "");
    blocRecherche().find(".v-alert").should("not.exist");
  }

  it("Ajout de ppn un par un puis vidage de la liste", () => {
    ajouteSaisie("123456789");
    ajouteSaisie("123456790");
    ajouteSaisie("45df753");

    verifiePpnValidesEtInvalides();
    videLaListe();
  });

  it("Ajout d'une liste de ppn en une seule saisie", () => {
    ajouteSaisie("123456789,123456790 45df753");

    verifiePpnValidesEtInvalides();
    videLaListe();
  });

  it("Import d'un fichier de ppn", () => {
    cy.get('input[type=file]').selectFile("cypress/fixtures/ppnList.csv", { force: true, mimeType: "text/plain" });

    cy.get('[data-cy="COMBOBOX_AJOUT_PPN"] .v-chip').should("have.length", 10);
    cy.get('[data-cy="COMBOBOX_AJOUT_PPN"] .v-chip__content').eq(0).should("contain", "224395084");
    cy.get('[data-cy="COMBOBOX_AJOUT_PPN"] .v-chip__content').eq(9).should("contain", "114820414");
  });
});
