describe("User authentication flow", () => {
  let user;

  beforeEach(() => {
    cy.task("db:reset");
    cy.fixture("user").then((u) => {
      user = u;
    });
  });

  it("allows a user to sign up", () => {
    cy.visit("/");
    cy.get("#signup").click();
    cy.url().should("include", "/signup");
    cy.get("#signup").should("have.class", "is-primary");

    cy.get("input[name=firstName]").type(user.firstName);
    cy.get("input[name=lastName]").type(user.lastName);
    cy.get("input[name=email]").type(user.email);
    cy.get("input[name=password]").type(user.password);
    cy.get("form").submit();

    cy.location("pathname").should("eq", "/");
  });

  it("allows a user to log in", () => {
    cy.request("POST", "/register", user);

    cy.visit("/");
    cy.get("#login").click();
    cy.url().should("include", "/login");
    cy.get("#login").should("have.class", "is-primary");

    cy.get("input[name=email]").type(user.email);
    cy.get("input[name=password]").type(user.password);
    cy.get("form").submit();

    cy.url().should("include", "/dashboard");
    cy.get("#dashboard").should("have.class", "is-primary");
    cy.getCookie("placemark").should("exist");
  });

  it("allows a user to log out", () => {
    cy.request("POST", "/register", user);
    cy.request("POST", "/authenticate", {
      email: user.email,
      password: user.password,
    });

    cy.visit("/dashboard");
    cy.getCookie("placemark").should("exist");

    cy.get("#logout").click();
    cy.getCookie("placemark").should("not.exist");
    cy.location("pathname").should("eq", "/");
  });
});
