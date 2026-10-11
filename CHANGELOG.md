## 3.0.0 (2026-10-10)

- Publish the stable TypeScript release with generated declarations and a strict
  tsconfig. Accept object rows in stringify and use current upstream option types
  instead of duplicated, incomplete definitions (#4, #7, #9).
- Upgrade csv from 5.x to 6.6.4, including csv-parse 7.0.3, csv-stringify 6.9.0,
  csv-generate 4.6.2 and stream-transform 3.6.0 (#19).
- Await Promise-returning transform handlers; propagate sync, callback and async errors.
- Reject invalid input and null/undefined/sparse records instead of hanging or
  throwing outside the returned Promise. Accept Uint8Array input, including slices.
- Require a stopping condition for generate, and do not mutate its input options.
- Require Node.js 18+. Replace legacy Jest/TSLint tooling with the Node test runner,
  add runtime/type tests and CI, and build the JavaScript and declarations before packing.
- Preserve upstream formula-escaping defaults and document explicit spreadsheet escaping.

## 2.1.2

- Update vulnerable package
