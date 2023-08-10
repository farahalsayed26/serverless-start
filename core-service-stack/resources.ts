import { readFileSync } from 'fs';

import yml from 'js-yaml';

const files = [
  readFileSync('./src/resources/sns.yml'),
  readFileSync('./src/resources/subs.yml'),
];

export default files.reduce((res, row) => {
  const data = yml.load(row);

  for (const [key, val] of Object.entries<any>(data)) {
    res[key] = { ...res[key], ...val }
  }

  return res;
}, {});