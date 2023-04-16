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
        { $$ = ["declare_var", [], $2] }
    | dimensions_list INT ID DECLARED
        { $$ = ["declare_var", $dimensions_list, $2] }
    | CHAN OF INT ID DECLARED
        { $$ = ["declare_chan", $4] }
    | dimensions_list CHAN OF INT ID DECLARED
        { $$ = ["declare_chan", $4] }
    | id ASSIGN expr
        { $$ = ["assign_expr", $1, $expr] }
    | id OUT expr
        { $$ = ["out", $1, $expr] }
    | input
        { $$ = $input }
    | PAR proc_block
        { $$ = ["par", $proc_block] }
    | SEQ proc_block
        { $$ = ["seq", $proc_block] }
    | SEQ replicator INDENT proc DEDENT
        { $$ = ["seq", $replicator, $proc] }
    | alternation
        { $$ = $alternation }
    | WHILE expr INDENT proc DEDENT
        { $$ = ["while", $expr, $proc] }
    | conditional 
        { $$ = $conditional }
    ;

dimensions_list
    : LSQB expr RSQB
        { $$ = ["dimensions_list", $expr] }
    | LSQB expr RSQB dimensions_list
        { $dimensions_list.push($expr); $$ = $dimensions_list; }
    ;

id
    : ID
        { $$ = [ "id", $1, [] ] }
    | ID dimensions_list
        { $$ = [ "id", $1, $dimensions_list ] }
    ;

proc_block
    : INDENT proc_list DEDENT 
        { $$ = $proc_list }
    ;

proc_list 
    : proc 
        { $$ = ["proc_list", $proc ] }
    | proc_list NEWLINE proc
        { $proc_list.push($proc); $$ = $proc_list; }
    ;

alternation
    : ALT INDENT alt_list DEDENT
        { $$ = ["alt", $alt_list] }
    ;

alt_list
    : alternative
        { $$ = ["alt_list", $alternative ] }
    | alt_list NEWLINE alternative
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
    | choice_list NEWLINE choice
        { $choice_list.push($choice); $$ = $choice_list; }
    ;

choice
    : conditional
        { $$ = $conditional }
    | expr INDENT proc DEDENT
        { $$ = ["guarded_choice", $expr, $proc] }
    ;

input
    : id IN id
        { $$ = ["in", $1, $3] }
    ;

replicator 
    : ID EQ LSQB expr FOR expr RSQB
        { $$ = ["replicator", $1, $4, $6] }
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
    | id
        { $$ = $id }
    | LPAR expr RPAR
        { $$ = $2 }
    ;

relop
    : GE
        { $$ = "GE" }
    | LE
        { $$ = "LE" }
    | GT
        { $$ = "GT" }
    | LT
        { $$ = "LT" }
    | EQ
        { $$ = "EQ" }
    ;
