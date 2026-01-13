import bcrypt from "bcrypt";
import { db } from "../models/db.js";
import { UserSpec, UserCredentialsSpec } from "../models/joi-schemas.js";

export const accountsController = {
  index: {
    auth: false,
    handler: function (request, h) {
      return h.view("main", { title: "Welcome to Placemark" });
    },
  },
  showSignup: {
    auth: false,
    handler: function (request, h) {
      return h.view("signup-view", { title: "Sign up for Placemark" });
    },
  },
  signup: {
    auth: false,
    validate: {
      payload: UserSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        return h.view("signup-view", { title: "Sign up error", errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const form = request.payload;
      try {
        const user = await db.userStore.addUser({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          emailVerified: true,
        });
        await db.authStore.addLocalAuth({
          user: user._id,
          providerUserId: user._id.toString(),
          password: form.password,
          email: form.email,
        });
        return h.redirect("/");
      } catch (error) {
        if (error.code === 11000) {
          return h
            .view("signup-view", { title: "Sign up error", errors: [{ message: "Email is already in use." }] })
            .takeover()
            .code(409);
        }
        throw error;
      }
    },
  },
  showLogin: {
    auth: false,
    handler: function (request, h) {
      return h.view("login-view", { title: "Login to Placemark" });
    },
  },
  login: {
    auth: false,
    validate: {
      payload: UserCredentialsSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        return h.view("login-view", { title: "Log in error", errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const { email, password } = request.payload;

      const identity = await db.authStore.getLocalIdentity(email);

      if (!identity) {
        return h
          .view("login-view", { title: "Log in error", errors: [{ message: "Email or password incorrect." }] })
          .takeover()
          .code(400);
      }

      const isValid = await bcrypt.compare(password, identity.passwordHash);

      if (!isValid) {
        return h
          .view("login-view", { title: "Log in error", errors: [{ message: "Email or password incorrect." }] })
          .takeover()
          .code(400);
      }

      request.cookieAuth.set({ id: identity.user._id });
      return h.redirect("/dashboard");
    },
  },
  github: {
    auth: "github",
    handler: async function (request, h) {
      const { profile, provider } = request.auth.credentials;

      const identity = await db.authStore.getOAuthIdentity(provider, profile.id);

      if (identity) {
        request.cookieAuth.set({ id: identity.user._id });
        return h.redirect("/dashboard");
      }

      const user = await db.userStore.addUser({
        firstName: profile.username,
        lastName: profile.username,
      });
      await db.authStore.addOAuth({
        user: user._id,
        provider: provider,
        providerUserId: profile.id,
        email: profile.email,
      });
      request.cookieAuth.set({ id: user._id });
      return h.redirect("/dashboard");
    },
  },
  logout: {
    handler: function (request, h) {
      request.cookieAuth.clear();
      return h.redirect("/");
    },
  },

  async validate(request, session) {
    const user = await db.userStore.getUserById(session.id);
    if (!user) {
      return { isValid: false };
    }
    return { isValid: true, credentials: user };
  },
};
