# Boccam - Occam in the browser

## About

occam is a concurrent programming language from the 1980s based on the Communicating Sequential Processes algebra (channel based concurrency model which also influenced Go, Erlang, etc). Boccam is an interpreter for occam which can be run in the browser, intended as a tool for teaching concurrency. Parallel execution is simulated via a pseudo-random scheduler. It is extended with I/O and a visualiser so students can create interactive programs.

Try it live [here](https://autay27.github.io/boccam/).

- Parsing & Lexing - Jison (Lex/Yacc-like), Javascript
- Interpreting & Frontend - Elm

For more details about this project, see the final report:

[Final Report PDF](https://github.com/autay27/boccam/blob/main/report/final.pdf)

[Report Text (Markdown)](https://github.com/autay27/boccam/blob/main/report/report.md)

## Known issues

- Replicators not implemented for all constructs
- Examples page not filled out

## Acknowledgements

Many thanks to Professor Alex Rogers at St Anne's College Oxford for supervising this project, as well as Professors Andrew Ker and Bartek Klin at University College Oxford for their advice and support.
