const express = require('express');
const app = express();

app.use(express.json());

app.get("/", async (res, req) => {
  try {
    res.send("Hello!!!");
  } catch (e) {
    console.log(e);
  }
})

app.get("/read", async (res, req) => {
  try {
    res.send("Read");
  } catch (e) {
    console.log(e);
  }
})

app.listen(3030, async () => {
  try {
    await connect();
    
  } catch (e) {
    console.log(e);
  }
})