import process from 'node:process';
import { registerAs } from '@nestjs/config';
import Joi from 'joi';
import {
  APP_ENVIRONMENTS,
  VERSION_VALIDATION_MESSAGE,
} from 'src/common/constant';

// validation schema
export const appConfigValidationSchema = {
  NODE_ENV: Joi.string()
    .valid(...APP_ENVIRONMENTS)
    .required(),
  APP_PORT: Joi.number().port().required(),
  APP_URL: Joi.string().uri().required(),
  APP_PREFIX: Joi.string().required().pattern(/^v\d+/).required().messages({
    'string.pattern.base': VERSION_VALIDATION_MESSAGE,
  }),
  APP_NAME: Joi.string().required(),
  CLIENT_URL: Joi.string().uri().required(),
  ALLOWED_HOSTS: Joi.string().optional(),
  SWAGGER_USERNAME: Joi.string().required(),
  SWAGGER_PASSWORD: Joi.string().required(),
};

// config
export const app = registerAs('app', () => ({
  port: process.env.APP_PORT,
  prefix: process.env.APP_PREFIX,
  env: process.env.NODE_ENV,
  url: process.env.API_URL,
  name: process.env.APP_NAME,
  clientUrl: process.env.CLIENT_URL,
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') ?? '*',
  swagger: {
    username: process.env.SWAGGER_USERNAME,
    password: process.env.SWAGGER_PASSWORD,
  },
}));
