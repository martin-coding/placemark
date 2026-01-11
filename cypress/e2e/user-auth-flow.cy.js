describe("User authentication flow", () => {
  it("allows a user to sign up and log in", () => {
    cy.visit("/");

    cy.get("#signup").click();
    cy.url().should("include", "/signup");
    cy.get("#signup").should("have.class", "is-primary");

    cy.fixture("user").then((user) => {
      cy.get("input[name=firstName]").type(user.firstName);
      cy.get("input[name=lastName]").type(user.lastName);
      cy.get("input[name=email]").type(user.email);
      cy.get("input[name=password]").type(user.password);
      cy.get("form").submit();
    });

    cy.get("#login").click();
    cy.url().should("include", "/login");
    cy.get("#login").should("have.class", "is-primary");

    cy.fixture("user").then((user) => {
      cy.get("input[name=email]").type(user.email);
      cy.get("input[name=password]").type(user.password);
      cy.get("form").submit();
    });

    cy.url().should("include", "/dashboard");
    cy.get("#dashboard").should("have.class", "is-primary");
    cy.getCookie("placemark").should("exist");

    cy.get("#logout").click();
    cy.getCookie("placemark").should("be.null");
  });
});
