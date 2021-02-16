grammar PredKeyword;

@lexer::members { 
    this.HIDDEN = 1;
}

prog: stat+ ;

stat: keyIF expr keyTHEN stat
    | keyCALL ID ';'
    | ';'
    ;

expr: ID
    ;

keyIF : {this._input.LT(1).text === "if"}? ID ;

keyCALL : {this._input.LT(1).text === "call"}? ID ;

keyTHEN : {this._input.LT(1).text === "then"}? ID ;

ID : 'a'..'z'+ ;
WS : (' '|'\n')+ {this._channel = this.HIDDEN;} ;
