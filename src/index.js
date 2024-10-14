import fs from 'fs';
import path from 'path';
import readline from 'readline';
import crypto from 'crypto';
import zlib from 'zlib';
import os from 'os';

const args = process.argv.slice(2);
const isUserName = args.find((el) => el.startsWith('--username='));
let userName = '';

if (isUserName) {
  let partName = isUserName.split('=');
  userName = partName[1];
  console.log(`Welcome to the File Manager, ${userName}!`);
  printCurrentDirectory();
} else {
  console.log('User name was not write!');
}

process.on('SIGINT', () => {
  process.exit();
});

process.on('exit', (code) => {
  console.log(`Thank you for using File Manager, ${userName}, goodbye`);
  console.log(`Process was exited with code ${code}`);
});

function printCurrentDirectory() {
  console.log(`You are currently in ${process.cwd()}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function changeDirectory(newPath) {
  try {
    process.chdir(newPath);
    printCurrentDirectory();
  } catch (error) {
    console.log('Operation failed');
  }
}

function listDirectory() {
  try {
    const files = fs.readdirSync(process.cwd());
    const directories = [];
    const fileList = [];

    files.forEach((file) => {
      const fullPath = path.join(process.cwd(), file);
      if (fs.statSync(fullPath).isDirectory()) {
        directories.push(file);
      } else {
        fileList.push(file);
      }
    });

    console.log('Directories:');
    directories.sort().forEach((dir) => console.log(dir));
    console.log('Files:');
    fileList.sort().forEach((file) => console.log(file));
  } catch (error) {
    console.log('Operation failed');
  }
}

function readFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);
  const stream = fs.createReadStream(filePath, 'utf-8');
  
  stream.on('data', (chunk) => console.log(chunk));
  stream.on('error', () => console.log('Operation failed'));
}

function createFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);
  fs.writeFile(filePath, '', (err) => {
    if (err) {
      console.log('Operation failed');
    } else {
      console.log(`${fileName} was created`);
    }
  });
}

function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) console.log('Operation failed');
    else console.log(`${filePath} was deleted`);
  });
}

function renameFile(filePath, newFileName) {
  const newPath = path.join(path.dirname(filePath), newFileName);
  fs.rename(filePath, newPath, (err) => {
    if (err) console.log('Operation failed');
    else console.log(`${filePath} was renamed to ${newFileName}`);
  });
}


function copyFile(source, destination) {
  if (!fs.existsSync(source)) {
    console.log('Source file does not exist');
    return;
  }
  if (!fs.existsSync(destination)) {
    console.log('Destination directory does not exist');
    return;
  }

  const readStream = fs.createReadStream(source);
  const writeStream = fs.createWriteStream(path.join(destination, path.basename(source)));

  readStream.pipe(writeStream);

  writeStream.on('finish', () => console.log(`${source} was copied to ${destination}`));
  writeStream.on('error', () => console.log('Operation failed'));
  readStream.on('error', () => console.log('Operation failed'));
}

function moveFile(source, destination) {
  copyFile(source, destination);
  deleteFile(source);
}

function hashFile(filePath) {
  const absolutePath = path.resolve(filePath);
  const hash = crypto.createHash('sha256');
  const stream = fs.createReadStream(absolutePath);

  stream.on('data', (data) => hash.update(data));
  stream.on('end', () => {
      console.log(`Hash: ${hash.digest('hex')}`);
  });

  stream.on('error', (err) => {
      console.error('Error hashing file:', err.message);
  });
}

function compressFile(source, destination) {
  if (!fs.existsSync(source) || !fs.existsSync(destination)) {
    console.log('Source file or destination directory does not exist');
    return;
  }

  const input = fs.createReadStream(source);
  const output = fs.createWriteStream(destination);
  const brotli = zlib.createBrotliCompress();

  input.pipe(brotli).pipe(output);

  output.on('finish', () => {
      console.log(`${source} was compressed to ${destination}`);
  });
}

function decompressFile(source, destination) {

  
  const input = fs.createReadStream(source);
  const output = fs.createWriteStream(destination);
  const brotli = zlib.createBrotliDecompress();

  input.pipe(brotli).pipe(output);

  output.on('finish', () => {
      console.log(`${source} was decompressed to ${destination}`);
  });
}

function getOSInfo(arg) {
  switch (arg) {
    case '--EOL':
      console.log(JSON.stringify(os.EOL));
      break;
    case '--cpus':
      const cpus = os.cpus();
      console.log(`Number of CPUs: ${cpus.length}`);
      cpus.forEach((cpu, index) => {
        console.log(`CPU ${index + 1}: ${cpu.model} (${cpu.speed / 1000} GHz)`);
      });
      break;
    case '--homedir':
      console.log(`Home directory: ${os.homedir()}`);
      break;
    case '--username':
      console.log(`System username: ${os.userInfo().username}`);
      break;
    case '--architecture':
      console.log(`CPU Architecture: ${os.arch()}`);
      break;
    default:
      console.log('Invalid input');
  }
}

function handleCommand(command) {
  const [cmd, ...args] = command.trim().split(' ');

  switch (cmd) {
    case 'cd':
      changeDirectory(args[0]);
      break;
    case 'up':
      changeDirectory('..');
      break;
    case 'ls':
      listDirectory();
      break;
    case 'cat':
      readFile(args[0]);
      break;
    case 'add':
      createFile(args[0]);
      break;
    case 'rm':
      deleteFile(args[0]);
      break;
    case 'cp':
      copyFile(args[0], args[1]);
      break;
    case 'rn':
      renameFile(args[0], args[1]);
      break;
    case 'mv':
      moveFile(args[0], args[1]);
      break;
    case 'hash':
      hashFile(args[0]);
      break;
    case 'compress':
      compressFile(args[0], args[1]);
      break;
    case 'decompress':
      decompressFile(args[0], args[1]);
      break;
    case 'os':
      getOSInfo(args[0]);
      break;
    case '.exit':
      console.log(`Thank you for using File Manager, ${userName}, goodbye!`);
      process.exit();
      break;
    default:
      console.log('Invalid input');
      break;
  }
}

rl.on('line', (input) => handleCommand(input));