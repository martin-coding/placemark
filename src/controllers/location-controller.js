import { db } from "../models/db.js";
import { imageStore } from "../models/image-store.js";

export const locationController = {
  index: {
    handler: async function (request, h) {
      const location = await db.locationStore.getLocationById(request.params.id);
      const loggedInUser = request.auth.credentials;
      if (!location) {
        return h.view("404", { title: "Not found" }).code(404);
      }
      if (location.visibility === "private" && loggedInUser._id.toString() !== location.userid.toString()) {
        return h.view("404", { title: "Not found" }).code(404);
      }
      const viewData = {
        title: "Location",
        location: location,
      };
      return h.view("location-view", viewData);
    },
  },
  uploadImage: {
    handler: async function (request, h) {
      try {
        const location = await db.locationStore.getLocationById(request.params.id);
        const file = request.payload.imagefile;
        if (Object.keys(file).length > 0) {
          const url = await imageStore.uploadImage(request.payload.imagefile);
          location.img = url;
          await db.locationStore.updateLocation(location);
        }
        return h.redirect(`/location/${location._id}`);
      } catch (err) {
        console.log(err);
        return h.response("500 Internal Server Error").code(500);
      }
    },
    payload: {
      multipart: true,
      output: "data",
      maxBytes: 209715200,
      parse: true,
    },
  },
};
