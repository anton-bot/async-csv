/**
 * @fileoverview ES7 async wrapper for the csv package.
 */

'use strict';

import * as csv from 'csv';

/**
 * Async wrapper for the `csv` package.
 */
class CsvAsync {
  /**
   * @param {object} [options]
   * @param {number} options.seed
   * @param {number} options.columns
   * @param {number} options.length
   */
  static generate(options?: CsvGenerateOptions) {
    return new Promise((resolve, reject) => {
      const callback = (error, output) =>
        error
          ? reject(error)
          : resolve(output);

      options
        ? csv.generate(options, callback)
        : csv.generate(callback);
    });
  }

  /**
   * Parses a CSV file into an array of rows.
   * @param {string} input
   * @param {object} [options]
   */
  static parse<T = any>(input: string, options?: CsvParseOptions): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const callback = (error, output) =>
        error
          ? reject(error)
          : resolve(output);

      options
        ? csv.parse(input, options, callback)
        : csv.parse(input, callback);
    });
  }

  /**
   *
   * @param {string[][]} data
   * @param {function} handler
   * @param {object} [options]
   */
  static transform(data, handler, options?: Record<string, any>) {
    return new Promise((resolve, reject) => {
      const callback = (error, output) =>
        error
          ? reject(error)
          : resolve(output);

      options
        ? csv.transform(data, handler, options, callback)
        : csv.transform(data, handler, callback);
    });
  }

  /**
   * Converts an array of rows into a CSV string.
   * @param {string[][]} data
   * @param {object} options
   */
  static stringify(data: (string|number|null|undefined)[][], options?: CsvStringifyOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      const callback = (error, output) =>
        error
          ? reject(error)
          : resolve(output);

      options
        ? csv.stringify(data, options, callback)
        : csv.stringify(data, callback);
    });
  }
}

type CsvGenerateOptions = {
  /**
   * Define the number of generated fields and the generation method.
   */
  columns?: number | string[];

  /**
   * Set the field delimiter.
   */
  delimiter?: string;

  /**
   * Period to run in milliseconds.
   */
  duration?: number;

  /**
   * If specified, then buffers will be decoded to strings using the specified encoding.
   */
  encoding?: string;

  /**
   * When to stop the generation.
   */
  end?: number | Date;

  /**
   * One or multiple characters to print at the end of the file; only apply when objectMode is disabled.
   */
  eof?: boolean | string;

  /**
   * Generate buffers equals length as defined by the `highWaterMark` option.
   */
  fixed_size?: boolean;
  fixedSize?: boolean;

  /**
   * The maximum number of bytes to store in the internal buffer before ceasing to read from the underlying resource.
   */
  high_water_mark?: number;
  highWaterMark?: number;

  /**
   * Number of lines or records to generate.
   */
  length?: number;

  /**
   * Maximum number of characters per word.
   */
  max_word_length?: number;
  maxWordLength?: number;

  /**
   * Whether this stream should behave as a stream of objects.
   */
  object_mode?: boolean
  objectMode?: boolean;

  /**
   * One or multiple characters used to delimit records.
   */
  row_delimiter?: string;

  /**
   * Generate idempotent random characters if a number provided.
   */
  seed?: boolean | number;

  /**
   * The time to wait between the generation of each records
   */
  sleep?: number;
};

type CsvParseOptions = {
  /**
   * If true, the parser will attempt to convert read data types to native types.
   * @deprecated Use {@link cast}
   */
  auto_parse?: boolean | CastingFunction;
  /**
   * If true, the parser will attempt to convert read data types to dates. It requires the "auto_parse" option.
   * @deprecated Use {@link cast_date}
   */
  auto_parse_date?: boolean | CastingDateFunction;
  /**
   * If true, detect and exclude the byte order mark (BOM) from the CSV input if present.
   */
  bom?: boolean;
  /**
   * If true, the parser will attempt to convert input string to native types.
   * If a function, receive the value as first argument, a context as second argument and return a new value. More information about the context properties is available below.
   */
  cast?: boolean | CastingFunction;
  /**
   * If true, the parser will attempt to convert input string to dates.
   * If a function, receive the value as argument and return a new value. It requires the "auto_parse" option. Be careful, it relies on Date.parse.
   */
  cast_date?: boolean | CastingDateFunction;
  /**
   * List of fields as an array,
   * a user defined callback accepting the first line and returning the column names or true if autodiscovered in the first CSV line,
   * default to null,
   * affect the result data set in the sense that records will be objects instead of arrays.
   */
  columns?: ColumnOption[] | boolean | ((record: any) => ColumnOption[]);
  /**
   * Treat all the characters after this one as a comment, default to '' (disabled).
   */
  comment?: string;
  /**
   * Set the field delimiter. One character only, defaults to comma.
   */
  delimiter?: string | Buffer;
  /**
   * Set the escape character, one character only, defaults to double quotes.
   */
  escape?: string | Buffer;
  /**
   * Start handling records from the requested number of records.
   */
  from?: number;
  /**
   * Start handling records from the requested line number.
   */
  from_line?: number;
  /**
   * Generate two properties `info` and `record` where `info` is a snapshot of the info object at the time the record was created and `record` is the parsed array or object.
   */
  info?: boolean;
  /**
   * If true, ignore whitespace immediately following the delimiter (i.e. left-trim all fields), defaults to false.
   * Does not remove whitespace in a quoted field.
   */
  ltrim?: boolean;
  /**
   * Maximum numer of characters to be contained in the field and line buffers before an exception is raised,
   * used to guard against a wrong delimiter or record_delimiter,
   * default to 128000 characters.
   */
  max_record_size?: number;
  /**
   * Name of header-record title to name objects by.
   */
  objname?: string;
  /**
   * Optional character surrounding a field, one character only, defaults to double quotes.
   */
  quote?: string | boolean | Buffer;
  /**
   * Generate two properties raw and row where raw is the original CSV row content and row is the parsed array or object.
   */
  raw?: boolean;
  /**
   * Preserve quotes inside unquoted field.
   */
  relax?: boolean;
  /**
   * Discard inconsistent columns count, default to false.
   */
  relax_column_count?: boolean;
  /**
   * One or multiple characters used to delimit record rows; defaults to auto discovery if not provided.
   * Supported auto discovery method are Linux ("\n"), Apple ("\r") and Windows ("\r\n") row delimiters.
   */
  record_delimiter?: string | string[] | Buffer | Buffer[];
  /**
   * If true, ignore whitespace immediately preceding the delimiter (i.e. right-trim all fields), defaults to false.
   * Does not remove whitespace in a quoted field.
   */
  rtrim?: boolean;
  /**
   * Dont generate empty values for empty lines.
   * Defaults to false
   */
  skip_empty_lines?: boolean;
  /**
   * Skip a line with error found inside and directly go process the next line.
   */
  skip_lines_with_error?: boolean;
  /**
   * Don't generate records for lines containing empty column values (column matching /\s*\/), defaults to false.
   */
  skip_lines_with_empty_values?: boolean;
  /**
   * Stop handling records after the requested number of records.
   */
  to?: number;
  /**
   * Stop handling records after the requested line number.
   */
  to_line?: number;
  /**
   * If true, ignore whitespace immediately around the delimiter, defaults to false.
   * Does not remove whitespace in a quoted field.
   */
  trim?: boolean;
};

type CastingFunction = (value: string, context: CastingContext) => any;

type CastingDateFunction = (value: string, context: CastingContext) => Date;

type ColumnOption = string | undefined | null | false | { name: string };

type ParseColumnOption =  string | undefined | null;

interface CastingContext {
  readonly column?: number | string;
  readonly empty_lines: number;
  readonly header: boolean;
  readonly index: number;
  readonly quoting: boolean;
  readonly lines: number;
  readonly records: number;
  readonly invalid_field_length: number;
}

type Cast<T> = (value: T, context: CastingContext) => string;

type PlainObject<T> = Record<string, T>;

type CsvStringifyOptions = {
  /**
   * Key-value object which defines custom cast for certain data types
   */
  cast?: {
    boolean?: Cast<boolean>;
    date?: Cast<Date>;
    number?: Cast<number>;
    /**
     * Custom formatter for generic object values
     */
    object?: Cast<Record<string, any>>;
    string?: Cast<string>;
  };
  /**
   * List of fields, applied when `transform` returns an object
   * order matters
   * read the transformer documentation for additionnal information
   * columns are auto discovered in the first record when the user write objects
   * can refer to nested properties of the input JSON
   * see the "header" option on how to print columns names on the first line
   */
  columns?: string[] | PlainObject<string> | ParseColumnOption[];
  /**
   * Set the field delimiter, one character only, defaults to a comma.
   */
  delimiter?: string | Buffer;
  /**
   * Add the value of "options.RecordDelimiter" on the last line, default to true.
   */
  eof?: boolean;
  /**
   * Defaults to the escape read option.
   */
  escape?: string | Buffer;
  header?: boolean;
  /**
   * The quote characters, defaults to the ", an empty quote value will preserve the original field.
   */
  quote?: string | Buffer | boolean;
  /**
   * Boolean, default to false, quote all the non-empty fields even if not required.
   */
  quoted?: boolean;

  /**
   * Boolean, no default, quote empty fields and overrides `quoted_string` on empty strings when defined.
   */
  quoted_empty?: boolean;
  /**
   * Boolean, default to false, quote all fields matching a regular expression.
   */
  quoted_match?: boolean;
  /**
   * Boolean, default to false, quote all fields of type string even if not required.
   */
  quoted_string?: boolean;
  /**
   * String used to delimit record rows or a special value
   * special values are 'auto', 'unix', 'mac', 'windows', 'ascii', 'unicode'
   * defaults to 'auto' (discovered in source or 'unix' if no source is specified).
   */
  record_delimiter?: RecordDelimiter;
};

type RecordDelimiter = string | Buffer | 'auto' | 'unix' | 'mac' | 'windows' | 'ascii' | 'unicode';

export default CsvAsync;
export const generate = CsvAsync.generate;
export const parse = CsvAsync.parse;
export const transform = CsvAsync.transform;
export const stringify = CsvAsync.stringify;
