describe("Location CRUD", () => {
  let user;
  let location;
  let authToken;
  let userId;

  before(() => {
    cy.fixture("location").then((l) => {
      location = l;
    });
    cy.fixture("user").then((u) => {
      user = {
        ...u,
        email: `test_${Date.now()}@example.com`,
      };
      cy.request("POST", "/api/users", {
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
      }).then((response) => {
        expect(response.status).to.eq(201);
        userId = response.body._id;
      });
      cy.request("POST", "/api/users/authenticate", {
        email: user.email,
        password: user.password,
      }).then((response) => {
        expect(response.status).to.eq(201);
        authToken = response.body.token;
      });
    });
  });

  beforeEach(() => {
    cy.session(user.email, () => {
      cy.request("POST", "/authenticate", {
        email: user.email,
        password: user.password,
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

  it("reads a location", () => {
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

      // Update
      cy.get("[data-cy=\"edit-location\"]").click();

      // Delete
      cy.get("[data-cy=\"delete-location\"]").click();
    });
  });
});
