const express = require('express');
const studentRouter = express.Router();
const {studentModel} = require('../model/student_model');

// Route/API
// Get Method: Home
studentRouter.get('/', (req, res) => {
  res.send({msg: 'Hello! Weclcome to my server!'});
});

// Get Method : /read => Read all users
studentRouter.get('/read', async (req, res) => {
  // Logic to read all users from the database
  try {
    const users = await studentModel.find();
    res.send(users);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

// Get Method : /read/:id => Read a user by ID
studentRouter.get('/read/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await studentModel.findById(id);
    res.send(user);
    } catch (error) {
    res.send("No user found with this ID");
  }
});

// Post Method : /create => Create a new user
studentRouter.post('/create', async (req, res) => {
  // Logic to create a new user in the database via constructor
  const payload = req.body;
  try {
    const newUser = new studentModel(payload);
    await newUser.save();
    res.send('New user created successfully');
  } catch (error) {
    res.send('Something went wrong');
  }
});

// Put Method: /update/:id => Update a user by ID
studentRouter.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await studentModel.findByIdAndUpdate(id, {status: false}, {new: true});
    res.send('User updated successfully');
  } catch (error) {
    res.send('Something went wrong');
  }
});

module.exports = {studentRouter}