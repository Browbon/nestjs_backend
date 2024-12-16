import { EmailServer, TemplateEngine } from 'common/@types/enums';

export type engineOption = Record<string, any>;

export interface MailModuleOptions {
  credentials:
    | {
        type: EmailServer.SES;
        sesKey: string;
        sesAccessKey: string;
        sesRegion: string;
      }
    | {
        type: EmailServer.SMTP;
        host: string;
        port: number;
        username: string;
        password: string;
      };
  previewEmail: boolean;
  retryAttempts?: number;
  templateDir: string;
  templateEngine:
    | TemplateEngine.ETA
    | TemplateEngine.PUG
    | TemplateEngine.HANDLEBARS;
}
