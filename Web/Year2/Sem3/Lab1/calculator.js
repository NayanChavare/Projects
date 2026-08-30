const logger = require('./modules/logger');
const args = process.argv.slice(2);
const [operation, numOne, numTwo] = args;

const a = parseFloat(numOne);
const b = parseFloat(numTwo);

function calculate(op, x, y) {
  switch (op) {
    case 'add':
      return x + y;
    case 'sub':
      return x - y;
    case 'mul':
      return x * y;
    case 'div':
      if (y === 0) {
        throw new Error('Division by zero is not allowed');
      }
      return x / y;
    default:
      throw new Error(`Invalid operation: "${op}". Use add, sub, mul, or div.`);
  }
}

if (!operation || isNaN(a) || isNaN(b)) {
  logger.error('Invalid input. Usage: node calculator.js <add|sub|mul|div> <num1> <num2>');
  process.exit(1);
}

try {
  const result = calculate(operation, a, b);
  logger.log(`Operation: ${operation} | ${a} and ${b}`);
  console.log(`Result: ${result}`);
} catch (err) {
  logger.error(err.message);
  process.exit(1);
}
