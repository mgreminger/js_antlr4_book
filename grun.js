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

const grammarLexer = require(`${cwd}/${grammarName}Lexer.js`)[`${grammarName}Lexer`]
const grammarParser = require(`${cwd}/${grammarName}Parser.js`)[`${grammarName}Parser`]

let input_data = null

if (program.args.length <= 2){
    // no file provided, read input from stdin
    input_data = ""
    process.stdin.on('data', function(data){
        input_data = input_data.concat(data)
    })
    process.stdin.on('end', processInput)
} else {
    // file name provided, use as input
    input_data = fs.readFileSync(program.args[2], {encoding:'ascii'})
    processInput()
}

function printToken(token){
    let t = token
    console.log(`[@${t.tokenIndex},${t.start}:${t.stop}='${t.text}',<${t.type}>,${t.line}:${t.column}]`)
}


function processInput(){
    const input = new antlr4.InputStream(input_data)
    const lexer = new grammarLexer(input)
    const tokens = new antlr4.CommonTokenStream(lexer)

    tokens.fill()

    if (program.Tokens){
        for (let token of tokens.tokens){
            printToken(token)
        }
    }

    if (program.Tree){
        const parser = new grammarParser(tokens)
        const tree = parser[startingRule]()
        console.log(tree.toStringTree([startingRule]))
    }

}


