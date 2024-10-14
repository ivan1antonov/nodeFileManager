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
  console.log(`Thank you for using File Manager, ${userName}, goodbye`);
  process.exit();
});

process.on('exit', (code) => {
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