interface BaseValidator {
  required?: boolean;
  message?: string;
}

interface BaseArrayValidator {
  maxArraySize?: number;
  minArraySize?: number;
  each?: boolean;
}

export type EnumFieldOptions = BaseValidator & BaseArrayValidator;
export type EmailFieldOptions = EnumFieldOptions;
export type MinMaxLengthOptions = Pick<
  StringFieldOptions,
  'each' | 'minLength' | 'maxLength'
>;

export interface StringFieldOptions extends BaseValidator, BaseArrayValidator {
  trim?: boolean;
  regex?: RegExp;
  minLength?: number;
  maxLength?: number;
  sanitize?: boolean;
}
