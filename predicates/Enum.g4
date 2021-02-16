grammar Enum;

prog:   (   stat 
        |   enumDecl
        )+
    ;

stat:   id '=' expr ';' {console.log($id.text+"="+$expr.text);} ;

expr
    :   id
    |   INT
    ;

enumDecl
    :   {this.java5}? 'enum' name=id '{' id (',' id)* '}'
        {console.log("enum "+$name.text);}
    ;

id  :   ID
    |   {!this.java5}? 'enum'
    ;
    
ID  :   [a-zA-Z]+ ;
INT :   [0-9]+ ;
WS  :   [ \t\r\n]+ -> skip ;
