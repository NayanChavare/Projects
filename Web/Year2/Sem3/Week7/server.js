const exp = require("express");

const { Server } = require("socket.io"); 
const http = require("http");

const app = exp();
const httpServer = http.createServer(app);
const io = new Server(httpServer);
let count = 0;
io.on("connection", (socket) => { 
  // Send message from server to client
  count++;
  console.log("Client connected: ", count);
  socket.emit("one", "Hello from server");
  socket.on("two", (cb) => {
    console.log("Message from client: ", cb);
  })
  socket.on("disconnect", () => { 
    count--;
    console.log("Client disconnected: ", count);
  })
  socket.broadcast.emit("join", "New User Joined!!!")
  io.emit("announcement","Today is last day!!!")
}) 

httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
})