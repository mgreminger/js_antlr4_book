const fs = require('fs')

const antlr4 = require('antlr4')

const { Command } = require('commander')
const program = new Command()

program
  .option('-tokens', 'Print out a list of tokens')
  .option('-tree', 'Print out the parse tree')
  .arguments('<grammar-name> <start-rule-name> [input-filename...]')

program.parse(process.argv)

const grammarName = program.args[0]
const startingRule = program.args[1]

const cwd = process.cwd()

const GrammarLexer = require(`${cwd}/${grammarName}Lexer.js`)[`${grammarName}Lexer`]
const GrammarParser = require(`${cwd}/${grammarName}Parser.js`)[`${grammarName}Parser`]

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

  if (program.Tree) {
    const parser = new GrammarParser(tokens)
    const tree = parser[startingRule]()
    console.log(tree.toStringTree([startingRule]))
  }
}

function printToken (token) {
  const t = token
  console.log(`[@${t.tokenIndex},${t.start}:${t.stop}='${t.text}',<${t.type}>,${t.line}:${t.column}]`)
}
