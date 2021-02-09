import fs from "fs";

import antlr4 from 'antlr4';

import PropertyFileLexer from "./PropertyFileLexer.js";
import PropertyFileParser from "./PropertyFileParser.js";
import PropertyFileVisitor from "./PropertyFileVisitor.js";

class CustomPropertyFileVisitor extends PropertyFileVisitor {
  constructor () {
    super();
    this.props = {};
  }

  visitProp(ctx) {
      const id = ctx.ID().getText(); // prop : ID '=' STRING '\n' ;
      const value = ctx.STRING().getText();
      this.props[id] = value;
  }
}

const inputFile = fs.readFileSync(process.argv[2], { encoding: "ascii" });

const input = new antlr4.InputStream(inputFile);
const lexer = new PropertyFileLexer(input);
const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new PropertyFileParser(tokens);
const tree = parser.file();

const loader = new CustomPropertyFileVisitor();
loader.visit(tree);
console.log(loader.props); // print results