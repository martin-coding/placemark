import { db } from "../models/db.js";

export const adminController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;

      if (!loggedInUser.isAdmin) {
        return h.response("Forbidden").code(403); // Block access if not an admin
      }

      const users = await db.userStore.getAllUsers();
      const viewData = {
        title: "Admin Dashboard",
        user: loggedInUser,
        users: users,
      };
      return h.view("admin-view", viewData);
    },
  },
};
