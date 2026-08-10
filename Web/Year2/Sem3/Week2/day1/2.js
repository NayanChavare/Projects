const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  if (req.url == "/home") {
   res.end("Home Page")   
  } else if (req.url == "/about") {
    res.end("About Page")
  } else if (req.url == "/data") {
    const data = fs.readFileSync("./data.json", "utf-8");
    console.log("Data has send to the client");
    res.end(data);
  } else {
    res.end("404 Page Not Found");
  }

});

server.listen(8989,() => {
    console.log("Server is running on port 8989");
});