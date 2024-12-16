import { argon2id, hash, verify } from 'argon2';
import { format, fromZonedTime } from 'date-fns-tz';
import * as process from 'node:process';
import { Options as ArgonOptions } from 'argon2';
import { from, Observable } from 'rxjs';
import { User } from 'entities';

const argon2Options: ArgonOptions & { raw?: false } = {
  type: argon2id,
  hashLength: 50,
  timeCost: 4,
};

export const HelperService = {
  // The 'isProd' function checks the NODE_ENV whether is in the production environment, return 'true' if the NODE_ENV is 'prod' or 'production'
  isProd(): boolean {
    return process.env.NODE_ENV?.startsWith('prod');
  },

  // The getTimeInUtc function takes a Date object or date-formatted string as input and converts to UTC-zoned Date object
  getTimeInUtc(date: Date | string): Date {
    const trueDate = date instanceof Date ? date : new Date(date);
    const currentUtcTime = fromZonedTime(trueDate, 'UTC');

    return new Date(format(currentUtcTime, 'yyyy-MM-dd HH:mm:ss'));
  },

  // hash user's password using argon2 with argon2Options
  async hashString(userPassword: string): Promise<string> {
    return hash(userPassword, argon2Options);
  },

  slugify(string_: string): string {
    return string_
      .toString() // convert to string, in case it's not string
      .toLowerCase() // lower case all characters
      .normalize('NFD') // convert to Unicode format, exp: 'é' to 'e' + "´"
      .replaceAll(/[\u0300-\u036F]/g, '') // Remove all diacritical marks in Unicode range u0300-u036F
      .replaceAll(/[^\d a-z-]/g, '') // keep digits, space, a-z and hyphens
      .replaceAll(/\s+/g, '-'); // replace white spaces with hyphens
  },

  pick<T, K extends keyof T>(object: T, keys: K[]): Pick<T, K> {
    const returnValue: Pick<T, K> = {} as Pick<T, K>;

    for (const key of keys) returnValue[key] = object[key];

    return returnValue;
  },

  normalizeEmail(email: string): string {
    const DOT_REG: RegExp = /\./g;
    const [name, host] = email.split('@');
    let [beforePlus] = name.split('+');
    beforePlus = beforePlus.replaceAll(DOT_REG, '');
    const result = `${beforePlus.toLowerCase()}@${host.toLowerCase()}`;
    return result;
  },

  verifyHash(
    userPassword: string,
    passwordToConpare: string,
  ): Observable<boolean> {
    return from(verify(userPassword, passwordToConpare, argon2Options));
  },

  omit<T, K extends keyof T>(object: T, keys: K[]): Omit<T, K> {
    const omitted = { ...object };
    for (const key of keys) delete omitted[key];
    return omitted;
  },

  buildPayloadResponse(user: User, accessToken: string, refreshToken?: string) {
    return {
      user: { ...HelperService.pick(user, ['id', 'idx']) },
      accessToken,
      ...(refreshToken !== null ? { refresh_token: refreshToken } : {}),
    };
  },

  // If string exists, return the string with the first character capitalized and the the rest is lowercase string
  // otherwise return the empty string
  capitalize(string_: string): string {
    return string_
      ? string_.charAt(0).toUpperCase() + string_.slice(1).toLowerCase()
      : '';
  },
};
