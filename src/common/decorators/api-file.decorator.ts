import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

// for single file options
interface ApiFileOptions {
  fieldName?: string;
  required?: boolean;
  localOptions?: MulterOptions;
}

// multiple file options
interface ApiFilesOptions extends ApiFileOptions {
  maxCount?: number;
}

/**
 * Decorator that sets up with multer file interceptor for single file
 * @param options_ - ApiFileOptions
 * @returns Decorator that set up for file transfered data
 */
export function ApiFile(options_?: ApiFileOptions) {
  const options = {
    fieldName: 'file',
    required: false,
    ...options_,
  } satisfies ApiFilesOptions;

  return applyDecorators(
    UseInterceptors(FileInterceptor(options.fieldName, options.localOptions)),
    ApiConsumes('multipart/form-data'), // to tell swagger that the endpoitn is file data
    ApiBody({
      schema: {
        type: 'object',
        required: options.required ? [options.fieldName] : [],
        properties: {
          [options.fieldName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
  );
}

/**
 * Decorator that sets up with multer file interceptor for multiple file
 * @param options_ - ApiFilesOptions
 * @returns Decorator that set up for file transfered data
 */
export function ApiFiles(options_?: ApiFilesOptions) {
  const options = {
    fieldName: 'files',
    required: false,
    maxCount: 10,
    ...options_,
  } satisfies ApiFilesOptions;

  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(
        options.fieldName,
        options.maxCount,
        options.localOptions,
      ),
    ),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: options.required ? [options.fieldName] : [],
        properties: {
          [options.fieldName]: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    }),
  );
}
