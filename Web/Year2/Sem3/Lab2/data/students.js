// students.js
// Student data is stored here in a simple array (in-memory).
// No database is used in this assignment, so data resets when the server restarts.

let students = [
  { id: 1, name: "Rahul Verma", course: "BCA", age: 20, email: "rahul@example.com" },
  { id: 2, name: "Priya Nair", course: "BTech", age: 21, email: "priya@example.com" },
  { id: 3, name: "Amit Joshi", course: "BCA", age: 19, email: "amit@example.com" },
  { id: 4, name: "Sneha Patel", course: "BSc Data Science", age: 20, email: "sneha@example.com" }
];

module.exports = students;
