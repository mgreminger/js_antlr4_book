// node Calc.js t.expr
const fs = require('fs')

const antlr4 = require('antlr4')
const LabeledExprLexer = require('./LabeledExprLexer.js')
const LabeledExprParser = require('./LabeledExprParser.js')
const EvalVisitor = require('./EvalVisitor.js')

const input_file = fs.readFileSync(process.argv[2], {encoding:'ascii'})

const input = new antlr4.InputStream(input_file)
const lexer = new LabeledExprLexer.LabeledExprLexer(input)
const tokens = new antlr4.CommonTokenStream(lexer)
const parser = new LabeledExprParser.LabeledExprParser(tokens)
const tree = parser.prog()

const eval = new EvalVisitor()
eval.visit(tree)

