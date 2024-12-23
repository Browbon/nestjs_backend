import sharp from 'sharp';

// Read more at https://www.npmjs.com/package/sharp
export interface ISharpInputOptions {
  width?: number;
  height?: number;
  options?: sharp.SharpOptions;
}
