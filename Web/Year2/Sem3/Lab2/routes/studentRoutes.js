// studentRoutes.js
// All the student related routes are written here using Express Router,
// so that app.js stays clean (modular routing).

const express = require("express");
const router = express.Router();
const students = require("../data/students");

// small helper to find a student by id
function findStudent(id) {
  return students.find(function (student) {
    return student.id === id;
  });
}

// GET /students  -> get all students
router.get("/", (req, res) => {
  res.status(200).json({
    count: students.length,
    students: students
  });
});

// GET /students/:id  -> get one student by id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  // if the id is not a number, it is a bad request
  if (isNaN(id)) {
    return res.status(400).json({ message: "Student id must be a number" });
  }

  const student = findStudent(id);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.status(200).json(student);
});

// POST /students  -> add a new student
router.post("/", (req, res) => {
  const { name, course, age, email } = req.body;

  // basic validation
  if (!name || !course) {
    return res.status(400).json({ message: "Name and course are required" });
  }

  // new id = biggest id till now + 1 (so ids do not repeat after delete)
  const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;

  const newStudent = {
    id: newId,
    name: name,
    course: course,
    age: age || null,
    email: email || null
  };

  students.push(newStudent);

  res.status(201).json({
    message: "Student added successfully",
    student: newStudent
  });
});

// PUT /students/:id  -> update an existing student
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Student id must be a number" });
  }

  const student = findStudent(id);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const { name, course, age, email } = req.body;

  // at least one field should be sent, otherwise there is nothing to update
  if (!name && !course && !age && !email) {
    return res.status(400).json({ message: "Please send at least one field to update" });
  }

  // only update the fields that were sent in the request
  if (name) student.name = name;
  if (course) student.course = course;
  if (age) student.age = age;
  if (email) student.email = email;

  res.status(200).json({
    message: "Student updated successfully",
    student: student
  });
});

// DELETE /students/:id  -> delete a student
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Student id must be a number" });
  }

  const index = students.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Student not found" });
  }

  const deletedStudent = students.splice(index, 1)[0];

  res.status(200).json({
    message: "Student deleted successfully",
    student: deletedStudent
  });
});

module.exports = router;
