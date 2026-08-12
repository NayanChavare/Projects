// import greet from "./1.js";

// Import via commonJS module syntax
const greet = require("./1.js");
greet();

const iseven = require("is-even");

console.log(iseven(3));
console.log(iseven(4));

const env = require("dotenv");
env.config();

console.log(process.env.Name);
console.log(process.env.Sem);
console.log(process.env.Key);
console.log(process.env.Password);
