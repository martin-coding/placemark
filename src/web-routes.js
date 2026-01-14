import { accountsController } from "./controllers/accounts-controller.js";
import { dashboardController } from "./controllers/dashboard-controller.js";
import { adminController } from "./controllers/admin-controller.js";
import { locationController } from "./controllers/location-controller.js";

export const webRoutes = [
  { method: "GET", path: "/", config: accountsController.index },
  { method: "GET", path: "/signup", config: accountsController.showSignup },
  { method: "GET", path: "/login", config: accountsController.showLogin },
  { method: "GET", path: "/logout", config: accountsController.logout },
  { method: "POST", path: "/register", config: accountsController.signup },
  { method: "POST", path: "/authenticate", config: accountsController.login },
  { method: "GET", path: "/auth/github", config: accountsController.github },

  { method: "GET", path: "/dashboard", config: dashboardController.index },
  { method: "GET", path: "/dashboard/new", config: dashboardController.new },
  { method: "POST", path: "/dashboard/addlocation", config: dashboardController.addLocation },
  { method: "POST", path: "/dashboard/deletelocation/{id}", config: dashboardController.deleteLocation },

  { method: "GET", path: "/location/{id}", config: locationController.index },
  { method: "POST", path: "/location/{id}/uploadimage", config: locationController.uploadImage },
  { method: "POST", path: "/location/{id}/review", config: locationController.review },

  { method: "GET", path: "/admin", config: adminController.index },
  { method: "GET", path: "/admin/deleteuser/{id}", config: adminController.deleteUser },
];
