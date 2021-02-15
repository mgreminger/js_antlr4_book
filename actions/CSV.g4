grammar CSV;


/** Derived from rule "file : hdr row+ ;" */
file
locals [i=0]
     : hdr ( rows+=row[$hdr.text.split(",")] {$i++;} )+
       {
       console.log  ($i+" rows");
       for (const r of $rows) {
           console.log("row token interval: "+r.getSourceInterval());
       }
       }
     ;

hdr : row[null] {console.log("header: '"+$text.trim()+"'");} ;

/** Derived from rule "row : field (',' field)* '\r'? '\n' ;" */
row[columns] returns [values]
locals [col=0]
@init {
    $values = new Map();
}
@after {
    if ($values !== null && $values.size > 0) {
        const valuesObject = {};
        $values.forEach((value, key) => (valuesObject[key] = value));
        console.log("values = " + JSON.stringify(valuesObject));
    }
}
// rule row cont'd...
    :   field
        {
        if ($columns !== null) {
            $values.set($columns[$col++].trim(), $field.text.trim());
        }
        }
        (   ',' field
            {
            if ($columns !== null) {
                $values.set($columns[$col++].trim(), $field.text.trim());
            }
            }
        )* '\r'? '\n'
    ;

field
    :   TEXT
    |   STRING
    |
    ;

TEXT : ~[,\n\r"]+ ;
STRING : '"' ('""'|~'"')* '"' ; // quote-quote is an escaped quote
