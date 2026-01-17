import { db } from "../models/db.js";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { IUser } from "../types/placemark-types.js";

export const adminController = {
  index: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const loggedInUser = request.auth.credentials as any;

      if (!loggedInUser.isAdmin) {
        return h.response("Forbidden").code(403);
      }

      const users: IUser[] = await db.userStore.getAllUsers();

      const updatedUsers = users.map((user) => ({
        ...user,
        isLoggedInUser: user._id.toString() === loggedInUser._id.toString(),
      }));

      const viewData = {
        title: "Admin Dashboard",
        user: loggedInUser,
        users: updatedUsers,
      };
      return h.view("admin-view", viewData);
    },
  },

  deleteUser: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const loggedInUser = request.auth.credentials;

      if (!loggedInUser.isAdmin) {
        return h.response("Forbidden").code(403);
      }

      const user = db.userStore.getUserById(request.params.id);

      if (user == null) {
        return h.response("Not found").code(404);
      }

      // Admin users can't be deleted by other admins this is so by design
      if (user.isAdmin) {
        return h.response("Forbidden").code(403);
      }

      await db.userStore.deleteUserById(request.params.id);
      return h.redirect("/admin");
    },
  },
};
