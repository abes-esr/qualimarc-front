describe("Sélection du type d'analyse", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/getAnalyses", { fixture: "analyses.json" }).as("getAnalyses");
    cy.visit("/");
    cy.wait("@getAnalyses");
  });

  ["QUICK", "COMPLETE", "FOCUS"].forEach((id) => {
    it(`Sélection de l'analyse ${id}`, () => {
      cy.get(`[data-cy="${id}"] input`).check({ force: true });
      cy.get(`[data-cy="${id}"] input`).should("be.checked");
    });
  });
});
