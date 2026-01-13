import { assert } from "chai";
import { afterEach } from "mocha";
import { assertSubset } from "../test-utils.js";
import { placemarkService } from "./placemark-service.js";
import { john, johnCredentials, testUser, testUserCredentials, testUsers } from "../fixtures.js";

const users = new Array(testUsers.length);

suite("User API tests", () => {
  setup(async () => {
    placemarkService.clearAuth();
    await placemarkService.createUser(testUser);
    await placemarkService.authenticate(testUserCredentials);
    await placemarkService.deleteAllUsers();
    for (let i = 0; i < testUsers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      users[0] = await placemarkService.createUser(testUsers[i]);
    }
    await placemarkService.createUser(testUser);
    await placemarkService.authenticate(testUserCredentials);
  });
  teardown(async () => {});

  afterEach(async () => {
    await placemarkService.deleteAllUsers();
  });

  test("create a user", async () => {
    const newUser = await placemarkService.createUser(john);

    const { password, ...johnWithoutPassword } = john;

    assertSubset(johnWithoutPassword, newUser);
    assert.isUndefined(newUser.password);
    assert.isDefined(newUser._id);
  });

  test("delete a user", async () => {
    const user = await placemarkService.createUser(john);
    const response = await placemarkService.deleteUser(user._id);
    assert.equal(response.status, 204);
    try {
      const returnedUser = await placemarkService.getUser(user.id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message.startsWith("No user with this id"), "Incorrect Response Message");
    }
  });

  test("delete all users", async () => {
    let returnedUsers = await placemarkService.getAllUsers();
    assert.equal(returnedUsers.length, testUsers.length + 1);
    await placemarkService.deleteAllUsers();
    await placemarkService.createUser(john);
    await placemarkService.authenticate(johnCredentials);
    returnedUsers = await placemarkService.getAllUsers();
    assert.equal(returnedUsers.length, 1);
  });

  test("get a user - success", async () => {
    const returnedUser = await placemarkService.getUser(users[0]._id);
    assert.deepEqual(users[0], returnedUser);
  });

  test("get a user - bad id", async () => {
    try {
      const returnedUser = await placemarkService.getUser("1234");
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No user with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("get a user - deleted user", async () => {
    await placemarkService.deleteAllUsers();
    await placemarkService.createUser(john);
    await placemarkService.authenticate(johnCredentials);
    try {
      const returnedUser = await placemarkService.getUser(users[0]._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No user with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });
});
