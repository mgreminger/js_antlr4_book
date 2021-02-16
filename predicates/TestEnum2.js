import fs from "fs";

import antlr4 from "antlr4";

import Enum2Lexer from "./Enum2Lexer.js";
import Enum2Parser from "./Enum2Parser.js";

let java5 = false

// check if first arg is -java5
let argOffset = 0;
if (process.argv[2] === "-java5") {
  java5 = true;
  argOffset = 1;
}

if (process.argv.length <= 2 + argOffset) {
  // no file provided, read input from stdin
  let inputData = '';
  process.stdin.on('data', function (data) {
    inputData = inputData.concat(data);
  })
  process.stdin.on('end', function () { processInput(inputData) });
} else {
  // file name provided, use as input
  const inputData = fs.readFileSync(process.argv[2+argOffset], { encoding: 'ascii' });
  processInput(inputData);
}

function processInput(inputData) {
  const input = new antlr4.InputStream(inputData);
  const lexer = new Enum2Lexer(input);
  lexer.java5 = java5;
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new Enum2Parser(tokens);
  parser.prog();
}