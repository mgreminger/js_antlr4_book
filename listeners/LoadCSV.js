import fs from "fs";

import antlr4 from "antlr4";

import CSVLexer from "./CSVLexer.js";
import CSVParser from "./CSVParser.js";
import CSVListener from "./CSVListener.js";


class Loader extends CSVListener {

  constructor () {
    super();
    /** Load a list of row maps that map field name to value */
    this.rows = [];

    /** Build up a list of fields in current row */
    this.currentRowFieldValues = [];
  }

  exitHdr(ctx) {
    this.header = [...this.currentRowFieldValues];
  }

  enterRow(ctx) {
      this.currentRowFieldValues = [];
  }

  exitRow(ctx) {
    // If this is the header row, do nothing
    // if ( ctx.parent instanceof CSVParser.HdrContext ) return; OR:
    if ( ctx.parentCtx.ruleIndex === CSVParser.RULE_hdr ) return;
    // It's a data row    
    let row = {};
    this.header.forEach((key, i) => row[key] = this.currentRowFieldValues[i]);

    this.rows.push(row);
  }

  exitString(ctx) {
    this.currentRowFieldValues.push(ctx.STRING().getText());
  }

  exitText(ctx) {
    this.currentRowFieldValues.push(ctx.TEXT().getText());
  }

  exitEmpty(ctx) {
    this.currentRowFieldValues.push("");
  }
}

const inputData = fs.readFileSync(process.argv[2], { encoding: 'ascii' });

const lexer = new CSVLexer(new antlr4.InputStream(inputData));
const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new CSVParser(tokens);
parser.buildParseTrees = true; // tell ANTLR to build a parse tree
const tree = parser.file();

const walker = new antlr4.tree.ParseTreeWalker();
const loader = new Loader();
walker.walk(loader, tree);
console.log(loader.rows);


