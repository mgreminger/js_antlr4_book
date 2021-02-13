grammar Simple;

prog:   classDef+ ; // match one or more class definitions

classDef
    :   'class' ID '{' member+ '}' // a class has one or more members
        {console.log("class "+$ctx.ID().toString());}
    ;

member
    :   'int' ID ';'                       // field definition
        {console.log("var "+$ctx.ID().toString());}
    |   'int' f=ID '(' ID ')' '{' stat '}' // method definition
        {console.log("method: "+$ctx.f.text);}
    ;

stat:   expr ';'
        {console.log("found expr: "+$ctx.getText());}
    |   ID '=' expr ';'
        {console.log("found assign: "+$ctx.getText());}
    ;

expr:   INT 
    |   ID '(' INT ')'
    ;

INT :   [0-9]+ ;
ID  :   [a-zA-Z]+ ;
WS  :   [ \t\r\n]+ -> skip ;
