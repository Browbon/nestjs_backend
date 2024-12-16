import { TEmailSubject } from '../interfaces';

export enum PostStateEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export enum EmailServer {
  SES = 'SES',
  SMTP = 'SMTP',
}

export enum TemplateEngine {
  ETA = 'eta',
  PUG = 'pug',
  HANDLEBARS = 'handlebars',
}

export enum EmailTemplate {
  RESET_PASSWORD_TEMPLATE = 'reset',
  WELCOME_TEMPLATE = 'welcome',
  MAGIC_LOGIN_TEMPLATE = 'magiclogin',
  NEWSLETTER_TEMPLATE = 'newsletter',
}

export const EmailSubject: Record<TEmailSubject, string> = {
  RESET_PASSWORD: 'Reset your password',
  WELCOME: 'Welcome to the app',
  MAGIC_LOGIN: 'Login to the app',
  NEWSLETTER: 'Newsletter',
};
