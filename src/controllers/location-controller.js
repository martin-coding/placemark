import { db } from "../models/db.js";
import { imageStore } from "../models/image-store.js";

export const locationController = {
  index: {
    handler: async function (request, h) {
      const location = await db.locationStore.getLocationById(request.params.id);
      const loggedInUser = request.auth.credentials;
      if (!location) {
        return h.view("404", { title: "Not found", user: loggedInUser }).code(404);
      }
      if (location.visibility === "private" && loggedInUser._id.toString() !== location.userid?.toString()) {
        return h.view("404", { title: "Not found", user: loggedInUser }).code(404);
      }
      const reviews = await db.reviewStore.getReviewsFromLocation(location._id);

      let userReview = null;
      if (loggedInUser) {
        userReview = await db.reviewStore.getUserReviewForLocation(location._id, loggedInUser._id);
      }

      const canEdit = location.userid?.toString() === loggedInUser._id.toString() || loggedInUser.isAdmin;

      const viewData = {
        title: "Location",
        location: location,
        user: loggedInUser,
        reviews: reviews,
        userReview,
        canEdit,
      };
      return h.view("location-view", viewData);
    },
  },
  uploadImage: {
    handler: async function (request, h) {
      try {
        const loggedInUser = request.auth.credentials;
        const location = await db.locationStore.getLocationById(request.params.id);
        const file = request.payload.imagefile;
        if (location.userid?.toString() !== loggedInUser._id.toString() && !loggedInUser.isAdmin) {
          return h.redirect(`/location/${location._id}`);
        }
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
  review: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const location = await db.locationStore.getLocationById(request.params.id);
      const { rating, comment } = request.payload;
      await db.reviewStore.upsertReview(location._id, loggedInUser._id, rating, comment);
      return h.redirect(`/location/${request.params.id}`);
    },
  },
};
