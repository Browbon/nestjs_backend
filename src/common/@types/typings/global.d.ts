import { NextFunction, Request, Response } from 'express';
import { ConfigInterface } from 'lib/config/config.interface';

// to treat as module, not as script
export {};

export type Configs = ConfigInterface;

// For quickly switch between express and fastify and others
export type NestifyRequest = Request;
export type NestifyResponse = Response;
export type NestifyNextFunction = NextFunction;
