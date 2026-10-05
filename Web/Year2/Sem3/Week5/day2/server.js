const express = require('express');
const {connect,UserModel} = require('./db');

const app = express();
app.use(express.json());

// Route/API
// Get Method: Home
app.get('/', (req, res) => {
  res.send({msg: 'Hello! Weclcome to my server!'});
});

// Get Method : /read => Read all users
app.get('/read', async (req, res) => {
  // Logic to read all users from the database
  try {
    const users = await UserModel.find();
    res.send(users);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

// Get Method : /read/:id => Read a user by ID
app.get('/read/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById(id);
    res.send(user);
    } catch (error) {
    res.send("No user found with this ID");
  }
});

// Post Method : /create => Create a new user
app.post('/create', async (req, res) => {
  // Logic to create a new user in the database via constructor
  const payload = req.body;
  try {
    const newUser = new UserModel(payload);
    await newUser.save();
    res.send('New user created successfully');
  } catch (error) {
    res.send('Something went wrong');
  }
});

// Put Method: /update/:id => Update a user by ID
app.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await UserModel.findByIdAndUpdate(id, {status: false}, {new: true});
    res.send('User updated successfully');
  } catch (error) {
    res.send('Something went wrong');
  }
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

