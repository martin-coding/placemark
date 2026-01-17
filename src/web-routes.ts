import { accountsController } from "./controllers/accounts-controller.js";
import { dashboardController } from "./controllers/dashboard-controller.js";
import { adminController } from "./controllers/admin-controller.js";
import { locationController } from "./controllers/location-controller.js";

export const webRoutes = [
  { method: "GET" as const, path: "/", config: accountsController.index },
  { method: "GET" as const, path: "/signup", config: accountsController.showSignup },
  { method: "GET" as const, path: "/login", config: accountsController.showLogin },
  { method: "GET" as const, path: "/logout", config: accountsController.logout },
  { method: "POST" as const, path: "/register", config: accountsController.signup },
  { method: "POST" as const, path: "/authenticate", config: accountsController.login },
  { method: "GET" as const, path: "/auth/github", config: accountsController.github },

  { method: "GET" as const, path: "/dashboard", config: dashboardController.index },
  { method: "GET" as const, path: "/dashboard/new", config: dashboardController.new },
  { method: "POST" as const, path: "/dashboard/addlocation", config: dashboardController.addLocation },
  { method: "POST" as const, path: "/dashboard/deletelocation/{id}", config: dashboardController.deleteLocation },

  { method: "GET" as const, path: "/location/{id}", config: locationController.index },
  { method: "POST" as const, path: "/location/{id}/update", config: locationController.update },
  { method: "POST" as const, path: "/location/{id}/uploadimage", config: locationController.uploadImage },
  { method: "POST" as const, path: "/location/{id}/review", config: locationController.review },
  { method: "POST" as const, path: "/location/{locationId}/deletereview/{reviewId}", config: locationController.deleteReview },

  { method: "GET" as const, path: "/admin", config: adminController.index },
  { method: "GET" as const, path: "/admin/deleteuser/{id}", config: adminController.deleteUser },
];
