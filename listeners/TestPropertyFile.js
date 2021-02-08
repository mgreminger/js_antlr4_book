import fs from "fs";

import antlr4 from "antlr4";

import PropertyFileLexer from "./PropertyFileLexer.js";
import PropertyFileParser from "./PropertyFileParser.js";
import PropertyFileListener from "./PropertyFileListener.js";

class PropertyFileLoader extends PropertyFileListener {
  constructor() {
    super();
    this.props = {};
  }

  exitProp(ctx) {
    const id = ctx.ID().getText();
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

// create a standard ANTLR parse tree walker
const walker = new antlr4.tree.ParseTreeWalker();

// create listener then feed to walker
const loader = new PropertyFileLoader();
walker.walk(loader, tree); // walk parse tree
console.log(loader.props); // print results
