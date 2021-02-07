// node Calc.js t.expr
import fs from "fs";

import antlr4 from "antlr4";
import LabeledExprLexer from "./LabeledExprLexer.js";
import LabeledExprParser from "./LabeledExprParser.js";
import EvalVisitor from "./EvalVisitor.js";

const inputFile = fs.readFileSync(process.argv[2], { encoding: "ascii" });

const input = new antlr4.InputStream(inputFile);
const lexer = new LabeledExprLexer(input);
const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new LabeledExprParser(tokens);
const tree = parser.prog();

const visitor = new EvalVisitor();
visitor.visit(tree);
