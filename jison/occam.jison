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
    | input
        { $$ = $input }
    | PAR proc_block
        { $$ = ["par", $proc_block] }
    | SEQ proc_block
        { $$ = ["seq", $proc_block] }
    | alternation
        { $$ = $alternation }
    | WHILE expr INDENT proc DEDENT
        { $$ = ["while", $expr, $proc] }
    | conditional 
        { $$ = $conditional }
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

alternation
    : ALT INDENT alt_list DEDENT
        { $$ = ["alt", $alt_list] }
    ;

alt_list
    : alternative
        { $$ = ["alt_list", $alternative ] }
    | alt_list alternative
        { $alt_list.push($alternative); $$ = $alt_list; }
    ;

alternative
    :   guard INDENT proc DEDENT
        { $$ = ["alternative", $guard, $proc] }
    | alternation
        { $$ = $alternation }
    ;

guard
    : input
        { $$ = ["guard", "TRUE", $input] }
    | expr AMPERSAND input
        { $$ = ["guard", $expr, $input] }
    | expr AMPERSAND SKIP
        { $$ = ["guard", $expr, ["SKIP"]] }
    ;

conditional
    : IF INDENT choice_list DEDENT
        { $$ = ["cond", $choice_list] }
    ;

choice_list
    : choice
        { $$ = ["choice_list", $choice ] }
    | choice_list choice
        { $cond.push($choice); $$ = $choice_list; }
    ;

choice
    : conditional
        { $$ = $conditional }
    | expr INDENT proc DEDENT
        { $$ = ["guarded_choice", $expr, $proc] }
    ;

input
    : ID IN ID 
        { $$ = ["in", $1, $3] }
    ;

expr
    : simple
        { $$ = $simple }
    | expr relop simple
        { $$ = [$relop, $1, $3] }
    ;

simple
    : term
        { $$ = $term }
    | simple PLUS term
        { $$ = ["PLUS", $1, $3] }
    | simple MINUS term
        { $$ = ["MINUS", $1, $3] }
    ;

term
    : factor
        { $$ = $factor }
    | term TIMES factor
        { $$ = ["TIMES", $1, $3] }
    | term DIV factor
        { $$ = ["DIV", $1, $3] }
    ;

factor
    : INTEGER
        { $$ = Number(yytext);}
    | ID
        { $$ = yytext }
    | LPAR expr RPAR
        { $$ = $2 }
    ;

relop
    : GE
        { $$ = "GT" }
    | LE
        { $$ = "LE" }
    | GT
        { $$ = "GT" }
    | LT
        { $$ = "LT" }
    | EQ
        { $$ = "EQ" }
    ;
