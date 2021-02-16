grammar PredCppStat;

@parser::members {
this.types = ["T"];
this.istype = function() { return this.types.includes(this.getCurrentToken().text); }
}

stat:   decl ';'  {console.log("decl "+$decl.text);}
    |   expr ';'  {console.log("expr "+$expr.text);}
    ;

decl:   ID ID                         // E.g., "Point p"
    |   {this.istype()}? ID '(' ID ')'     // E.g., "Point (p)", same as ID ID
    ;

expr:   INT                           // integer literal
    |   ID                            // identifier
    |   {!this.istype()}? ID '(' expr ')'  // function call
    ;

ID  :   [a-zA-Z]+ ;
INT :   [0-9]+ ;
WS  :   [ \t\n\r]+ -> skip ;