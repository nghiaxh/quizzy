import { readFileSync } from 'fs';

const version = process.argv[2];
if (!version) {
  console.error('Usage: node extract-changelog.js <version>');
  process.exit(1);
}

const content = readFileSync('CHANGELOG.md', 'utf8');
const lines = content.split('\n');
let inSection = false;
let result = [];

for (const line of lines) {
  if (line.startsWith('## v' + version)) {
    inSection = true;
    continue;
  }
  if (inSection && line.startsWith('## ')) break;
  if (inSection) result.push(line);
}

const output = result.join('\n').trim();
if (!output) {
  console.error('No changelog entry found for version ' + version);
  process.exit(1);
}

console.log(output);
