//base is the calculator grammar given in the docs, plus https://github.com/zaach/jison/blob/master/examples/semwhitespace.jison

/* operator associations and precedence */

%options token-stack

%start process

%% 

process
    : proc
        { console.log("AST: %j", $proc); }
    ;

proc
    : ID OUT expr 
        { console.log("matching out"); $$ = ["out", $1, $expr] }
    | ID IN ID 
        { $$ = ["in", $1, $expr] }
    | PAR proc_block
        { console.log("matching par"); $$ = ["par", $proc_block] }
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
        {console.log("matching int");$$ = Number(yytext);}
    ;