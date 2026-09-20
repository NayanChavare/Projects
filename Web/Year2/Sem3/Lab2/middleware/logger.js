// logger.js
// Custom middleware. It runs before every request reaches the routes
// and prints the request method, the URL and the time in the terminal.

function logger(req, res, next) {
  const time = new Date().toLocaleString();
  console.log(`[${time}] ${req.method} ${req.originalUrl}`);
  next(); // pass the request to the next middleware / route
}

module.exports = logger;
