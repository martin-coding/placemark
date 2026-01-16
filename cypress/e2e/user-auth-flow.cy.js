describe("User authentication flow", () => {
  let user;

  beforeEach(() => {
    cy.fixture("user").then((u) => {
      user = {
        ...u,
        email: `test_${Date.now()}@example.com`,
      };
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
    cy.get("input[name=passwordConfirm]").type(user.passwordConfirm);
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

  it("fails signup - email in use", () => {
    cy.request("POST", "/register", user);

    cy.visit("/signup");

    cy.get("input[name=firstName]").type(user.firstName);
    cy.get("input[name=lastName]").type(user.lastName);
    cy.get("input[name=email]").type(user.email);
    cy.get("input[name=password]").type(user.password);
    cy.get("input[name=passwordConfirm]").type(user.passwordConfirm);
    cy.get("form").submit();

    cy.contains("li", "Email is already in use.").should("be.visible");
  });

  it("fails signup - password too short", () => {
    const password = "short";
    cy.visit("/signup");

    cy.get("input[name=firstName]").type(user.firstName);
    cy.get("input[name=lastName]").type(user.lastName);
    cy.get("input[name=email]").type(user.email);
    cy.get("input[name=password]").type(password);
    cy.get("input[name=passwordConfirm]").type(password);
    cy.get("form").submit();

    cy.contains("li", "\"password\" length must be at least 8 characters long").should("be.visible");
  });

  it("fails signup - password missmatch", () => {
    const password = "incorrect";
    cy.visit("/signup");

    cy.get("input[name=firstName]").type(user.firstName);
    cy.get("input[name=lastName]").type(user.lastName);
    cy.get("input[name=email]").type(user.email);
    cy.get("input[name=password]").type(user.password);
    cy.get("input[name=passwordConfirm]").type(password);
    cy.get("form").submit();

    cy.contains("li", "Passwords do not match").should("be.visible");
  });
});
