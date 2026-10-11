# async-csv

A TypeScript / JavaScript Promise wrapper for the [Node.js CSV toolkit](https://csv.js.org/).
Parse, stringify, generate and transform CSV data with `async` / `await`.

Requires Node.js 18 or newer. TypeScript declarations are included.

```sh
npm install async-csv
```

## Read and write CSV

```js
const csv = require('async-csv');
const fs = require('node:fs/promises');

async function main() {
  const input = await fs.readFile('./input.csv');
  const rows = await csv.parse(input, { columns: true, bom: true });
  const output = await csv.stringify(rows, { header: true });
  await fs.writeFile('./output.csv', output);
}

main().catch(console.error);
```

ES modules and TypeScript support default and named imports:

```ts
import csv, { parse, stringify } from 'async-csv';

interface Person { name: string; city: string }
const people = await parse<Person>('name,city\nAnton,Vancouver', { columns: true });
const output = await stringify(people, { header: true });
```

The generic record type describes the expected output; it does not validate CSV values.
Without options, `parse` returns `string[][]`. With options that change the record shape,
provide the record type or narrow the default `unknown` records. `objname` returns a
keyed object instead of an array.

## API

All four methods return Promises. Errors reject the Promise.

- `parse(input, options?)`: parse a string, Buffer or Uint8Array. Supports columns,
  casting, BOM, custom delimiters, raw records, metadata and record hooks.
- `stringify(records, options?)`: convert an array of array or object records to a string.
- `transform(records, handler, options?)`: transform records with a synchronous,
  Promise-returning or callback handler. `parallel: 1` preserves input order for
  asynchronous handlers; otherwise results arrive in completion order. Returning
  `null`/`undefined` skips a record. Numeric results become strings, as in `csv`.
- `generate(options)`: generate a Buffer, or a string with `encoding`, or an array
  with `objectMode: true`. Set a finite non-negative `length`, a positive finite
  `duration`, or a finite nonzero `end` timestamp/Date. An unbounded generator
  cannot finish a Promise and is rejected.

```js
const data = await csv.generate({ seed: 1, columns: 2, length: 10 });
const rows = await csv.parse(data);
const upper = await csv.transform(rows, async row => row.map(cell => cell.toUpperCase()), { parallel: 1 });
const output = await csv.stringify(upper);
```

Record arrays must not contain null, undefined or empty slots. Null/undefined **cells**
inside an array or object record are supported by `stringify`.

Options are those of the underlying toolkit:
[generate](https://csv.js.org/generate/options/),
[parse](https://csv.js.org/parse/options/),
[transform](https://csv.js.org/transform/options/),
[stringify](https://csv.js.org/stringify/options/).
All input and output is collected in memory. Use the toolkit's streaming APIs for
files that are too large to fit in memory.

## Spreadsheet formula escaping

CSV intended for spreadsheets may contain untrusted formulas. Enable the upstream
escaping option explicitly:

```js
const output = await csv.stringify(records, { header: true, escape_formulas: true });
```

The wrapper preserves the toolkit's default (`false`) to avoid silently changing
CSV values. Escaping adds an apostrophe to recognized formula prefixes; it does not
make arbitrary spreadsheet processing safe. Import as text where possible, and do
not rely on escaping surviving spreadsheet edits and re-saving.

## Migrating from 2.x / 3.0.0-pre3

- Node.js 18+ is required; stable 3.0.0 includes TypeScript declarations.
- Updated from `csv` 5 to 6, including `csv-parse` 7 and current option types.
- Use `relax_quotes` instead of `relax`, `skip_records_with_error` instead of
  `skip_lines_with_error`, and `skip_records_with_empty_values` instead of
  `skip_lines_with_empty_values`. Follow the upstream migration notes for other
  changed options and error codes.
- Async transform handlers now resolve to their results instead of leaked Promise objects.
- Invalid input rejects instead of hanging or causing an uncaught stream error.
- Generation requires an explicit stopping condition.
- Remove `@types/async-csv` when upgrading; this package supplies its own declarations.

## Development

```sh
npm ci
npm test
npm pack
```

The build emits JavaScript and declarations from `index.ts`. The test command checks
runtime behavior and TypeScript consumers; packing rebuilds the published files.
