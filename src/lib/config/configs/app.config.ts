import * as process from 'node:process';
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { APP_ENVIRONMENTS, VERSION_VALIDATION_MESSAGE } from 'common/constant';

// validation schema
export const appConfigValidationSchema = {
  NODE_ENV: Joi.string()
    .valid(...APP_ENVIRONMENTS)
    .required(),
  APP_PORT: Joi.number().port().required(),
  APP_URL: Joi.string().uri(),
  APP_PREFIX: Joi.string().required().pattern(/^v\d+/).required().messages({
    'string.pattern.base': VERSION_VALIDATION_MESSAGE,
  }),
  APP_NAME: Joi.string().required(),
  CLIENT_URL: Joi.string().uri().optional().allow(''),
  ALLOWED_HOSTS: Joi.string().optional().allow(''),
  SWAGGER_USERNAME: Joi.string().allow(''),
  SWAGGER_PASSWORD: Joi.string().allow(''),
};

// config
export const app = registerAs('app', () => ({
  env: process.env.NODE_ENV,
  port: process.env.APP_PORT,
  prefix: process.env.APP_PREFIX,
  url: process.env.API_URL,
  name: process.env.APP_NAME,
  clientUrl: process.env.CLIENT_URL,
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') ?? '*',
  swagger: {
    username: process.env.SWAGGER_USERNAME,
    password: process.env.SWAGGER_PASSWORD,
  },
}));
