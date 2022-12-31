//Adapted from https://github.com/zaach/jison/blob/master/examples/semwhitespace_lex.jison

/* Demonstrates semantic whitespace pseudo-tokens, INDENT/DEDENT. */

id			[a-zA-Z][a-zA-Z0-9]*
spc			[\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]

%s EXPR

%%

"PAR"				return 'PAR';
"SEQ"				return 'SEQ'
"!"				return 'OUT';
"?"				return 'IN';
"WHILE"			return 'WHILE';

":="			return 'ASSIGN';
"INT"			return 'INT';
"CHAN"			return 'CHAN';
"OF"			return 'OF'
":"				return 'DECLARED';

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
					if (indentation > _iemitstack[0]) {
						_iemitstack.unshift(indentation);
						return 'INDENT';
					}
				
					var tokens = [];
				
					while (indentation < _iemitstack[0]) {
						this.popState();
						tokens.unshift("DEDENT");
						_iemitstack.shift();
					}
					if (tokens.length) return tokens;
				%}
{spc}+				/* ignore all other whitespace */

%%
/* initialize the pseudo-token stack with 0 indents */
_iemitstack = [0];