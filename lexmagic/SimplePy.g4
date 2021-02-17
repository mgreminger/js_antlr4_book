/** Explore Python newline and comment processing */
grammar SimplePy;

@lexer::members {
    this.nesting = 0;
}

file:   stat+ EOF ;

stat:   assign NEWLINE
    |   expr NEWLINE
    |   NEWLINE         // ignore blank lines
    ;

assign: ID '=' expr ;

expr:   expr '+' expr
    |   '(' expr ')'
    |   call
    |   list
    |   ID
    |   INT
    ;

call:   ID '(' ( expr (',' expr)* )? ')' ;

list:   '[' expr (',' expr)* ']' ;

ID  :   [a-zA-Z_] [a-zA-Z_0-9]* ;

INT :   [0-9]+ ;

LPAREN    : '(' {this.nesting++;} ;

RPAREN    : ')' {this.nesting--;} ;

LBRACK    : '[' {this.nesting++;} ;

RBRACK    : ']' {this.nesting--;} ;

/** Nested newline within a (..) or [..] are ignored. */
IGNORE_NEWLINE
    :   '\r'? '\n' {this.nesting>0}? -> skip
    ;

/** A logical newline that ends a statement */
NEWLINE
    :   '\r'? '\n'
    ;

/** Warning: doesn't handle INDENT/DEDENT Python rules */
WS  :   [ \t]+ -> skip
    ;

/** Ignore backslash newline sequences. This disallows comments
 *  after the backslash because newline must occur next.
 */
LINE_ESCAPE
    :   '\\' '\r'? '\n' -> skip
    ;

/** Match comments. Don't match \n here; we'll send NEWLINE to the parser. */
COMMENT
    :    '#' ~[\r\n]* -> skip
    ;
