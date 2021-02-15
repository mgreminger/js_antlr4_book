import readline from "readline";

import antlr4 from "antlr4";

import ExprLexer from "./ExprLexer.js"
import ExprParser from "./ExprParser.js"


const parser = new ExprParser(null); // share single parser instance
parser.buildParseTrees = false;          // don't need trees

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', handleLine);

function handleLine ( expr ) {           
    // create new lexer and token stream for each line (expression)
    const input = new antlr4.InputStream(expr+"\n");
    const lexer = new ExprLexer(input);
    const tokens = new antlr4.CommonTokenStream(lexer);
    parser.setInputStream(tokens); // notify parser of new token stream
    parser.stat();                 // start the parser
}
  
