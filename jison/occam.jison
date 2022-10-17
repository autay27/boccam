//base is the calculator grammar given in the docs, plus https://github.com/zaach/jison/blob/master/examples/semwhitespace.jison

/* operator associations and precedence */

%options token-stack

%start process

%% 

process
    : proc ENDOFFILE
        { console.log("AST: %j", $proc); return $proc }
    ;

proc
    : ID OUT expr 
        { $$ = ["out", $1, $expr] }
    | ID IN ID 
        { $$ = ["in", $1, $expr] }
    | PAR proc_block
        { $$ = ["par", $proc_block] }
    ;

proc_block
    : INDENT proc_list DEDENT 
        { $$ = $proc_list }
    ;

proc_list 
    : proc 
        { $$ = ["proc_list", $proc ] }
    | proc_list proc
        { $proc_list.push($proc); $$ = $proc_list; }
    ;

expr
    : INTEGER
        { $$ = Number(yytext);}
    ;