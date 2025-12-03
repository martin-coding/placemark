import { assert } from "chai";
import { placemarkService } from "./placemark-service.js";
import { assertSubset } from "../test-utils.js";
import { john, testUsers } from "../fixtures.js";

suite("User API tests", () => {
  setup(async () => {
    await placemarkService.deleteAllUsers();
    for (let i = 0; i < testUsers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      testUsers[i] = await placemarkService.createUser(testUsers[i]);
    }
  });
  teardown(async () => {});

  test("create a user", async () => {
    const newUser = await placemarkService.createUser(john);
    assertSubset(john, newUser);
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
      assert(error.response.data.message.startsWith("No User with this id"), "Incorrect Response Message");
    }
  });

  test("delete all users", async () => {
    let returnedUsers = await placemarkService.getAllUsers();
    assert.equal(returnedUsers.length, 3);
    await placemarkService.deleteAllUsers();
    returnedUsers = await placemarkService.getAllUsers();
    assert.equal(returnedUsers.length, 0);
  });

  test("get a user - success", async () => {
    const returnedUser = await placemarkService.getUser(testUsers[0]._id);
    assert.deepEqual(testUsers[0], returnedUser);
  });

  test("get a user - bad id", async () => {
    try {
      const returnedUser = await placemarkService.getUser("1234");
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No User with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("get a user - deleted user", async () => {
    await placemarkService.deleteAllUsers();
    try {
      const returnedUser = await placemarkService.getUser(testUsers[0]._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No User with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });
});
