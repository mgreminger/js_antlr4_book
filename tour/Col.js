//  node Col.js 1 t.rows
//  first argument specifies col to be printed from file specified in second argument
const fs = require('fs')

const antlr4 = require('antlr4')
const RowsLexer = require('./RowsLexer.js').RowsLexer
const RowsParser = require('./RowsParser.js').RowsParser

const inputFile = fs.readFileSync(process.argv[3], { encoding: 'ascii' })

const input = new antlr4.InputStream(inputFile)
const lexer = new RowsLexer(input)
const tokens = new antlr4.CommonTokenStream(lexer)
const parser = new RowsParser(tokens)

parser.setCol(parseInt(process.argv[2]))

parser.buildParseTrees = false
parser.file()
