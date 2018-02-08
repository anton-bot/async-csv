/**
 * @fileoverview ES7 wrapper for the csv package.
 */

'use strict';

const csv = require('csv');

class CsvAsync {
  /**
   * @param {object} options
   * @param {number} options.seed
   * @param {number} options.columns
   * @param {number} options.length
   */
  static generate(options) {
    return new Promise((resolve, reject) => {
      csv.generate(options, (error, output) => {
        if (error) {
          reject(error);
        } else {
          resolve(output);
        }
      });
    });
  }

  /**
   *
   * @param {string} input
   * @param {object} options
   */
  static parse(input, options) {
    return new Promise((resolve, reject) => {
      csv.parse(input, options, (error, output) => {
        if (error) {
          reject(error);
        } else {
          resolve(output);
        }
      });
    });
  }

  /**
   *
   * @param {string[][]} data
   * @param {function} handler
   * @param {object} [options]
   */
  static transform(data, handler, options) {
    return new Promise((resolve, reject) => {
      if (options) {
        csv.transform(data, handler, options, (error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      } else {
        csv.transform(data, handler, (error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      }
    });
  }

  /**
   *
   * @param {string[][]} data
   * @param {object} options
   */
  static stringify(data, options) {
    return new Promise((resolve, reject) => {
      if (options) {
        csv.stringify(data, options, (error, output) => {
          if (error) {
            reject(error);
          } else {
            resolve(output);
          }
        });
      } else {
        csv.stringify(data, (error, output) => {
          if (error) {
            reject(error);
          } else {
            resolve(output);
          }
        });
      }
    });
  }
}

module.exports = CsvAsync;
