describe("Location Reviews", () => {
  const password = "pass1234";

  let userA;
  let userB;
  let locationId;

  function createUser() {
    const email = `test_${Date.now()}_${Math.random()}@example.com`;

    return cy.request("POST", "/api/users", {
      email,
      password,
      firstName: "Test",
      lastName: "User",
    }).then((res) => cy.request("POST", "/api/users/authenticate", {
        email,
        password,
      }).then((authRes) => ({
          email,
          password,
          id: res.body._id,
          token: authRes.body.token,
        })));
  }

  function loginSession(user) {
    cy.request("POST", "/authenticate", {
      email: user.email,
      password: user.password,
    });
  }

  before(() => {
    createUser().then((u) => {
      userA = u;

      return cy.request({
        method: "POST",
        url: "/api/locations",
        headers: {
          Authorization: `Bearer ${userA.token}`,
        },
        body: {
          title: "Review Test Location",
          category: "beach",
          latitude: 10,
          longitude: 10,
          description: "Review test",
          visibility: "public",
        },
      });
    }).then((res) => {
      locationId = res.body._id;

      return createUser();
    }).then((u) => {
      userB = u;
    });
  });

  it("User B can create and edit review; others can see it", () => {
    // User B: create review
    loginSession(userB);

    cy.visit(`/location/${locationId}`);

    cy.contains("Add a Review");

    cy.get("select[name=\"rating\"]").select("4");
    cy.get("textarea[name=comment]").type("It was pretty good");
    cy.get("[data-cy=\"review\"]").click();

    cy.contains("Your Review");
    cy.contains("It was pretty good");

    // User B: edit own review
    cy.get("select[name=\"rating\"]").select("5");
    cy.get("textarea[name=comment]").clear().type("It was amazing!");
    cy.get("[data-cy=\"update-review\"]").click();

    cy.contains("It was amazing!");

    // User A: can see review of public location
    loginSession(userA);

    cy.visit(`/location/${locationId}`);

    cy.contains("It was amazing!");
  });
});
