const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number,
    status: Boolean
});

const StudentModel = mongoose.model('Student', studentSchema);

module.exports = { StudentModel };