#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import open from 'open';

import antlr4 from 'antlr4';

import { Command } from 'commander';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const program = new Command();

program
  .option('-tokens', 'Print out a list of tokens')
  .option('-tree', 'Print out the parse tree')
  .option('-gui', 'Visualize tree')
  .option('-diagnostics', 'Use diagnostic error listener')
  .arguments('<grammar-name> <start-rule-name> [input-filename...]')

program.parse(process.argv)

const grammarName = program.args[0]
const startingRule = program.args[1]

const cwd = process.cwd()

let GrammarLexer = await import(`${cwd}/${grammarName}Lexer.js`);
GrammarLexer = GrammarLexer.default;

let GrammarParser = await import(`${cwd}/${grammarName}Parser.js`);
GrammarParser = GrammarParser.default;

if (program.args.length <= 2) {
  // no file provided, read input from stdin
  let inputData = ''
  process.stdin.on('data', function (data) {
    inputData = inputData.concat(data)
  })
  process.stdin.on('end', function () { processInput(inputData) })
} else {
  // file name provided, use as input
  const inputData = fs.readFileSync(program.args[2], { encoding: 'ascii' })
  processInput(inputData)
}

function processInput (inputData) {
  const input = new antlr4.InputStream(inputData)
  const lexer = new GrammarLexer(input)
  const tokens = new antlr4.CommonTokenStream(lexer)

  tokens.fill()

  if (program.Tokens) {
    tokens.tokens.forEach(printToken)
  }

  const parser = new GrammarParser(tokens)

  if (program.Diagnostics) {
    // parser.removeErrorListeners();
    parser.addErrorListener(new antlr4.error.DiagnosticErrorListener());
    parser._interp.predictionMode = antlr4.atn.PredictionMode.LL_EXACT_AMBIG_DETECTION;
  }

  if (program.Tree || program.Gui) {
    parser.buildParseTrees = true;
  }

  const tree = parser[startingRule]()

  if (program.Tree) {
    console.log(tree.toStringTree(parser.ruleNames))
  } else if (program.Gui) {
    serveGUI(getTreeObject(tree))
  }

}

function printToken (token) {
  const t = token
  const c = t.channel !== 0? 'channel='+t.channel+',' : '';
  console.log(`[@${t.tokenIndex},${t.start}:${t.stop}='${t.text}',<${t.type}>,${c}${t.line}:${t.column}]`)
}

function getTreeObject (treeSource) {
  const ruleNames = treeSource.parser.ruleNames

  function addNode (sourceNode) {
    const targetNode = {}
    if (sourceNode instanceof antlr4.tree.ErrorNode ||
        sourceNode instanceof antlr4.tree.ErrorNodeImpl) {
          targetNode.error = true;
        }
    if (sourceNode.children) {
      // rule node
      targetNode.name = ruleNames[sourceNode.ruleIndex]
      targetNode.children = []
      for (const child of sourceNode.children) {
        targetNode.children.push(addNode(child))
      }
    } else {
      // token node (leaf)
      if (sourceNode.ruleIndex) {
        // leaf happens to be a rule
        targetNode.name = ruleNames[sourceNode.ruleIndex]
      } else {
        // leaf is a token
        targetNode.name = replaceWhitespace(sourceNode.getText())
      }
    }
    return targetNode
  }

  // perform a depth first recursion
  return addNode(treeSource)
}

function replaceWhitespace (input) {
  // Replace white space with printable characters since white space is often tokens
  // at the leaves of the parse tree
  return input.replace('\n', '\\n').replace('\t', '\\t').replace('\f', '\\f')
}

function serveGUI (treeObject) {
  const guiHTML = fs.readFileSync(path.resolve(__dirname, 'visualize_tree.html'))

  const server = new http.Server()
  server.listen(8080)

  server.on('request', (request, response) => {
    const pathname = url.parse(request.url).pathname

    if (pathname === '/') {
      response.writeHead(200, { 'Content-Type': 'text/html' }).end(guiHTML)
    } if (pathname === '/tree' && request.method === 'GET') {
      // client is requesting json representation of tree
      response.writeHead(200, { 'Content-Type': 'application/json' })
        .end(JSON.stringify(treeObject))
    } if (pathname === '/finished' && request.method === 'GET') {
      // client is finished loading, we can exit this process
      response.end(process.exit)
    } else {
      // unrecognized requeset
      response.writeHead(404).end()
    }
  })

  open('http://localhost:8080/')
}
