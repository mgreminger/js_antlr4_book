grammar Rows;

@parser::members { // add members to generated RowsParser
    this.col = 1 // default col is 1
    this.setCol = function (col){
        this.col = col
    }
}

file: (row NL)+ ;

row
locals [int i=0]
    : (   STUFF
          {
          $i++;
          if ( $i == this.col ){
              console.log($STUFF.text);
          }
          }
      )+
    ;

TAB  :  '\t' -> skip ;   // match but don't pass to the parser
NL   :  '\r'? '\n' ;     // match and pass to the parser
STUFF:  ~[\t\r\n]+ ;     // match any chars except tab, newline
