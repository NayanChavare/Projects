# Student Management REST API

Lab Assignment 2 – Web Dev III (Node.js & Express Backend), Unit 2.

A simple REST API built with Express.js to perform CRUD operations on student records.
Data is stored in a normal JavaScript array (in memory) — no database is used.

## Tech Stack

- Node.js
- Express.js
- Postman (for testing)

## Folder Structure

```
student-management-api/
├── app.js                  // main server file
├── routes/
│   └── studentRoutes.js    // all student routes (modular routing)
├── middleware/
│   └── logger.js           // custom logger middleware
├── data/
│   └── students.js         // student data (array)
├── package.json
└── README.md
```

## How to Run

```bash
npm install
npm start
```

Server runs on: http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /students | Get all students |
| GET | /students/:id | Get a single student by id |
| POST | /students | Add a new student |
| PUT | /students/:id | Update an existing student |
| DELETE | /students/:id | Delete a student |

## Status Codes Used

| Code | Meaning | When it is used |
| --- | --- | --- |
| 200 | OK | Data fetched, updated or deleted successfully |
| 201 | Created | New student added |
| 400 | Bad Request | Missing name/course, or id is not a number |
| 404 | Not Found | Student id does not exist / wrong route |
| 500 | Internal Server Error | Something breaks on the server |

## Testing in Postman

**1. Get all students**
`GET http://localhost:3000/students`

**2. Get student by id**
`GET http://localhost:3000/students/1`

**3. Add new student**
`POST http://localhost:3000/students`
Body → raw → JSON:

```json
{
  "name": "Karan Mehta",
  "course": "BSc Data Science",
  "age": 20,
  "email": "karan@example.com"
}
```

**4. Update student**
`PUT http://localhost:3000/students/2`
Body → raw → JSON:

```json
{
  "course": "MCA"
}
```

**5. Delete student**
`DELETE http://localhost:3000/students/3`

### Error cases to test

- `GET /students/99` → 404 Student not found
- `GET /students/abc` → 400 Student id must be a number
- `POST /students` with empty body → 400 Name and course are required

## Custom Middleware

`logger.js` prints the request method, URL and time for every request, for example:

```
[20/9/2026, 10:15:42 am] GET /students
```

## Note

Since the data is stored in memory, all added/updated/deleted records reset
whenever the server restarts.
