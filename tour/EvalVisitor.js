const { LabeledExprVisitor } = require('./LabeledExprVisitor.js')
const { LabeledExprParser } = require('./LabeledExprParser.js')

class EvalVisitor extends LabeledExprVisitor {
  constructor () {
    super()
    this.memory = {}
  }

  visitAssign (ctx) {
    const id = ctx.ID().getText()
    const value = this.visit(ctx.expr())
    this.memory[id] = value
    return value
  }

  visitPrintExpr (ctx) {
    const value = this.visit(ctx.expr())
    console.log(value)
    return 0
  }

  visitInt (ctx) {
    return parseInt(ctx.INT().getText())
  }

  visitId (ctx) {
    const id = ctx.ID().getText()
    if (this.memory.hasOwnProperty(id)) {
      return this.memory[id]
    } else {
      return 0
    }
  }

  visitMulDiv (ctx) {
    const left = this.visit(ctx.expr(0))
    const right = this.visit(ctx.expr(1))

    if (ctx.op.type === LabeledExprParser.MUL) {
      return left * right
    } else {
      return left / right
    }
  }

  visitAddSub (ctx) {
    const left = this.visit(ctx.expr(0))
    const right = this.visit(ctx.expr(1))

    if (ctx.op.type === LabeledExprParser.ADD) {
      return left + right
    } else {
      return left - right
    }
  }

  visitParens (ctx) {
    return this.visit(ctx.expr())
  }
}

module.exports = EvalVisitor
