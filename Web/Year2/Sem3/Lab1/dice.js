const crypto = require('crypto');
const logger = require('./modules/logger');

// Generates a secure random integer between 1 and 6 (inclusive)
function rollDice() {
  // randomInt(min, max) -> min inclusive, max exclusive
  return crypto.randomInt(1, 7);
}

const rolls = parseInt(process.argv[2], 10) || 1;

logger.log(`Rolling dice ${rolls} time(s)...`);

for (let i = 1; i <= rolls; i++) {
  const value = rollDice();
  console.log(`Roll ${i}: Dice Rolled: ${value}`);
}
