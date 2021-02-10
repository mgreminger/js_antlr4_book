import fs from "fs";

import antlr4 from "antlr4";

import JSONLexer from "./JSONLexer.js";
import JSONParser from "./JSONParser.js";
import JSONListener from "./JSONListener.js";

class XMLEmitter extends JSONListener {
  constructor() {
    super();
    this.xml = new Map();
  }

  getXML(ctx) { return this.xml.get(ctx); }
  setXML(ctx, s) { this.xml.set(ctx, s); }

  exitJson(ctx) {
    this.setXML(ctx, this.getXML(ctx.getChild(0)));
  }

  exitAnObject(ctx) {
    let buf = "\n";
    for (const pctx of ctx.pair()) {
      buf += this.getXML(pctx);
    }
    this.setXML(ctx, buf.toString());
  }

  exitEmptyObject(ctx) {
    this.setXML(ctx, "");
  }

  exitArrayOfValues(ctx) {
    let buf = "\n";
    for (const vctx of ctx.value()) {
      buf += "<element>"; // conjure up element for valid XML
      buf += this.getXML(vctx);
      buf += "</element>";
      buf += "\n";
    }
    this.setXML(ctx, buf.toString());
  }

  exitEmptyArray(ctx) {
    this.setXML(ctx, "");
  }

  exitPair(ctx) {
    const tag = stripQuotes(ctx.STRING().getText());
    const vctx = ctx.value();
    const x = `<${tag}>${this.getXML(vctx)}</${tag}>\n`;
    this.setXML(ctx, x);
  }

  exitObjectValue(ctx) {
    // analogous to String value() {return object();}
    this.setXML(ctx, this.getXML(ctx.object()));
  }

  exitArrayValue(ctx) {
    this.setXML(ctx, this.getXML(ctx.array())); // String value() {return array();}
  }

  exitAtom(ctx) {
    this.setXML(ctx, ctx.getText());
  }

  exitString(ctx) {
    this.setXML(ctx, stripQuotes(ctx.getText()));
  }
}

function stripQuotes(s) {
  if ( s === null || s[0] !== '"' ) {
    return s;
  }
  return s.slice(1, -1);
}

const inputData = fs.readFileSync(process.argv[2], { encoding: 'ascii' });

const input = new antlr4.InputStream(inputData);
const lexer = new JSONLexer(input);
const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new JSONParser(tokens);
parser.buildParseTrees = true;
const tree = parser.json();

const walker = new antlr4.tree.ParseTreeWalker();
const converter = new XMLEmitter();
walker.walk(converter, tree);
console.log(converter.getXML(tree));

