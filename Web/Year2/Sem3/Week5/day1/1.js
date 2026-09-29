// step 1: import mongoose for uses case

const mongoose = require("mongoose");

// step 2: create a schema for the user collection
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
  status: Boolean,
}, {
  versionKey: false,
  // timestamps: true,
});

// step 3: create a model for the user collection
const userModel = mongoose.model("User", userSchema);

// step 4: create a function to connect to the database and perform CRUD operations
const main = async () => {
  // 1. connect to the database
  await mongoose.connect("mongodb+srv://nayan:nayan2312@cluster0.ssnkfvv.mongodb.net/?appName=Cluster0/employee");
  console.log("Database connected");

  // 2. Discconect from the database
  // await mongoose.disconnect();
  // console.log("Database disconnected");

  // 3. Create a new user
  await userModel.insertOne({
    name: "Something",
    email: "something@gmail.com",
    age: 23,
    status: true,
  });

  console.log("New User created successfully");
  
  // 4. Read all users
  const user = await userModel.find();
  console.log(user);

  // 5. Update a user
  await userModel.updateOne({ name: "Something" }, { $set: { age: 24 } });
  console.log("User updated successfully");

  // Show all user after update
  const updatedUser = await userModel.find();
  console.log(updatedUser);

  // 6. Delete a user
  await userModel.deleteOne({ name: "Something" });
  console.log("User deleted successfully");

  // Show all user after delete
  const deletedUser = await userModel.find();
  console.log(deletedUser);

  // 7. finda a user by age
  const find = await userModel.find({ age: 21 });
  console.log(find);
};

main();