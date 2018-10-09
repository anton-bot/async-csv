const csv = require('./');

describe('csv-stringify', () => {
  it('must generate correct CSV string', async () => {
    const sampleData = [
      ['HK', 'Hong Kong Island'],
      ['KLN', 'Kowloon'],
      ['NT', 'New Territories'],
    ];

    const result = await csv.stringify(sampleData);

    expect(result).toBe('HK,Hong Kong Island\nKLN,Kowloon\nNT,New Territories\n');
  })
});
