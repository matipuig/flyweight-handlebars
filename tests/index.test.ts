/**
 *  TESTS FOR INDEX.
 */
import fs from 'fs';
import path from 'path';
import FlyweightHandlebars from '../src';

const hb = new FlyweightHandlebars();
const TEMPLATES_DIR = path.join(__dirname, 'templates-test');

hb.setTemplatesPath(TEMPLATES_DIR);

/**
 *  Compile many files in handlebars.
 */
const compileMany = function compileMany(files: string[]): boolean {
  files.forEach((file) => {
    hb.getTemplate(file);
    return true;
  });
  return true;
};

/**
 *  Waits for the specified seconds.
 */
const wait = async function wait(seconds: number): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, seconds * 1000);
  });
};

/**
 *  Overwrites one file with another.
 */
const replaceFile = function replaceFile(srcFileName: string, destFileName: string): boolean {
  const srcFile = path.join(TEMPLATES_DIR, srcFileName);
  const destFile = path.join(TEMPLATES_DIR, destFileName);
  fs.unlinkSync(destFile);
  const content = fs.readFileSync(srcFile, 'utf-8');
  fs.writeFileSync(destFile, content, { encoding: 'utf-8' });
  return true;
};

/**
 *  Personalized helper for handlebars.
 */
const personalizedHelper = function personalizedHelper(): any {
  return 'PERSONALIZED_HELPER';
};

test('Rendering one file (flyweightHandlebars.getTemplate)', () => {
  replaceFile('test1-1.txt', 'test1.txt');
  const test1 = hb.getTemplate('test1.txt');
  let content = test1({ variable: '1' });
  expect(content).toBe('Test1 1');
  content = test1({ variable: '2' });
  expect(content).toBe('Test1 2');
  content = test1({ variable: '3' });
  expect(content).toBe('Test1 3');

  const failLoading = () => hb.getTemplate('non existent.txt');
  expect(failLoading).toThrow();
});

test('Rendering various files (flyweightHandlebars.getTemplate and flyweightHandlebars.remove)', () => {
  const test1 = hb.getTemplate('test1.txt');
  const test2 = hb.getTemplate('test2.txt');
  const test3 = hb.getTemplate('test3.txt');
  expect(hb.countTemplatesInMemory()).toBe(3);

  const content1 = test1({ variable: '1' });
  const content2 = test2({ variable: '2' });
  const content3 = test3({ variable: '3' });
  expect(content1).toBe('Test1 1');
  expect(content2).toBe('Test2 2');
  expect(content3).toBe('Test3 3');

  hb.remove('test1.txt');
  expect(hb.countTemplatesInMemory()).toBe(2);
  hb.remove('test2.txt');
  expect(hb.countTemplatesInMemory()).toBe(1);
  hb.remove('test3.txt');
  expect(hb.countTemplatesInMemory()).toBe(0);
});

test('Emptying memory (flyweightHandlebars.empty)', () => {
  compileMany(['test1.txt', 'test2.txt', 'test3.txt']);
  expect(hb.countTemplatesInMemory()).toBe(3);
  hb.empty();
  expect(hb.countTemplatesInMemory()).toBe(0);
});

test('Updating compiled when file is modified', () => {
  const test1 = hb.getTemplate('test1.txt');
  const content1 = test1({ variable: '1' });
  expect(content1).toBe('Test1 1');

  replaceFile('test1-2.txt', 'test1.txt');
  const test1Modified = hb.getTemplate('test1.txt');
  const content1Modified = test1Modified({ variable: '1' });
  expect(content1Modified).toBe('Test1-2 1');

  replaceFile('test1-1.txt', 'test1.txt');
  const test1Again = hb.getTemplate('test1.txt');
  const content1Again = test1Again({ variable: '1' });
  expect(content1Again).toBe('Test1 1');
});

test('Controlling memory leaks', async () => {
  hb.setMaxDuration(1);
  hb.setControlInterval(1);
  compileMany(['test1.txt', 'test2.txt', 'test3.txt', 'test4.txt']);
  expect(hb.countTemplatesInMemory()).toBe(4);
  await wait(2);
  expect(hb.countTemplatesInMemory()).toBe(0);
});

test('Controlling memory leaks 2', async () => {
  hb.setMaxDuration(2);
  hb.setControlInterval(0.1);
  hb.getTemplate('test1.txt');
  await wait(0.5);
  hb.getTemplate('test2.txt');
  await wait(0.5);
  hb.getTemplate('test3.txt');
  await wait(0.5);
  hb.getTemplate('test4.txt');
  expect(hb.countTemplatesInMemory()).toBe(4);

  await wait(0.6);
  expect(hb.countTemplatesInMemory()).toBe(3);
  await wait(0.5);
  expect(hb.countTemplatesInMemory()).toBe(2);
  await wait(0.5);
  expect(hb.countTemplatesInMemory()).toBe(1);
  await wait(0.5);
  expect(hb.countTemplatesInMemory()).toBe(0);
});

test('Checking access to handlebars (flyweightHandlebars.getHandlebars)', () => {
  const handlebars = hb.getHandlebars();
  handlebars.registerHelper('personalized_helper', personalizedHelper);
  const helperResult = personalizedHelper();
  const helperTest = hb.getTemplate('helpers.txt');
  const helperContent = helperTest({});
  expect(helperContent).toBe(helperResult);
});
