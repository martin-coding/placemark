import Joi from "joi";

export const IdSpec = Joi.alternatives().try(Joi.string(), Joi.object()).description("a valid ID");

export const UserCredentialsSpec = Joi.object({
  email: Joi.string().email().example("homer@simpson.com").required(),
  password: Joi.string().min(8).example("secret").required(),
}).label("UserCredentials");

export const UserSpec = UserCredentialsSpec.keys({
  firstName: Joi.string().example("Homer").required(),
  lastName: Joi.string().example("Simpson").required(),
}).label("UserDetails");

export const UserFormSpec = UserSpec.keys({
  passwordConfirm: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
}).label("UserForm");

export const UserSpecPlus = UserSpec.keys({
  password: Joi.forbidden(),
  _id: IdSpec,
  __v: Joi.number(),
  emailVerified: Joi.boolean(),
  isAdmin: Joi.boolean(),
  createdAt: Joi.date().iso(),
  updatedAt: Joi.date().iso(),
}).label("UserDetailsPlus");

export const UserArray = Joi.array().items(UserSpecPlus).label("UserArray");

export const LocationSpec = Joi.object()
  .keys({
    title: Joi.string().required().example("Seljalandsfoss"),
    description: Joi.string().allow("").optional(),
    latitude: Joi.number().required().min(-90).max(90).messages({
      "number.base": "Latitude must be a valid number.",
      "number.min": "Latitude must be between -90 and 90.",
      "number.max": "Latitude must be between -90 and 90.",
    }),
    longitude: Joi.number().required().min(-180).max(180).messages({
      "number.base": "Longitude must be a valid number.",
      "number.min": "Longitude must be between -180 and 180.",
      "number.max": "Longitude must be between -180 and 180.",
    }),
    userid: IdSpec,
    category: Joi.string().example("waterfall"),
    visibility: Joi.string().example("public"),
  })
  .label("Location");

export const LocationSpecPlus = LocationSpec.keys({
  _id: IdSpec,
  __v: Joi.number(),
}).label("LocationPlus");

export const LocationArraySpec = Joi.array().items(LocationSpecPlus).label("LocationArray");

export const JwtAuth = Joi.object()
  .keys({
    success: Joi.boolean().example("true").required(),
    token: Joi.string().example("eyJhbGciOiJND.g5YmJisIjoiaGYwNTNjAOhE.gCWGmY5-YigQw0DCBo").required(),
  })
  .label("JwtAuth");
