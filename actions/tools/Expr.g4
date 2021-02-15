/** Grammar from tour chapter augmented with actions */
grammar Expr;

// @header {

// }

@parser::members {
    this.memory = new Map();

    this.eval = function (left, op, right) {
        switch ( op ) {
            case ExprParser.MUL : return left * right;
            case ExprParser.DIV : return left / right;
            case ExprParser.ADD : return left + right;
            case ExprParser.SUB : return left - right;
        }
    }
}

stat:   e NEWLINE           {console.log($e.v);}
    |   ID '=' e NEWLINE    {this.memory.set($ID.text, $e.v);}
    |   NEWLINE                   
    ;

e returns [int v]
    : a=e op=('*'|'/') b=e  {$v = this.eval($a.v, $op.type, $b.v);}
    | a=e op=('+'|'-') b=e  {$v = this.eval($a.v, $op.type, $b.v);}  
    | INT                   {$v = $INT.int;}    
    | ID
      {
      const id = $ID.text;
      $v = this.memory.has(id) ? this.memory.get(id) : 0;
      }
    | '(' e ')'             {$v = $e.v;}       
    ; 

MUL : '*' ;
DIV : '/' ;
ADD : '+' ;
SUB : '-' ;

ID  :   [a-zA-Z]+ ;      // match identifiers
INT :   [0-9]+ ;         // match integers
NEWLINE:'\r'? '\n' ;     // return newlines to parser (is end-statement signal)
WS  :   [ \t]+ -> skip ; // toss out whitespace