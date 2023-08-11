all: interpreter parser codemirror

interpreter:
	cd elm && elm make src/Main.elm --output elm.js

parser:
	cd jison && jison occam.jison occam_lex.jison

codemirror:
	node_modules/.bin/rollup editor.mjs -f iife -o editor.bundle.js   -p @rollup/plugin-node-resolve --name "codemirror"
