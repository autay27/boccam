# Boccam - Browser interpreter for Occam 

## issues

- Should have initially defined things like TRUE, FALSE, which are protected values.
- I didn't implement AND, OR, or some of the replicators yet.

## goals - code

- Errors per line number - Give each token a line number, have a syntax analyser step at the start to catch things like multiple output per channel

#### Things the AST checker should do.
- Prevent multiple processes output to the same channel/input from.
- Prevent modifying the replicator's variable inside the relevant process.

## unsure

- At the moment, if you put one PAR of 99 proceses in parallel with one SEQ of 99 processes, you will pick one of the PAR processes 99% of the time... is this what the user expects? is this a good behaviour?
- changle Unrolled handling to get true uniform dist. between threads
- andThen for Outcome - Cleans up the code but it's also kind of creating its own complexity with all the lambdas required
