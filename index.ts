import * as csv from 'csv';

export type CsvGenerateOptions = csv.generator.Options;
export type CsvParseOptions<T = unknown> = csv.parser.Options<T>;
export type CsvStringifyOptions = csv.stringifier.Options;
export type CsvTransformOptions = csv.transformer.Options;
export type TransformCallback<T> = (error?: Error | null, ...records: T[]) => void;
export type TransformHandler<T, U> = (
  record: T,
  callback: TransformCallback<U>,
  params?: unknown,
) => U | void | Promise<U | void>;
export type TransformResult<T> = T extends number ? string : Exclude<T, null | undefined | void>;

function assertRecords(data: unknown): asserts data is unknown[] {
  if (!Array.isArray(data)) {
    throw new TypeError('Records must be an array.');
  }
  for (const record of data) {
    if (record === null || record === undefined) {
      throw new TypeError('Records must not contain null, undefined, or empty slots.');
    }
  }
}

/** Promise-based access to the CSV callback APIs. Results are held in memory. */
class CsvAsync {
  static generate(options: CsvGenerateOptions & ({ objectMode: true } | { object_mode: true })): Promise<unknown[][]>;
  static generate(options: CsvGenerateOptions & { encoding: BufferEncoding; objectMode?: false; object_mode?: false }): Promise<string>;
  static generate(options?: CsvGenerateOptions): Promise<Buffer | string | unknown[][]>;
  static generate(options: CsvGenerateOptions = {}): Promise<Buffer | string | unknown[][]> {
    return new Promise((resolve, reject) => {
      const { length, duration, end } = options;
      const deadline = end instanceof Date ? end.getTime() : end;
      if (length !== undefined && (!Number.isSafeInteger(length) || length < -1)) {
        throw new RangeError('length must be a non-negative safe integer, or -1 with a time limit.');
      }
      const bounded = (length !== undefined && length >= 0)
        || (typeof duration === 'number' && Number.isFinite(duration) && duration > 0)
        || (typeof deadline === 'number' && Number.isFinite(deadline) && deadline !== 0);
      if (!bounded) {
        throw new RangeError('generate requires a finite length, positive duration, or nonzero end time.');
      }
      // csv-generate normalizes the options and columns array in place.
      const normalized = { ...options };
      let generator: csv.generator.Generator;
      if (Array.isArray(options.columns)) {
        normalized.columns = options.columns.map(column => typeof column !== 'function' ? column : context => {
          try {
            return column(context);
          } catch (error) {
            // Upstream invokes custom generators outside its error-event handling.
            reject(error);
            context.options.end = 1;
            generator.destroy();
            return '';
          }
        });
      }
      generator = csv.generate(normalized, (error, output) => {
        if (error) reject(error);
        else resolve(output as Buffer | string | unknown[][]);
      });
    });
  }

  static parse<T = unknown>(input: string | Uint8Array, options: CsvParseOptions<T> & { objname: string | number | Buffer }): Promise<Record<string, T>>;
  static parse(input: string | Uint8Array): Promise<string[][]>;
  static parse<T = unknown>(input: string | Uint8Array, options?: CsvParseOptions<T>): Promise<T[]>;
  static parse(input: string | Uint8Array, options: CsvParseOptions = {}): Promise<unknown[] | Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      if (typeof input !== 'string' && !(input instanceof Uint8Array)) {
        throw new TypeError('CSV input must be a string, Buffer, or Uint8Array.');
      }
      const data = typeof input === 'string' ? input : Buffer.from(input.buffer, input.byteOffset, input.byteLength);
      // Upstream's non-column overload assumes string[] even for cast/on_record.
      csv.parse(data, options as csv.parser.Options, (error, output) => {
        if (error) reject(error);
        else resolve(output);
      });
    });
  }

  static transform<T, U, P>(data: T[], handler: (record: T, params: P) => U | void | Promise<U | void>, options: CsvTransformOptions & { params: P }): Promise<TransformResult<U>[]>;
  static transform<T, U, P>(data: T[], handler: (record: T, callback: TransformCallback<U>, params: P) => void, options: CsvTransformOptions & { params: P }): Promise<TransformResult<U>[]>;
  static transform<T, U = unknown>(data: T[], handler: TransformHandler<T, U>, options?: CsvTransformOptions): Promise<TransformResult<U>[]>;
  static transform(data: unknown[], handler: (...args: never[]) => unknown, options: CsvTransformOptions = {}): Promise<unknown[]> {
    return new Promise((resolve, reject) => {
      assertRecords(data);
      if (typeof handler !== 'function') throw new TypeError('Transform handler must be a function.');
      // Upstream's callback declaration incorrectly describes the output as a string.
      csv.transform(data, handler as csv.transformer.Handler, options, (error, output: unknown) => {
        if (error) reject(error);
        else resolve(output as unknown[]);
      });
    });
  }

  static stringify(data: csv.stringifier.Input, options: CsvStringifyOptions = {}): Promise<string> {
    return new Promise((resolve, reject) => {
      assertRecords(data);
      csv.stringify(data, options, (error, output) => {
        if (error) reject(error);
        else resolve(output);
      });
    });
  }
}

export default CsvAsync;
export const generate = CsvAsync.generate;
export const parse = CsvAsync.parse;
export const transform = CsvAsync.transform;
export const stringify = CsvAsync.stringify;
