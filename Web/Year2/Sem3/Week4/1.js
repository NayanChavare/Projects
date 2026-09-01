const app = require('express');
const fs = require('fs');

app.use(express.json());
app.post("/createnewstudent", (req, res) => {
  const payload = req.body;
  console.log(payload);

  const data = JSON.parse(fs.readFileSync("./krmu.json", "utf-8"));
  data.push(payload);
  fs.writeFileSync("./krmu.json", JSON.stringify(data));
  res.send("Student created successfully");
});