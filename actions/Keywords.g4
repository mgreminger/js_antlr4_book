grammar Keywords;
@lexer::header {    // place this header action only in lexer, not the parser
    import KeywordsParser from "./KeywordsParser.js";
}

// explicitly define keyword token types to avoid implicit def warnings
tokens { BEGIN, END, IF, THEN, WHILE }

@lexer::members {   // place this class member only in lexer
    this.keywords = {
     "begin": KeywordsParser.BEGIN,
     "end":   KeywordsParser.END,
     "if":    KeywordsParser.IF,
     "then":  KeywordsParser.THEN,
     "while": KeywordsParser.WHILE};
}

stat:   BEGIN stat* END 
    |   IF expr THEN stat
    |   WHILE expr stat
    |   ID '=' expr ';'
	;

expr:   INT | CHAR ;

ID  :   [a-zA-Z]+
        {
        if ( this.keywords.hasOwnProperty(this.text) ) {
            this.type = this.keywords[this.text]; // reset token type
        }
        }
    ;

/** Convert 3-char 'x' input sequence to string x */
CHAR:   '\'' . '\'' {this.text = this.text[1];} ;

INT :   [0-9]+ ;

WS  :   [ \t\n\r]+ -> skip ;
