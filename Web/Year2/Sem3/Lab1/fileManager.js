const fs = require('fs');
const path = require('path');
const logger = require('./modules/logger');

const filePath = path.join(__dirname, 'test.txt');

function createFile() {
  console.log('Creating File...');
  fs.writeFile(filePath, 'Hello Node.js\n', (err) => {
    if (err) {
      logger.error(`Failed to create file: ${err.message}`);
      return;
    }
    console.log('File Created');
    readFile();
  });
}

function readFile() {
  console.log('Reading File');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      logger.error(`Failed to read file: ${err.message}`);
      return;
    }
    console.log(data.trim());
    updateFile();
  });
}

function updateFile() {
  fs.appendFile(filePath, 'Learning FS Module\n', (err) => {
    if (err) {
      logger.error(`Failed to update file: ${err.message}`);
      return;
    }
    console.log('File Updated');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        logger.error(`Failed to read updated file: ${err.message}`);
        return;
      }
      console.log(data.trim());
      deleteFile();
    });
  });
}

function deleteFile() {
  fs.unlink(filePath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        logger.error('File does not exist, nothing to delete.');
      } else {
        logger.error(`Failed to delete file: ${err.message}`);
      }
      return;
    }
    console.log('File Deleted');
  });
}

createFile();
