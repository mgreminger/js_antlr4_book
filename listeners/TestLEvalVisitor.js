import fs from "fs";

import antlr4 from "antlr4";

import LExprLexer from "./LExprLexer.js";
import LExprParser from "./LExprParser.js";
import LExprVisitor from "./LExprVisitor.js";

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


class EvalVisitor extends LExprVisitor {
    visitMult(ctx) {
        return this.visit(ctx.e(0)) * this.visit(ctx.e(1));
    }

    visitAdd(ctx) {
        return this.visit(ctx.e(0)) + this.visit(ctx.e(1));
    }

    visitInt(ctx) {
        return parseInt(ctx.INT().getText());
    }
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

  const evalVisitor = new EvalVisitor();
  const result = evalVisitor.visit(tree);
  console.log("visitor result = " + result);
}

