import process from 'node:process';
import { registerAs } from '@nestjs/config';
import Joi from 'joi';
import { JWT_EXPIRY_REGEX } from 'src/common/constant';

/**
 * NOTE: The expiry can be either number or string
 * if the expiry is number, parse it to string
 * the format can be found in JWT_EXPIRY_REGEX
 */

export const jwtConfigValidationSchema = {
  JWT_SECRET: Joi.string().required().min(8),
  JWT_ALGORITHM: Joi.string().optional(),
  JWT_ACCESS_EXPIRY: Joi.string().regex(JWT_EXPIRY_REGEX).required(),
  JWT_REFRESH_EXPIRY: Joi.string().regex(JWT_EXPIRY_REGEX).required(),
  MAGIC_LINK_EXPIRY: Joi.string().regex(JWT_EXPIRY_REGEX).required(),
};

export const jwt = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  algorithm: process.env.JWT_ALGORITHM ?? 'HS256',
  accessExpiry: process.env.JWT_ACCESS_EXPIRY,
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY,
  macgicLinkExpiry: process.env.JWT_MAGIC_LINK_EXPIRY,
}));
