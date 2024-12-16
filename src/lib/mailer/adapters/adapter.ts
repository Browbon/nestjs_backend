import { Logger } from '@nestjs/common';
import { TemplateEngine } from 'common/@types/enums';
import consolidate, { SupportedTemplateEngines } from '@ladjs/consolidate';

export interface Adapter {
  logger: Logger;
  compile: (template: string, data: Record<string, any>) => Promise<string>;
}

export class BaseAdapter implements Adapter {
  logger: Logger = new Logger(BaseAdapter.name);
  constructor(private engine: TemplateEngine) {}

  async compile(template: string, data: Record<string, any>): Promise<string> {
    return consolidate[this.engine as SupportedTemplateEngines](template, data);
  }
}
