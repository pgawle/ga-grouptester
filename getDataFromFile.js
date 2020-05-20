'use strict';

const fs = require("fs");
const parse = require('csv-parse/lib/sync')

const getUrls = (filename) => {
  const data = fs.readFileSync(filename, 'utf-8');
  const records = parse(data, {
    columns: true,
    skip_empty_lines: true
  });

  return records.map(row => {
    return {url: row.URL, group: row['Content Group']}
  });
}

module.exports.getDataFromFile = getUrls;


