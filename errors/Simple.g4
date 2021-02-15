grammar Simple;

prog:   classDef+ ; // match one or more class definitions

classDef
    :   'class' ID '{' member+ '}' // a class has one or more members
        {console.log("class "+$ID.text);}
    ;

member
    :   'int' ID ';'                       // field definition
        {console.log("var "+$ID.text);}
    |   'int' f=ID '(' ID ')' '{' stat '}' // method definition
        {console.log("method: "+$f.text);}
    ;

stat:   expr ';'
        {console.log("found expr: "+$text);}
    |   ID '=' expr ';'
        {console.log("found assign: "+$text);}
    ;

expr:   INT 
    |   ID '(' INT ')'
    ;

INT :   [0-9]+ ;
ID  :   [a-zA-Z]+ ;
WS  :   [ \t\r\n]+ -> skip ;
