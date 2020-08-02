/**
 * 	FLYWEIGHT PATTERN FOR HANDLEBARS:
 *  This script lets you have in memory the handlebars compiled files the time you need.
 *  When the max time has elapsed, it deletes them from memory.
 *  Returns handlebars compield.
 */

import fs from 'fs';
import hb from 'handlebars';
import path from 'path';

type Template = {
  template: any;
  modificationTime: number;
  loadedTime: number;
};

type Templates = Record<string, Template>;

type BufferEncoding =
  | 'ascii'
  | 'utf8'
  | 'utf-8'
  | 'utf16le'
  | 'ucs2'
  | 'ucs-2'
  | 'base64'
  | 'latin1'
  | 'binary'
  | 'hex';

class FlyWeightHandlebars {
  private _templates: Templates = {};

  private _maxDuration: number = 60000; // One minute in RAM.

  private _controlInterval: number = 10000; // Checks every 10 seconds.

  private _timeoutClean: any = false;

  private _templatesPath: string = './';

  constructor() {
    this._clean = this._clean.bind(this);
    this._clean();
  }

  /**
   *  Set the templates path.
   */
  setTemplatesPath(templatesPath: string): boolean {
    this._templatesPath = templatesPath;
    return true;
  }

  /**
   *  Sets how much time each template will stay in memory before being deletes.
   *  In seconds.
   */
  setMaxDuration(duration: number): boolean {
    this._maxDuration = duration * 1000;
    this._clean();
    return true;
  }

  /**
   *  Sets the invertal between memory RAM controls..
   *  In seconds.
   */
  setControlInterval(duration: number): boolean {
    this._controlInterval = duration * 1000;
    this._clean();
    return true;
  }

  /**
   *  Gets the max duration in miliseconds.
   */
  getMaxDuration(): number {
    return this._maxDuration;
  }

  /**
   *  Get how many templates in memory does the flyweight have.
   */
  countTemplatesInMemory(): number {
    return Object.keys(this._templates).length;
  }

  /**
   *  Returns the handlebars library for use.
   */

  getHandlebars(): typeof hb {
    return hb;
  }

  /**
   *  Gets the template for the file with the specified name.
   *  Throws an error if it doesn't exists.
   */
  getTemplate(
    fileName: string,
    encoding: BufferEncoding = 'utf-8',
  ): HandlebarsTemplateDelegate<any> {
    const filePath = this._getFilePath(fileName);

    if (typeof this._templates[fileName] === 'undefined') {
      return this._generateTemplate(fileName, filePath, encoding);
    }

    const template = this._templates[fileName];
    const modificationTime = this._getLastModificationTime(filePath);
    if (modificationTime > template.modificationTime) {
      return this._generateTemplate(fileName, filePath, encoding);
    }
    return template.template;
  }

  /**
   *  Returns the templates filenames.
   */
  getTemplatesFiles(): string[] {
    return Object.keys(this._templates);
  }

  /**
   *  Removes a compiled file from memory.
   */
  remove(fileName: string): boolean {
    delete this._templates[fileName];
    return true;
  }

  /**
   *  Deletes all templates in memory.
   */
  empty(): boolean {
    this._templates = {};
    return true;
  }

  //*
  //*
  //*		PRIVATE METHODS
  //*
  //*

  /**
   *  Deletes all the templates that have more than allowed time.
   */
  private _clean(): void {
    const now = new Date().getTime();
    let tmpTemplate;
    let tmpElapsedTime: number = 0;
    clearTimeout(this._timeoutClean);
    this._timeoutClean = false;
    Object.keys(this._templates).forEach((template) => {
      tmpTemplate = this._templates[template];
      tmpElapsedTime = now - tmpTemplate.loadedTime;
      if (tmpElapsedTime > this._maxDuration) {
        delete this._templates[template];
      }
      return true;
    }, this);
    this._timeoutClean = setTimeout(this._clean.bind(this), this._controlInterval);
  }

  /**
   * 	Generates a tepmlate from the file and add it to memory.
   */
  private _generateTemplate(
    name: string,
    filePath: string,
    encoding: BufferEncoding,
  ): HandlebarsTemplateDelegate<any> {
    const fileContent = fs.readFileSync(filePath, { encoding });
    const template = hb.compile(fileContent);
    const modificationTime = this._getLastModificationTime(filePath);
    this._templates[name] = {
      template,
      modificationTime,
      loadedTime: new Date().getTime(),
    };
    return template;
  }

  /**
   *  Get when the file was last modified.
   */
  private _getLastModificationTime(filePath: string): number {
    const fileStat = fs.statSync(filePath);
    return fileStat.mtimeMs || fileStat.ctimeMs;
  }

  /**
   *  Get file location by its name.
   */
  private _getFilePath(fileName: string): string {
    const filePath = path.join(this._templatesPath, fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${fileName} doesn't exist.`);
    }
    return filePath;
  }
}

export = FlyWeightHandlebars;
