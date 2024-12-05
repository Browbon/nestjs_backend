import { I18nTranslations } from 'generated';
import type { Path, TranslateOptions } from 'nestjs-i18n';
import { I18nContext, i18nValidationMessage } from 'nestjs-i18n';

export const itemDoesNotExistKey: Path<I18nTranslations> =
  'exception.itemDoesNotExist';

export function translate(
  key: Path<I18nTranslations>,
  options: TranslateOptions = {},
) {
  const i18nContext = I18nContext.current<I18nTranslations>();

  if (i18nContext) return i18nContext.t(key, options);

  // can handle more about undifined context that i18ncontext can not covered
  return ''; // or throw error, return default values, etc.
}

export function validateI18nMessage(
  key: Path<I18nTranslations>,
  parameters_?: any,
) {
  return i18nValidationMessage(key, parameters_);
}
