'use strict';
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const csv = require('./index.js');

describe('generate', { timeout: 3000 }, () => {
  it('generates bounded CSV as a Buffer by default', async () => {
    const output = await csv.generate({ seed: 1, columns: 3, length: 5 });
    assert.ok(Buffer.isBuffer(output));
    const rows = await csv.parse(output);
    assert.equal(rows.length, 5);
    assert.ok(rows.every(row => row.length === 3));
  });
  it('supports text and both object-mode spellings', async () => {
    assert.equal(typeof await csv.generate({ length: 1, encoding: 'utf8' }), 'string');
    for (const flag of ['objectMode', 'object_mode']) {
      const rows = await csv.generate({ length: 2, columns: 2, [flag]: true });
      assert.equal(rows.length, 2);
      assert.equal(rows[0].length, 2);
    }
  });
  it('does not mutate frozen options or columns', async () => {
    const columns = Object.freeze(['ascii', 'int']);
    const options = Object.freeze({ length: 1, object_mode: true, columns });
    assert.equal((await csv.generate(options)).length, 1);
    assert.deepEqual(columns, ['ascii', 'int']);
  });
  it('handles zero length and past deadlines', async () => {
    assert.equal((await csv.generate({ length: 0 })).length, 0);
    assert.equal((await csv.generate({ end: new Date(1) })).length, 0);
  });
  for (const options of [undefined, {}, { length: -1 }, { length: Infinity }, { length: NaN }, { length: 0.5 }, { duration: 0 }, { end: new Date('invalid') }]) {
    it(`rejects unbounded/invalid generation: ${JSON.stringify(options)}`, async () => {
      await assert.rejects(csv.generate(options), RangeError);
    });
  }
  it('propagates invalid column errors', async () => {
    await assert.rejects(csv.generate({ length: 1, columns: ['not-a-generator'] }), /Invalid column/);
  });
  it('rejects errors from custom generators without crashing the process', async () => {
    const error = new Error('generator failed');
    for (const objectMode of [false, true]) {
      await assert.rejects(csv.generate({ length: Number.MAX_SAFE_INTEGER, objectMode, columns: [() => { throw error; }] }), e => e === error);
    }
  });
});

describe('parse', { timeout: 3000 }, () => {
  it('handles strings, Buffers, UTF-8 and Uint8Array slices', async () => {
    const source = 'name,city\nАнтон,香港\n';
    const bytes = Buffer.from('xx' + source + 'xx');
    const view = new Uint8Array(bytes.buffer, bytes.byteOffset + 2, bytes.length - 4);
    for (const input of [source, Buffer.from(source), view]) {
      assert.deepEqual(await csv.parse(input), [['name', 'city'], ['Антон', '香港']]);
    }
  });
  it('handles empty input, BOM, custom delimiters and camelCase options', async () => {
    assert.deepEqual(await csv.parse(''), []);
    assert.deepEqual(await csv.parse('\ufeffa;b\r\n1;2;3', { bom: true, delimiter: ';', relaxColumnCount: true }), [['a', 'b'], ['1', '2', '3']]);
  });
  it('supports object records, casting and record hooks', async () => {
    assert.deepEqual(await csv.parse('name,age\nAnton,42', { columns: true, cast: true, on_record: row => ({ ...row, active: true }) }), [{ name: 'Anton', age: 42, active: true }]);
  });
  it('returns dictionaries for objname, including special keys', async () => {
    const rows = await csv.parse('id,value\n__proto__,safe\na,1', { columns: true, objname: 'id' });
    assert.equal(Object.getPrototypeOf(rows), null);
    assert.deepEqual(rows.__proto__, { id: '__proto__', value: 'safe' });
  });
  it('forwards raw/info and duplicate-column options', async () => {
    const [result] = await csv.parse('a,a\n1,2', { columns: true, group_columns_by_name: true, raw: true, info: true });
    assert.deepEqual(result.record, { a: ['1', '2'] });
    assert.equal(result.info.records, 1);
    assert.equal(result.raw, '1,2');
  });
  it('rejects malformed CSV, invalid options and errors thrown by hooks', async () => {
    await assert.rejects(csv.parse('"unclosed'), { code: 'CSV_QUOTE_NOT_CLOSED' });
    await assert.rejects(csv.parse('a', { delimiter: '' }));
    const error = new Error('cast failed');
    await assert.rejects(csv.parse('a', { cast() { throw error; } }), e => e === error);
  });
  for (const input of [undefined, null, {}, [], 42]) {
    it(`rejects invalid input instead of hanging: ${JSON.stringify(input)}`, async () => {
      await assert.rejects(csv.parse(input), TypeError);
    });
  }
});

describe('stringify', { timeout: 3000 }, () => {
  it('preserves scalar serialization', async () => {
    assert.equal(await csv.stringify([['HK', undefined], ['KLN', null], ['NT', 3]]), 'HK,\nKLN,\nNT,3\n');
    assert.equal(await csv.stringify([]), '');
  });
  it('supports object rows, headers, column selection and custom casts', async () => {
    const rows = [{ name: 'Anton', active: true }];
    assert.equal(await csv.stringify(rows, { header: true, columns: ['name', 'active'], cast: { boolean: value => String(value) } }), 'name,active\nAnton,true\n');
  });
  it('round trips commas, quotes, CR, LF, Unicode and empty strings', async () => {
    const rows = [['a,b', 'a"b', 'a\rb', 'a\nb', '香港', ''], ['x', 'y', 'z', 'a\r\nb', 'Антон', '']];
    assert.deepEqual(await csv.parse(await csv.stringify(rows)), rows);
  });
  it('forwards formula escaping without changing the upstream default', async () => {
    const rows = [['=1+1', '+1', '-1', '@SUM(A1)', '\tvalue', '\rvalue']];
    assert.deepEqual(await csv.parse(await csv.stringify(rows)), rows);
    assert.deepEqual(await csv.parse(await csv.stringify(rows, { escape_formulas: true })), [rows[0].map(value => "'" + value)]);
  });
  it('supports BOM and regexp quote matching', async () => {
    assert.equal(await csv.stringify([['test', 'other']], { bom: true, quoted_match: /^test$/ }), '\ufeff"test",other\n');
  });
  it('rejects invalid options and errors thrown by casts', async () => {
    await assert.rejects(csv.stringify([['a']], { delimiter: {} }));
    const error = new Error('cast failed');
    await assert.rejects(csv.stringify([['a']], { cast: { string() { throw error; } } }), e => e === error);
  });
});

describe('transform', { timeout: 3000 }, () => {
  it('supports sync and Promise handlers', async () => {
    assert.deepEqual(await csv.transform([[1], [2]], row => [row[0] * 2]), [[2], [4]]);
    assert.deepEqual(await csv.transform([[1], [2]], async row => [row[0] * 2]), [[2], [4]]);
  });
  it('supports callbacks, multiple outputs, skipped records and params', async () => {
    assert.deepEqual(await csv.transform(['a'], (row, done) => done(null, row, row.toUpperCase())), ['a', 'A']);
    assert.deepEqual(await csv.transform(['a', 'b'], row => row === 'a' ? null : row), ['b']);
    assert.deepEqual(await csv.transform(['a'], (row, suffix) => row + suffix, { params: '!' }), ['a!']);
    assert.deepEqual(await csv.transform(['a'], (row, done, suffix) => done(null, row + suffix), { params: '!' }), ['a!']);
  });
  it('supports serial async execution and numeric output normalization', async () => {
    assert.deepEqual(await csv.transform([1, 2, 3], async row => row * 2, { parallel: 1 }), ['2', '4', '6']);
  });
  it('returns an empty array for empty input', async () => {
    assert.deepEqual(await csv.transform([], row => row), []);
  });
  it('rejects sync, Promise and callback errors', async () => {
    const error = new Error('transform failed');
    for (const handler of [row => { throw error; }, async row => { throw error; }, (row, done) => done(error)]) {
      await assert.rejects(csv.transform(['a'], handler), e => e === error);
    }
    await assert.rejects(csv.transform(['a'], null), TypeError);
  });
});

for (const method of ['stringify', 'transform']) {
  for (const input of [undefined, null, {}, 'text', [null], [undefined], Array(1)]) {
    it(`${method} rejects invalid records ${JSON.stringify(input)}`, { timeout: 1000 }, async () => {
      await assert.rejects(method === 'transform' ? csv.transform(input, row => row) : csv.stringify(input), TypeError);
    });
  }
}

it('exports working CommonJS, ESM and default methods', async () => {
  const esm = await import('./index.js');
  assert.equal(await esm.stringify([['a']]), 'a\n');
  assert.equal(await esm.default.stringify([['a']]), 'a\n');
  assert.equal(await csv.default.stringify([['a']]), 'a\n');
});
