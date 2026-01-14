const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

const config = {
  isProd,
  isTest,

  server: {
    port: process.env.PORT || 3000,
    host: isProd ? "0.0.0.0" : "localhost",
    uri: isProd
      ? "https://placemark-l3cr.onrender.com"
      : "http://localhost:3000"
  },

  cookies: {
    isSecure: isProd
  }
};

export default config;
