import { userJsonStore } from "./json/user-json-store.js";
import { locationJsonStore } from "./json/location-json-store.js";

export const db = {
  userStore: null,
  locationStore: null,

  init() {
    this.userStore = userJsonStore;
    this.locationStore = locationJsonStore;
  },
};
