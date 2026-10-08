const mongoose = require('mongoose');
const dotenv = require('dotenv');
const {StudentModel} = require('./model/student_model');
dotenv.config();
const connect = mongoose.connect(process.env.MONGO_URL);

module.exports = { connect, UserModel };