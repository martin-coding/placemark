import { db } from "../models/db.js";
import { imageStore } from "../models/image-store.js";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { getWeather } from "../services/weather-service";

export const locationController = {
  index: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const loggedInUser = request.auth.credentials as any;
      const location = await db.locationStore.getLocationById(request.params.id);
      const editMode = request.query.edit === "true";

      if (!location) {
        return h.view("404", { title: "Not found", user: loggedInUser }).code(404);
      }
      const reviews = await db.reviewStore.getReviewsFromLocation(location._id);
      const canEdit = location.userid?.toString() === loggedInUser._id.toString() || loggedInUser.isAdmin;

      if (!canEdit && editMode) {
        return h.redirect(`/location/${location._id}`);
      }
      if (location.visibility === "private" && loggedInUser._id.toString() !== location.userid?.toString()) {
        return h.view("404", { title: "Not found", user: loggedInUser }).code(404);
      }

      let userReview = null;
      if (loggedInUser) {
        userReview = await db.reviewStore.getUserReviewForLocation(location._id, loggedInUser._id);
      }

      let weather = null;

      if (location.latitude && location.longitude) {
        try {
          weather = await getWeather(location.latitude, location.longitude);
        } catch (e) {
          console.error("Weather API failed", e);
        }
      }

      const viewData = {
        title: "Location",
        location: location,
        weather: weather, 
        user: loggedInUser,
        reviews: reviews,
        userReview,
        canEdit,
        editMode,
      };
      return h.view("location-view", viewData);
    },
  },
  update: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const loggedInUser = request.auth.credentials as any;
      const location = await db.locationStore.getLocationById(request.params.id);
      const canEdit = location.userid?.toString() === loggedInUser._id.toString() || loggedInUser.isAdmin;
      const newLocationData = request.payload as any;
      newLocationData._id = location._id;
      if (canEdit) {
        db.locationStore.editLocation(newLocationData);
      }
      return h.redirect(`/location/${location._id}`);
    },
  },
  uploadImage: {
    handler: async function (request: Request, h: ResponseToolkit) {
      try {
        const loggedInUser = request.auth.credentials as any;
        const location = await db.locationStore.getLocationById(request.params.id);
        const payload = request.payload as any;
        const file = payload.imagefile;
        if (location.userid?.toString() !== loggedInUser._id.toString() && !loggedInUser.isAdmin) {
          return h.redirect(`/location/${location._id}`);
        }
        if (Object.keys(file).length > 0) {
          const url = await imageStore.uploadImage(file);
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
    handler: async function (request: Request, h: ResponseToolkit) {
      const loggedInUser = request.auth.credentials;
      const location = await db.locationStore.getLocationById(request.params.id);
      const { rating, comment } = request.payload as any;
      await db.reviewStore.upsertReview(location._id, loggedInUser._id, rating, comment);
      return h.redirect(`/location/${request.params.id}`);
    },
  },
  deleteReview: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const loggedInUser = request.auth.credentials as any;
      const { locationId, reviewId } = request.params;
      const review = await db.reviewStore.getReviewById(reviewId);
      if (review.userid.toString() === loggedInUser._id.toString()) {
        await db.reviewStore.deleteReviewById(reviewId);
      }
      return h.redirect(`/location/${locationId}`);
    },
  },
};
