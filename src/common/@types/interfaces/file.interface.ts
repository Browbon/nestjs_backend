import { Readable } from 'node:stream';

export interface IFile {
  fieldname: string;

  originalname: string;

  encoding: string;

  mimetype: string;

  size: number;

  stream: Readable;

  destination: string;

  filename: string;

  path: string;

  buffer: Buffer;
}
