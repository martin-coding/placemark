describe("Location CRUD", () => {
  let user;
  let location;
  let authToken;
  let userId;

  before(() => {
    cy.fixture("user")
      .then((u) => {
        user = { ...u, email: `test_${Date.now()}@example.com` };

        return cy.request("POST", "/api/users", {
          email: user.email,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
        });
      })
      .then((response) => {
        expect(response.status).to.eq(201);
        userId = response.body._id;
        return cy.request("POST", "/api/users/authenticate", {
          email: user.email,
          password: user.password,
        });
      })
      .then((response) => {
        expect(response.status).to.eq(201);
        authToken = response.body.token;
      });

    cy.fixture("location").then((l) => {
      location = l;
    });
  });

  beforeEach(() => {
    cy.session(user.email, () => {
      cy.request("POST", "/authenticate", {
        email: user.email,
        password: user.password,
      }).then(() => {
        cy.getCookie("placemark").should("exist");
      });
    });
  });

  it("creates a location", () => {
    cy.visit("/dashboard/new");

    cy.get("input[name=title]").type(location.title);
    cy.get("select[name=\"category\"]").select(location.category);
    cy.get("input[name=\"latitude\"]").type(location.latitude);
    cy.get("input[name=\"longitude\"]").type(location.longitude);
    cy.get("textarea[name=description]").type(location.description);
    cy.get("input[name=\"visibility\"]").check(location.visibility);
    cy.get("form").submit();
  });

  it("reads, updates and deletes a location", () => {
    location.userid = userId;
    cy.request({
      method: "POST",
      url: "/api/locations",
      body: location,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(201);
      const locationId = res.body._id;
      cy.log("Created location ID:", locationId);

      // Read
      cy.visit(`/location/${locationId}`);

      cy.contains("h1", location.title);
      cy.get("p.subtitle").should("contain.text", location.category).and("contain.text", location.visibility);
      cy.contains(location.latitude);
      cy.contains(location.longitude);
      cy.contains(location.description);

      // Update
      cy.get("[data-cy=\"edit-location\"]").click();
      cy.url().then((url) => {
        const params = new URL(url).searchParams;
        const edit = params.get("edit");
        expect(edit).to.eq("true");
      });

      cy.get("input[name=title]").clear().type("Black sand");
      cy.get("select[name=\"category\"]").select("beach");
      cy.get("select[name=\"visibility\"]").select("private");
      cy.get("input[name=\"latitude\"]").clear().type(64);
      cy.get("input[name=\"longitude\"]").clear().type(-19);
      cy.get("textarea[name=description]").clear().type("I was there");
      cy.get("#edit-location-form").submit();

      cy.contains("h1", "Black sand");
      cy.get("p.subtitle").should("contain.text", "beach").and("contain.text", "private");
      cy.contains(64);
      cy.contains(-19);
      cy.contains("I was there");

      // Delete
      cy.get("[data-cy=\"delete-location\"]").click();
      cy.url().should("include", "/dashboard");
      cy.visit(`/location/${locationId}`, { failOnStatusCode: false });
      cy.contains("Page not found");
    });
  });
});
