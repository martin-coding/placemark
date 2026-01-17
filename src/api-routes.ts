import { userApi } from "./api/user-api.js";
import { locationApi } from "./api/location-api.js";

export const apiRoutes = [
  { method: "GET" as const, path: "/api/users", config: userApi.find },
  { method: "POST" as const, path: "/api/users", config: userApi.create },
  { method: "DELETE" as const, path: "/api/users", config: userApi.deleteAll },
  { method: "GET" as const, path: "/api/users/{id}", config: userApi.findOne },
  { method: "DELETE" as const, path: "/api/users/{id}", config: userApi.deleteOne },

  { method: "POST" as const, path: "/api/users/authenticate", config: userApi.authenticate },

  { method: "POST" as const, path: "/api/locations", config: locationApi.create },
  { method: "DELETE" as const, path: "/api/locations", config: locationApi.deleteAll },
  { method: "GET" as const, path: "/api/locations", config: locationApi.find },
  { method: "GET" as const, path: "/api/locations/{id}", config: locationApi.findOne },
  { method: "DELETE" as const, path: "/api/locations/{id}", config: locationApi.deleteOne },
];
