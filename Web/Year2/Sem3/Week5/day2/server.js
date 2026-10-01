const express = require('express');
const {connect,User} = require('./db');

const app = express();

// Route/API
// Get Method: Home
app.get('/', (req, res) => {
  res.send({msg: 'Hello! Weclcome to my server!'});
});


app.listen(8000, async () => {
  // Connect to MongoDB Atlas
  try {
    await connect;
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.log(error);
  }
  console.log('Server is running on port http://localhost:8000');
})

