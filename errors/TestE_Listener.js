import antlr4 from "antlr4";

import SimpleLexer from "./SimpleLexer.js"
import SimpleParser from "./SimpleParser.js"


class VerboseListener extends antlr4.error.ErrorListener {
  syntaxError(recognizer, offendingSymbol,
              line, charPositionInLine,
              msg, e)
  {
      const stack = recognizer.getRuleInvocationStack();
      stack.reverse();
      console.log("rule stack: "+stack);
      console.log("line "+line+":"+charPositionInLine+" at "+
                          offendingSymbol+": "+msg);
  }
}

if (process.argv.length <= 2) {
  // no file provided, read input from stdin
  let inputData = '';
  process.stdin.on('data', function (data) {
    inputData = inputData.concat(data);
  })
  process.stdin.on('end', function () { processInput(inputData) });
} else {
  // file name provided, use as input
  const inputData = fs.readFileSync(process.argv[2], { encoding: 'ascii' });
  processInput(inputData);
}
  
function processInput(inputData) {
  const input = new antlr4.InputStream(inputData);
  const lexer = new SimpleLexer(input);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new SimpleParser(tokens);
  parser.removeErrorListeners(); // remove ConsoleErrorListener
  parser.addErrorListener(new VerboseListener()); // add ours
  parser.prog(); // parse as usual
};
