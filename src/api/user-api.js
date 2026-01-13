import Boom from "@hapi/boom";
import bcrypt from "bcrypt";
import { db } from "../models/db.js";
import { UserSpec, UserSpecPlus, UserCredentialsSpec, IdSpec, UserArray, JwtAuth } from "../models/joi-schemas.js";
import { validationError } from "./logger.js";
import { createToken } from "./jwt-utils.js";

export const userApi = {
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const users = await db.userStore.getAllUsers();
        return users;
      } catch (err) {
        return Boom.serverUnavailable("Database Error", err);
      }
    },
    tags: ["api"],
    description: "Get all users",
    notes: "Returns details of all users",
    response: { schema: UserArray, failAction: validationError },
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const user = await db.userStore.getUserById(request.params.id);
        if (!user) {
          return Boom.notFound("No user with this id");
        }
        return user;
      } catch (err) {
        return Boom.serverUnavailable("No user with this id", err);
      }
    },
    tags: ["api"],
    description: "Get a specific user",
    notes: "Returns user details",
    validate: { params: { id: IdSpec }, failAction: validationError },
    response: { schema: UserSpecPlus, failAction: validationError },
  },

  create: {
    auth: false,
    handler: async function (request, h) {
      try {
        const data = request.payload;
        const user = await db.userStore.addUser({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          emailVerified: true,
        });
        if (!user) {
          return Boom.badImplementation("error creating user");
        }
        await db.authStore.addLocalAuth({
          user: user._id,
          providerUserId: user._id.toString(),
          password: data.password,
          email: data.email,
        });
        return h.response(user).code(201);
      } catch (err) {
        if (err.code === 11000) {
          return Boom.conflict("Email already in use");
        }
        return Boom.serverUnavailable("Database Error", err);
      }
    },
    tags: ["api"],
    description: "Create a user",
    notes: "Returns the newly created user",
    validate: { payload: UserSpec, failAction: validationError },
    response: { status: { 201: UserSpecPlus }, failAction: validationError },
  },

  deleteAll: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        await db.userStore.deleteAll();
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error", err);
      }
    },
    tags: ["api"],
    description: "Delete all users",
    notes: "All users removed from Placemark",
  },

  deleteOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const user = await db.userStore.getUserById(request.params.id);
        if (!user) {
          return Boom.notFound("No user with this id");
        }
        await db.userStore.deleteUserById(user._id);
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("No user with this id:", err);
      }
    },
    tags: ["api"],
    description: "Delete one user",
    notes: "One user removed from Placemark",
    validate: { params: { id: IdSpec }, failAction: validationError },
  },

  authenticate: {
    auth: false,
    handler: async function (request, h) {
      try {
        const user = await db.userStore.getUserByEmail(request.payload.email);
        const identity = await db.authStore.getLocalIdentity(request.payload.email);
        if (!user) {
          return Boom.unauthorized("User not found");
        }
        const valid = await bcrypt.compare(request.payload.password, identity.passwordHash);
        if (!valid) {
          return Boom.unauthorized("Invalid password");
        }
        const token = createToken(user);
        return h.response({ success: true, token: token }).code(201);
      } catch (err) {
        return Boom.serverUnavailable("Database Error", err);
      }
    },
    tags: ["api"],
    description: "Authenticate  a User",
    notes: "If user has valid email/password, create and return a JWT token",
    validate: { payload: UserCredentialsSpec, failAction: validationError },
    response: { status: { 201: JwtAuth }, failAction: validationError },
  },
};
