//Adapted from https://github.com/zaach/jison/blob/master/examples/semwhitespace_lex.jison

/* Demonstrates semantic whitespace pseudo-tokens, INDENT/DEDENT. */

id			[a-zA-Z][a-zA-Z0-9]*
spc			[\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]

%s EXPR

%%

"PAR"				return 'PAR';
"SEQ"				return 'SEQ';
"ALT"               return 'ALT';
"&"             return 'AMPERSAND';
"!"				return 'OUT';
"?"				return 'IN';
"SKIP"               return 'SKIP';

"WHILE"			return 'WHILE';
"IF"			return 'IF';
"FOR"           return 'FOR';

":="			return 'ASSIGN';
"INT"			return 'INT';
"CHAN"			return 'CHAN';
"OF"			return 'OF'
":"				return 'DECLARED';

"("             return 'LPAR';
")"             return 'RPAR';
"["             return 'LSQB';
"]"             return 'RSQB';

"+"             return 'PLUS';
"-"             return 'MINUS';
"*"             return 'TIMES';
"/"             return 'DIV';

"AND"			return 'AND';
"OR"			return 'OR';

">="			return 'GE';
"<="			return 'LE';
">"			    return 'GT';
"<"			    return 'LT';
"="             return 'EQ';

{id}				return 'ID';
\d+				return 'INTEGER';


<<EOF>>				return "ENDOFFILE";

<INITIAL>\s*<<EOF>>		%{
					// remaining DEDENTs implied by EOF, regardless of tabs/spaces
					var tokens = [];
					while (0 < _iemitstack[0]) {
						this.popState();
						tokens.unshift("DEDENT");
						_iemitstack.shift();
					}
					if (tokens.length) return tokens;
				%}

//WHY IT ONLY HAPPENS WHEN THERES A CHARACTER BEFORE EOF!?!?!?

[\n\r]+{spc}*/![^\n\r]		/* eat blank lines */

<INITIAL>[\n\r]{spc}*		%{
					var indentation = yytext.length - yytext.search(/\s/) - 1;

					console.log("LINE:" + yytext)
					console.log(indentation)
					console.log(_iemitstack)

					if (indentation > _iemitstack[0]) {
						_iemitstack.unshift(indentation);
						console.log("INDENT")
						return 'INDENT';
					} else if (indentation == _iemitstack[0]) {
						console.log("NEWLINE")
						return 'NEWLINE';
					}
				
					var tokens = [];
				
					while (indentation < _iemitstack[0]) {
						this.popState();
						tokens.unshift("DEDENT");
						_iemitstack.shift();
					}
					if (tokens.length > 0) { console.log(tokens.length + " dedents"); tokens.unshift("NEWLINE"); return tokens; }

				%}
{spc}+				/* ignore all other whitespace */

%%
/* initialize the pseudo-token stack with 0 indents */
var _iemitstack = [0];
