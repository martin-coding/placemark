import { db } from "../models/db.js";
import { LocationSpec } from "../models/joi-schemas.js";

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const { category } = request.query;
      const locations = await db.locationStore.getUserLocations(loggedInUser._id, category);
      const viewData = {
        title: "Placemark Dashboard",
        user: loggedInUser,
        locations: locations,
      };
      return h.view("dashboard-view", viewData);
    },
  },

  addLocation: {
    validate: {
      payload: LocationSpec,
      options: { abortEarly: false },
      failAction: async function (request, h, error) {
        const loggedInUser = request.auth.credentials;
        const locations = await db.locationStore.getUserLocations(loggedInUser._id);
        return h.view("location-form", { title: "Add Location error", locations: locations, errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const newLocation = {
        userid: loggedInUser._id,
        title: request.payload.title,
        latitude: request.payload.latitude,
        longitude: request.payload.longitude,
        description: request.payload.description,
        category: request.payload.category,
        visibility: request.payload.visibility,
      };
      await db.locationStore.addLocation(newLocation);
      return h.redirect("/dashboard");
    },
  },
  deleteLocation: {
    handler: async function (request, h) {
      const location = await db.locationStore.getLocationById(request.params.id);
      const loggedInUser = request.auth.credentials;
      if (location.userid?.toString() !== loggedInUser._id.toString() && !loggedInUser.isAdmin) {
        return h.response("403 Forbidden").code(403);
      }
      await db.locationStore.deleteLocationById(location._id);
      return h.redirect("/dashboard");
    },
  },
  new: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const { lat, lng } = request.query;

      const viewData = {
        title: "Add Location",
        user: loggedInUser,
        lat: lat,
        lng: lng,
      };
      return h.view("location-form", viewData);
    },
  },
};
