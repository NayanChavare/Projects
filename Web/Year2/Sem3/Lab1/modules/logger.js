// modules/logger.js
// Custom logger module with timestamped console output.
// Demonstrates module.exports with multiple functions (object export).

function log(message) {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] INFO: ${message}`);
}

function error(message) {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] ERROR: ${message}`);
}

module.exports = { log, error };
