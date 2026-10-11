import csv, { parse, stringify, transform, generate, type CsvStringifyOptions, type TransformCallback } from '../index';

interface Person { name: string; active: boolean }
const people: Person[] = [{ name: 'Anton', active: true }];
const output: Promise<string> = stringify(people, { header: true });
const quoteOptions: CsvStringifyOptions = { quoted_match: /test/, escape_formulas: true };
const rows: Promise<string[][]> = parse('a,b');
const objects: Promise<Person[]> = csv.parse<Person>('name,active\nAnton,true', { columns: true });
const indexed: Promise<Record<string, Person>> = parse<Person>('name,active\nAnton,true', { columns: true, objname: 'name' });
const modified: Promise<string[]> = transform(people, row => row.name);
const asyncModified: Promise<string[]> = transform(people, async row => row.name);
const callbackModified: Promise<string[]> = transform<Person, string>(people, (row, done) => done(null, row.name, row.name));
const numeric: Promise<string[]> = transform([1], row => row + 1);
const withParams: Promise<string[]> = transform(['a'], (row, suffix) => row + suffix, { params: '!' });
const callbackParams: Promise<string[]> = transform(['a'], (row: string, done: TransformCallback<string>, suffix: string) => done(null, row + suffix), { params: '!' });
const encoded: Promise<string> = generate({ length: 2, encoding: 'utf8' });
const generatedRows: Promise<unknown[][]> = generate({ length: 2, objectMode: true });
parse(new Uint8Array([97]));
// @ts-expect-error Input must contain CSV text or bytes.
parse(42);
// @ts-expect-error Input must be an array of records.
stringify({ name: 'Anton' });
// @ts-expect-error Quoting patterns are not booleans.
stringify(people, { quoted_match: true });
