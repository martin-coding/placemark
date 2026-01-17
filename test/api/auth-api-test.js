import { assert } from "chai";
import { placemarkService } from "./placemark-service.js";
import { decodeToken } from "../../dist/api/jwt-utils.js";
import { john, johnCredentials, testUser, testUserCredentials } from "../fixtures.js";

suite("Authentication API tests", async () => {
  setup(async () => {
    placemarkService.clearAuth();
    await placemarkService.createUser(testUser);
    await placemarkService.authenticate(testUserCredentials);
    await placemarkService.deleteAllUsers();
  });

  test("authenticate", async () => {
    const returnedUser = await placemarkService.createUser(john);
    const response = await placemarkService.authenticate(johnCredentials);
    assert(response.success);
    assert.isDefined(response.token);
  });

  test("verify Token", async () => {
    const returnedUser = await placemarkService.createUser(john);
    const response = await placemarkService.authenticate(johnCredentials);

    const userInfo = decodeToken(response.token);
    assert.equal(userInfo.email, returnedUser.email);
    assert.equal(userInfo.userId, returnedUser._id);
  });

  test("check Unauthorized", async () => {
    placemarkService.clearAuth();
    try {
      await placemarkService.deleteAllUsers();
      assert.fail("Route not protected");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 401);
    }
  });
});
