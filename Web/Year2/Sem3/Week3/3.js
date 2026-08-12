const express = require('express');
const app = express();
const port = 3000;
const date = require('date-and-time');

// Get Route
app.get('/', (req, res) => {
  res.send('Hello World! Current Date and Time: ' + date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});