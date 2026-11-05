describe("Activation du bouton de lancement", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/getAnalyses", { fixture: "analyses.json" }).as("getAnalyses");
    cy.visit("/");
    cy.wait("@getAnalyses");
  });

  it("N'active le bouton que si un type d'analyse et au moins un PPN sont renseignés", () => {
    cy.get('[data-cy="FOCUS"] input').check({ force: true });
    cy.get('[data-cy="btn_lance_analyse"]').should("be.disabled");

    cy.get('[data-cy="B"] input').check({ force: true });
    cy.get('[data-cy="B"] input').should("be.checked");
    cy.get('[data-cy="btn_lance_analyse"]').should("be.disabled");

    cy.get('[data-cy="COMBOBOX_AJOUT_PPN"] input').click().type("123456789{enter}");
    cy.get('[data-cy="btn_lance_analyse"]').should("be.enabled");

    cy.get('[data-cy="QUICK"] input').check({ force: true });
    cy.get('[data-cy="btn_lance_analyse"]').should("be.enabled");

    cy.get('[data-cy="COMPLETE"] input').check({ force: true });
    cy.get('[data-cy="btn_lance_analyse"]').should("be.enabled");
  });
});
