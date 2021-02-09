import antlr4 from "antlr4";

import LExprLexer from "./LExprLexer.js";
import LExprParser from "./LExprParser.js";
import LExprListener from "./LExprListener.js";

/** Sample "calculator" using property of nodes */
class EvaluatorWithProps extends LExprListener {
  constructor () {
    super();
    this.values = new Map();
  }

  /** Need to pass e's value out of rule s : e ; */
  exitS(ctx) {
      this.setValue(ctx, this.getValue(ctx.e())); // like: int s() { return e(); }
  }

  exitMult(ctx) {
      const left = this.getValue(ctx.e(0));  // e '*' e   # Mult
      const right = this.getValue(ctx.e(1));
      this.setValue(ctx, left * right);
  }

  exitAdd(ctx) {
      const left = this.getValue(ctx.e(0)); // e '+' e   # Add
      const right = this.getValue(ctx.e(1));
      this.setValue(ctx, left + right);
  }

  exitInt(ctx) {
      const intText = ctx.INT().getText(); // INT   # Int
      this.setValue(ctx, parseInt(intText));
  }

  setValue(node, value) { 
    this.values.set(node, value);
  }

  getValue(node) { 
    return this.values.get(node);
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
  const lexer = new LExprLexer(input);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new LExprParser(tokens);
  parser.buildParseTrees = true;      // tell ANTLR to build a parse tree
  const tree = parser.s(); // parse
  // show tree in text form
  console.log(tree.toStringTree(parser.ruleNames));

  const walker = new antlr4.tree.ParseTreeWalker();
  const evalProp = new EvaluatorWithProps();
  walker.walk(evalProp, tree);
  console.log("properties result = " +evalProp.getValue(tree));
}
