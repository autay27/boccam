all: interpreter parser

interpreter:
	cd elm && elm make src/Main.elm --output elm.js

parser:
	cd jison && jison occam.jison occam_lex.jison