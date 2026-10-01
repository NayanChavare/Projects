const mongoose = require('mongoose');

const connect = mongoose.connect("mongodb+srv://nayan:nayan2312@cluster0.ssnkfvv.mongodb.net/billie");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number,
    status: Boolean
});

const User = mongoose.model('User', userSchema);

module.exports = { connect, User };