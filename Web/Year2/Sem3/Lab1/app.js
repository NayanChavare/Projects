const isEven = require('./modules/isEven');
const logger = require('./modules/logger');

logger.log('Starting module reusability demo...');

const numbers = [1, 2, 3, 4, 5, 10, 17, 42];

numbers.forEach((num) => {
  if (isEven(num)) {
    console.log(`${num} is Even`);
  } else {
    console.log(`${num} is Odd`);
  }
});

logger.log('Module reusability demo finished.');
