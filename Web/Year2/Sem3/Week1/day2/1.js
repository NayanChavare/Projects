// NPM Core Modules
// 
// 1.  OS Module
// step 1 import the OS module
// The OS module provides a number of operating system-related utility methods. It can be accessed using:

const os = require('os')

console.log(os.version()) // returns the operating system version
console.log(os.type()) // returns the operating system name
console.log(os.platform()) // returns the operating system platform
console.log(os.arch()) // returns the operating system architecture
console.log(os.cpus()) // returns the number of CPU cores
console.log(os.freemem()) // returns the free memory in bytes
console.log(os.totalmem()) // returns the total memory in bytes
console.log(os.homedir()) // returns the home directory of the current user
console.log(os.tmpdir()) // returns the temporary directory of the current user

// 2. DNS Module
// The DNS module provides a way of performing name resolution. It can be accessed using:
const dns = require('dns')

console.log(dns.getServers()) // returns the list of DNS servers


// 3. Path Module
// The Path module provides utilities for working with file and directory paths. It can be accessed using:
const path = require('path')
console.log(path.resolve()) // returns the absolute path of the current working directory
console.log(path.resolve() + path.join("/test/images")) // returns the absolute path of the current working directory + /test/images


// 4. File System Module
// The File System module provides an API for interacting with the file system in a manner closely modeled around standard POSIX functions. It can be accessed using:
const fs = require('fs')

fs.readFile("../day1/1.js", "utf-8", (err, data) => {
    if (err) {
        console.log("wrong path")
    } else {
        console.log(data)
    }
}) // returns the content of the file at the specified path asynchronously

// Read file synchronously
const data = fs.readFileSync("../day1/1.js", "utf-8") // returns the content of the file at the specified path synchronously
console.log(data)

// Write file asynchronously
fs.writeFile("../day1/1.js", "console.log('Hello World')", (err) => {
    if (err) {
        console.log("wrong path")
    } else {
        console.log("Data written successfully")
    }
}) // writes the specified content to the file at the specified path asynchronously

// Write file synchronously
fs.writeFileSync("../day1/1.js", "console.log('Hello World')") // writes the specified content to the file at the specified path synchronously
console.log("Data written successfully")

// Append file asynchronously
fs.appendFile("../day1/1.js", "\nconsole.log('Hello World!!')", (err) => {
    if (err) {
        console.log("wrong path")
    } else {
        console.log("Data appended successfully")
    }
}) // appends the specified content to the file at the specified path asynchronously

// Append file synchronously
fs.appendFileSync("../day1/1.js", "\nconsole.log('How Are You?')") // appends the specified content to the file at the specified path synchronously
console.log("Data appended successfully")
