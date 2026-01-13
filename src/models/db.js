import { userJsonStore } from "./json/user-json-store.js";
import { locationJsonStore } from "./json/location-json-store.js";
import { connectMongo } from "./mongo/connect.js";
import { userMongoStore } from "./mongo/user-mongo-store.js";
import { authMongoStore } from "./mongo/auth-mongo-store.js";
import { locationMongoStore } from "./mongo/location-mongo-store.js";

export const db = {
  userStore: null,
  locationStore: null,
  authStore: null,

  init(storeType) {
    switch (storeType) {
      case "mongo":
        this.userStore = userMongoStore;
        this.locationStore = locationMongoStore;
        this.authStore = authMongoStore;
        connectMongo();
        break;
      default:
        this.userStore = userJsonStore;
        this.locationStore = locationJsonStore;
    }
  },
};
