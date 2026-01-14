import Inert from "@hapi/inert";
import Hapi from "@hapi/hapi";
import Vision from "@hapi/vision";
import Bell from "@hapi/bell";
import Cookie from "@hapi/cookie";
import Handlebars from "handlebars";
import dotenv from "dotenv";
import path from "path";
import Joi from "joi";
import HapiSwagger from "hapi-swagger";
import jwt from "hapi-auth-jwt2";
import { fileURLToPath } from "url";
import { validate } from "./api/jwt-utils.js";
import { accountsController } from "./controllers/accounts-controller.js";
import { webRoutes } from "./web-routes.js";
import { db } from "./models/db.js";
import { apiRoutes } from "./api-routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const result = dotenv.config();
if (result.error) {
  console.log(result.error.message);
  // process.exit(1);
}

const isProd = process.env.NODE_ENV === "production";

Handlebars.registerHelper("eq", (a, b) => a === b);
Handlebars.registerHelper("neq", (a, b) => String(a) !== String(b));
Handlebars.registerHelper("formatDate", (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
});
Handlebars.registerHelper("stars", (rating) => {
  let html = "";
  for (let i = 1; i <= 5; i += 1) {
    if (i <= rating) {
      html += "<i class=\"fas fa-star\"></i>";
    } else {
      html += "<i class=\"far fa-star\"></i>";
    }
  }
  return new Handlebars.SafeString(html);
});
Handlebars.registerHelper("json", (context) => JSON.stringify(context)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029"));

const swaggerOptions = {
  schemes: isProd ? ['https'] : ['http'],
  info: {
    title: "Placemark API",
    version: "0.1",
  },
  securityDefinitions: {
    jwt: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
    },
  },
  security: [{ jwt: [] }],
};

async function init() {
  const uri = isProd ? "https://placemark-l3cr.onrender.com" : "http://localhost:3000";

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: isProd ? "0.0.0.0" : "localhost",
    routes: {
      cors: true
    },
    tls: false
  });

  server.events.on("request", (request, event) => {
    if (event.error) {
      console.error(event.error);
    }
  });

  server.ext("onRequest", (request, h) => {
    request.headers["x-forwarded-proto"] = "https";
    return h.continue;
  });

  await server.register(Bell);
  await server.register(Cookie);
  await server.register(jwt);

  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);

  server.validator(Joi);

  server.views({
    engines: {
      hbs: Handlebars,
    },
    relativeTo: __dirname,
    path: "./views",
    layoutPath: "./views/layouts",
    partialsPath: "./views/partials",
    layout: true,
    isCached: false,
  });

  server.auth.strategy("session", "cookie", {
    cookie: {
      name: process.env.COOKIE_NAME,
      password: process.env.COOKIE_PASSWORD,
      isSecure: false,
      path: "/",
    },
    redirectTo: "/",
    validate: accountsController.validate,
  });
  server.auth.strategy("jwt", "jwt", {
    key: process.env.COOKIE_PASSWORD,
    validate: validate,
    verifyOptions: { algorithms: ["HS256"] },
  });
  server.auth.default("session");
  server.auth.strategy("github", "bell", {
    provider: "github",
    password: process.env.COOKIE_PASSWORD,
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    isSecure: isProd,
    location: uri,
  });

  db.init("mongo");
  server.route(webRoutes);
  server.route(apiRoutes);
  server.route({
    method: "GET",
    path: "/{param*}",
    handler: {
      directory: {
        path: path.join(__dirname, "../public"),
        listing: false,
        index: false,
      },
    },
  });
  console.log("My uri is %s", uri);
  await server.start();
  console.log("Server running on %s", server.info.uri);
}

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT", err);
});

init();
