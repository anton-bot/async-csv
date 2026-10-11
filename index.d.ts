import * as csv from 'csv';
export type CsvGenerateOptions = csv.generator.Options;
export type CsvParseOptions<T = unknown> = csv.parser.Options<T>;
export type CsvStringifyOptions = csv.stringifier.Options;
export type CsvTransformOptions = csv.transformer.Options;
export type TransformCallback<T> = (error?: Error | null, ...records: T[]) => void;
export type TransformHandler<T, U> = (record: T, callback: TransformCallback<U>, params?: unknown) => U | void | Promise<U | void>;
export type TransformResult<T> = T extends number ? string : Exclude<T, null | undefined | void>;
/** Promise-based access to the CSV callback APIs. Results are held in memory. */
declare class CsvAsync {
    static generate(options: CsvGenerateOptions & ({
        objectMode: true;
    } | {
        object_mode: true;
    })): Promise<unknown[][]>;
    static generate(options: CsvGenerateOptions & {
        encoding: BufferEncoding;
        objectMode?: false;
        object_mode?: false;
    }): Promise<string>;
    static generate(options?: CsvGenerateOptions): Promise<Buffer | string | unknown[][]>;
    static parse<T = unknown>(input: string | Uint8Array, options: CsvParseOptions<T> & {
        objname: string | number | Buffer;
    }): Promise<Record<string, T>>;
    static parse(input: string | Uint8Array): Promise<string[][]>;
    static parse<T = unknown>(input: string | Uint8Array, options?: CsvParseOptions<T>): Promise<T[]>;
    static transform<T, U, P>(data: T[], handler: (record: T, params: P) => U | void | Promise<U | void>, options: CsvTransformOptions & {
        params: P;
    }): Promise<TransformResult<U>[]>;
    static transform<T, U, P>(data: T[], handler: (record: T, callback: TransformCallback<U>, params: P) => void, options: CsvTransformOptions & {
        params: P;
    }): Promise<TransformResult<U>[]>;
    static transform<T, U = unknown>(data: T[], handler: TransformHandler<T, U>, options?: CsvTransformOptions): Promise<TransformResult<U>[]>;
    static stringify(data: csv.stringifier.Input, options?: CsvStringifyOptions): Promise<string>;
}
export default CsvAsync;
export declare const generate: typeof CsvAsync.generate;
export declare const parse: typeof CsvAsync.parse;
export declare const transform: typeof CsvAsync.transform;
export declare const stringify: typeof CsvAsync.stringify;
