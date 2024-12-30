import { Transform } from 'class-transformer';
import { isArray, isString } from 'class-validator';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Take string, santize it and return the santized string
 * @returns A clean string
 */
export function Sanitize(): PropertyDecorator {
  return Transform(
    ({ value }: { value: unknown }) => {
      if (isArray(value)) {
        return value.map((v) => {
          if (isString(v)) return DOMPurify.sanitize(v);

          return v;
        });
      }

      if (isString(value)) return DOMPurify.sanitize(value);

      return value;
    },
    { toClassOnly: true },
  );
}

/**
 * It trims the value of property and replaces all multiple spaces with single space
 * @returns A trimmed string Array or string
 */
export function Trim() {
  return Transform((parameter) => {
    const value = parameter.value as string[] | string;

    if (isArray(value))
      return value.map((v: string) => {
        v.trim().replaceAll(/\s{2,}/g, ' ');
      });

    return value.trim().replaceAll(/\s{2,}/g, ' ');
  });
}

/**
 * convert a stirng into boolean
 * @returns decorator
 */
export function ToBoolean() {
  return Transform(
    (parameters) => {
      switch (parameters.value) {
        case 'true': {
          return true;
        }
        case 'false': {
          return false;
        }
        default: {
          return parameters.value as boolean;
        }
      }
    },
    { toClassOnly: true },
  );
}
