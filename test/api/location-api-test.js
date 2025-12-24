import { EventEmitter } from "events";
import { assert } from "chai";
import { afterEach } from "mocha";
import { placemarkService } from "./placemark-service.js";
import { assertSubset } from "../test-utils.js";
import { testUser, testUserCredentials, waterfall, testLocations } from "../fixtures.js";

EventEmitter.setMaxListeners(25);

suite("Location API tests", () => {
  let user = null;

  setup(async () => {
    placemarkService.clearAuth();
    user = await placemarkService.createUser(testUser);
    await placemarkService.authenticate(testUserCredentials);
    await placemarkService.deleteAllLocations();
    await placemarkService.deleteAllUsers();
    user = await placemarkService.createUser(testUser);
    await placemarkService.authenticate(testUserCredentials);
    waterfall.userid = user._id;
  });

  afterEach(async () => {
    await placemarkService.deleteAllUsers();
  });

  teardown(async () => {});

  test("create location", async () => {
    const returnedLocation = await placemarkService.createLocation(waterfall);
    assert.isNotNull(returnedLocation);
    assertSubset(waterfall, returnedLocation);
  });

  test("delete a location", async () => {
    const location = await placemarkService.createLocation(waterfall);
    const response = await placemarkService.deleteLocation(location._id);
    assert.equal(response.status, 204);
    try {
      const returnedLocation = await placemarkService.getLocation(location.id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message.startsWith("No Location with this id"), "Incorrect Response Message");
    }
  });

  test("create multiple locations", async () => {
    for (let i = 0; i < testLocations.length; i += 1) {
      testLocations[i].userid = user._id;
      // eslint-disable-next-line no-await-in-loop
      await placemarkService.createLocation(testLocations[i]);
    }
    let returnedLists = await placemarkService.getAllLocations();
    assert.equal(returnedLists.length, testLocations.length);
    await placemarkService.deleteAllLocations();
    returnedLists = await placemarkService.getAllLocations();
    assert.equal(returnedLists.length, 0);
  });

  test("remove non-existant location", async () => {
    try {
      const response = await placemarkService.deleteLocation("not an id");
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message.startsWith("No Location with this id"), "Incorrect Response Message");
    }
  });
});
