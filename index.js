import fs from 'fs/promises';
import { join, dirname } from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const fileName = path.join(__dirname, '')

const args = process.argv.slice(2);
const isUserName = args.filter((el) => el.startsWith('--'));
if (isUserName) {
  let partName = isUserName.split('=');
  let name = partName[1];
  console.log(`Welcome to the File Manager, ${name}!`);
}
