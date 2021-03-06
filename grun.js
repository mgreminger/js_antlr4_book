#!/usr/bin/env node

import http from "http";
import fs from "fs";
import path from "path";
import open from "open";

import antlr4 from "antlr4";

import { Command } from "commander";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const program = new Command();

program
  .option("-tokens", "Print out a list of tokens")
  .option("-tree", "Print out the parse tree")
  .option("-gui", "Visualize tree")
  .option("-diagnostics", "Use diagnostic error listener")
  .option(
    "-encoding <encoding>",
    "Encoding when reading input file. Default is utf8"
  )
  .option("-port <port>", "Port to use for -gui option, default is 8080")
  .arguments("<grammar-name> <start-rule-name> [input-filename...]");

program.parse(process.argv);

const grammarName = program.args[0];
const startingRule = program.args[1];

const cwd = process.cwd();

if (!grammarName || !startingRule) {
  console.log(
    "Must specify grammar name and starting rule name. Run with --help option for more details"
  );
  process.exit();
}

let GrammarLexer = await import(`${cwd}/${grammarName}Lexer.js`).catch(() => {
  console.log(
    `Unable to import ${grammarName}Lexer.js. Did you forget to run antlr4 with the -Dlanguage=JavaScript option?`
  );
  process.exit();
});
GrammarLexer = GrammarLexer.default;

let GrammarParser = await import(`${cwd}/${grammarName}Parser.js`).catch(() => {
  console.log(
    `Unable to import ${grammarName}Parser.js. Did you forget to run antlr4 with the -Dlanguage=JavaScript option?`
  );
  process.exit();
});
GrammarParser = GrammarParser.default;

if (program.args.length <= 2) {
  // no file provided, read input from stdin
  let inputData = "";
  console.log("Waiting for input, to finish, use ctrl-D...")
  process.stdin.on("data", function (data) {
    inputData = inputData.concat(data);
  });
  process.stdin.on("end", function () {
    processInput(inputData);
  });
} else {
  // file name provided, use as input
  let encoding = program.Encoding ? program.Encoding : "utf8";
  const inputData = fs.readFileSync(program.args[2], { encoding: encoding });
  processInput(inputData);
}

function processInput(inputData) {
  const input = new antlr4.InputStream(inputData);
  const lexer = new GrammarLexer(input);
  const tokens = new antlr4.CommonTokenStream(lexer);

  tokens.fill();

  if (program.Tokens) {
    tokens.tokens.forEach(printToken);
  }

  const parser = new GrammarParser(tokens);

  if (program.Diagnostics) {
    // parser.removeErrorListeners();
    parser.addErrorListener(new antlr4.error.DiagnosticErrorListener());
    parser._interp.predictionMode =
      antlr4.atn.PredictionMode.LL_EXACT_AMBIG_DETECTION;
  }

  if (program.Tree || program.Gui) {
    parser.buildParseTrees = true;
  }

  const tree = parser[startingRule]();

  if (program.Tree) {
    console.log(tree.toStringTree(parser.ruleNames));
  } else if (program.Gui) {
    let port = program.Port ? parseInt(program.Port) : 8080;
    serveGUI(getTreeObject(tree), port);
  }
}

function printToken(token) {
  const t = token;
  const c = t.channel !== 0 ? "channel=" + t.channel + "," : "";
  const text = replaceWhitespace(t.text);
  let tokenName;
  if (t.type === antlr4.Token.EOF) {
    tokenName = "EOF";
  } else {
    tokenName = GrammarLexer.literalNames[t.type]
      ? GrammarLexer.literalNames[t.type]
      : GrammarLexer.symbolicNames[t.type];
  }
  console.log(
    `[@${t.tokenIndex},${t.start}:${t.stop}='${text}',<${tokenName}>,${c}${t.line}:${t.column}]`
  );
}

function getTreeObject(treeSource) {
  const ruleNames = treeSource.parser.ruleNames;

  function addNode(sourceNode) {
    const targetNode = {};
    if (
      sourceNode instanceof antlr4.tree.ErrorNode ||
      sourceNode instanceof antlr4.tree.ErrorNodeImpl
    ) {
      targetNode.error = true;
    }
    if (sourceNode.children) {
      // rule node
      targetNode.name = ruleNames[sourceNode.ruleIndex];
      targetNode.children = [];
      for (const child of sourceNode.children) {
        targetNode.children.push(addNode(child));
      }
    } else {
      // token node (leaf)
      if (sourceNode.ruleIndex) {
        // leaf happens to be a rule
        targetNode.name = ruleNames[sourceNode.ruleIndex];
      } else {
        // leaf is a token
        targetNode.name = replaceWhitespace(sourceNode.getText());
      }
    }
    return targetNode;
  }

  // perform a depth first recursion
  return addNode(treeSource);
}

function replaceWhitespace(input) {
  // Replace white space with printable characters since white space is often tokens
  // at the leaves of the parse tree
  return input
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t")
    .replace(/\f/g, "\\f");
}

function serveGUI(treeObject, port) {
  const guiHTML = fs.readFileSync(
    path.resolve(__dirname, "visualize_tree.html")
  );

  const server = new http.Server();
  server.listen(port);

  server.on("request", (request, response) => {
    const pathname = request.url;

    if (pathname === "/") {
      response.writeHead(200, { "Content-Type": "text/html" }).end(guiHTML);
    }
    if (pathname === "/tree" && request.method === "GET") {
      // client is requesting json representation of tree
      response
        .writeHead(200, { "Content-Type": "application/json" })
        .end(JSON.stringify(treeObject));
    }
    if (pathname === "/finished" && request.method === "GET") {
      // client is finished loading, we can exit this process
      response.end(process.exit);
    } else {
      // unrecognized requeset
      response.writeHead(404).end();
    }
  });

  open(`http://localhost:${port}/`);
}
