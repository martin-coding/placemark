import Joi from "joi";

export const UserSpec = {
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
};

export const UserCredentialsSpec = {
  email: Joi.string().email().required(),
  password: Joi.string().required(),
};

export const LocationSpec = {
  title: Joi.string().required(),
  latitude: Joi.number()
    .required()
    .min(-90)
    .max(90)
    .messages({
      'number.base': 'Latitude must be a valid number.',
      'number.min': 'Latitude must be between -90 and 90.',
      'number.max': 'Latitude must be between -90 and 90.',
    }),
  longitude: Joi.number()
    .required()
    .min(-180)
    .max(180)
    .messages({
      'number.base': 'Longitude must be a valid number.',
      'number.min': 'Longitude must be between -180 and 180.',
      'number.max': 'Longitude must be between -180 and 180.',
    }),
  description: Joi.string().allow('').optional(),
};
