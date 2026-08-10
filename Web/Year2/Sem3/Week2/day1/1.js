// 
// HTTP Methods
// GET, POST, PUT, DELETE, PATCH
// 

const http = require('http');

const server = http.createServer((req, res) => {
  req
  res.end("Hello to my first server\nThis is a simple HTTP server created using Node.js");
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});

