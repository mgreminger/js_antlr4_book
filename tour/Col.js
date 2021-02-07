//  node Col.js 1 t.rows
//  first argument specifies col to be printed from file specified in second argument
import fs from "fs";

import antlr4 from "antlr4";
import RowsLexer from "./RowsLexer.js";
import RowsParser from "./RowsParser.js";

const inputFile = fs.readFileSync(process.argv[3], { encoding: "ascii" });

const input = new antlr4.InputStream(inputFile);
const lexer = new RowsLexer(input);
const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new RowsParser(tokens);

parser.setCol(parseInt(process.argv[2]));

parser.buildParseTrees = false;
parser.file();
