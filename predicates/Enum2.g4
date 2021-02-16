grammar Enum2;
@lexer::members {this.java5 = false;}

prog:   (   stat 
        |   enumDecl
        )+
    ;

stat:   ID '=' expr ';' {console.log($ID.text+"="+$expr.text);} ;

expr:   ID
    |   INT
    ;

// No predicate needed here because 'enum' token undefined if !java5
enumDecl
    :   'enum' name=ID '{' ID (',' ID)* '}'
        {console.log("enum "+$name.text);}
    ;

ENUM:   'enum' {this.java5}? ; // must be before ID
ID  :   [a-zA-Z]+ ;


INT :   [0-9]+ ;
WS  :   [ \t\r\n]+ -> skip ;
