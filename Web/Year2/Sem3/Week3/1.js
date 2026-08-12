// User defined module

function greet() {
  console.log("Hello, World!");
}

// Export the greet function so that it can be used in other files
// commonJS module export syntax
module.exports = greet;