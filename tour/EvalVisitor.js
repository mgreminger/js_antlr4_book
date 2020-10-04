const LabelExprVisitor = require('./LabeledExprVisitor').LabeledExprVisitor
const LabeledExprParser = require('./LabeledExprParser.js').LabeledExprParser

class EvalVisitor extends LabelExprVisitor {
    constructor() {
        super();
        this.memory = {};
    }

    visitAssign(ctx) {
        let id = ctx.ID().getText();
        let value = this.visit(ctx.expr());
        this.memory[id] = value;
        return value;
    }

    visitPrintExpr(ctx) {
        let value = this.visit(ctx.expr());
        console.log(value);
        return 0;
    }

    visitInt(ctx) {
        return parseInt(ctx.INT().getText());
    }

    visitId(ctx){
        let id = ctx.ID().getText();
        if(this.memory.hasOwnProperty(id)){
            return this.memory[id];
        } else {
            return 0;
        }
    }

    visitMulDiv(ctx){
        let left = this.visit(ctx.expr(0));
        let right = this.visit(ctx.expr(1));

        if( ctx.op.type === LabeledExprParser.MUL ){
            return left * right;
        } else {
            return left / right;
        }
    }

    visitAddSub(ctx){
        let left = this.visit(ctx.expr(0));
        let right = this.visit(ctx.expr(1));

        if( ctx.op.type === LabeledExprParser.ADD ){
            return left + right;
        } else {
            return left - right;
        }
    }

    visitParens(ctx){
        return this.visit(ctx.expr())
    }

}

module.exports = EvalVisitor;