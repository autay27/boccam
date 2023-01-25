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
    : INT ID DECLARED
        { $$ = ["declare_var", $2] }
    | CHAN OF INT ID DECLARED
        { $$ = ["declare_chan", $4] }
    | ID ASSIGN expr
        { $$ = ["assign_expr", $1, $expr] }
    | ID ASSIGN proc
        { $$ = ["assign_proc", $1, $proc] }
    | ID OUT expr 
        { $$ = ["out", $1, $expr] }
    | ID IN ID 
        { $$ = ["in", $1, $3] }
    | PAR proc_block
        { $$ = ["par", $proc_block] }
    | SEQ proc_block
        { $$ = ["seq", $proc_block] }
    | WHILE expr INDENT proc DEDENT
        { $$ = ["while", $expr, $proc] }
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
    : operand 
        { $$ = [$operand] }
    | expr binop operand
        { $$ = [$binop, $1, $3] }
    ;

operand
    : INTEGER
        { $$ = Number(yytext);}
    | ID
        { $$ = yytext }
    | LPAR expr RPAR
        { $$ = [$2] }
    ;

binop
    : PLUS
        { $$ = yytext }
    | MINUS
        { $$ = yytext }
    | TIMES
        { $$ = yytext }
    | DIV
        { $$ = yytext }
    | AND
        { $$ = yytext }
    | OR
        { $$ = yytext }
    ;