describe("Location privacy", () => {
  let userA;
  let userB;
  let tokenA;
  let privateLocationId;

  const password = "pass1234";

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
          token: authRes.body.token,
          id: res.body._id,
        })));
  }

  it("User B cannot see User A private location", () => {
    // --- Create User A ---
    createUser().then((u) => {
      userA = u;
      tokenA = u.token;

      // --- User A creates private location ---
      return cy.request({
        method: "POST",
        url: "/api/locations",
        headers: {
          Authorization: `Bearer ${tokenA}`,
        },
        body: {
          title: "Secret Beach",
          category: "beach",
          latitude: 10,
          longitude: 10,
          description: "Top secret",
          visibility: "private",
        },
      });
    }).then((res) => {
      expect(res.status).to.eq(201);
      privateLocationId = res.body._id;

      // --- Create User B ---
      return createUser();
    }).then((u) => {
      userB = u;

      // --- Login as User B (session cookie) ---
      cy.request("POST", "/authenticate", {
        email: userB.email,
        password,
      });

      // --- Try to visit private location ---
      cy.visit(`/location/${privateLocationId}`, { failOnStatusCode: false });
      cy.contains("Page not found");
    });
  });
});
