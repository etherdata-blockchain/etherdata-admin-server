import * as cypress from "cypress";

describe("Test navigation", () => {
  it("Can navigate to pages by side menus", () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit(Cypress.env("url"));
    cy.get(":nth-child(1) > .MuiInput-root > .MuiInput-input").clear();
    cy.get(":nth-child(1) > .MuiInput-root > .MuiInput-input").type(
      Cypress.env("username")
    );
    cy.get(":nth-child(2) > .MuiInput-root > .MuiInput-input").clear();
    cy.get(":nth-child(2) > .MuiInput-root > .MuiInput-input").clear();
    cy.get(":nth-child(2) > .MuiInput-root > .MuiInput-input").type(
      `${Cypress.env("password")}{enter}`
    );
    cy.get("#login").click();
    cy.get("[data-testid=PersonIcon] > path").click();
    cy.get("[data-testid=ReceiptIcon]").click({ force: true });
    cy.get("[data-testid=PieChartIcon] > path").click({ force: true });
    cy.get("[data-testid=PersonIcon] > path").click({ force: true });
    cy.get(
      '[data-id="default"] > .MuiDataGrid-cell--withRenderer > .MuiButton-root'
    ).click({ force: true });
    cy.get("button").contains("Details").first().click();
    // Wait for data base loading finished
    cy.wait(10000);
    cy.get("h6")
      .contains("Transactions", { timeout: 10000 })
      .should("be.visible");
    cy.scrollTo(0, 1000);
    cy.get(".MuiDataGrid-virtualScroller").scrollTo(1000, 0);
    cy.get("button").contains("Details").first().click();

    // Edit page
    cy.wait(3000);
    cy.get(".MuiButton-outlined").click();
    cy.get("#vertical-tab-1").click({ force: true });
    cy.get("#vertical-tab-2").click({ force: true });
    cy.get("#vertical-tab-3").click({ force: true });
    cy.get("#vertical-tab-4").click({ force: true });
    cy.get("#vertical-tab-5").click({ force: true });
    cy.get("#vertical-tab-6").click({ force: true });
    cy.get("#vertical-tab-7").click({ force: true });
    cy.get("#vertical-tab-8").click({ force: true });
    cy.get("#vertical-tab-9").click({ force: true });
    cy.get("#vertical-tab-10").click({ force: true });
    cy.get("#vertical-tab-11").click({ force: true });
    cy.get("[data-testid=PersonIcon]").click({ force: true });
    cy.get(
      '[data-id="default"] > .MuiDataGrid-cell--withRenderer > .MuiButton-root'
    ).click({ force: true });
    /* ==== End Cypress Studio ==== */
  });
});
