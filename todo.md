# Boccam - Browser interpreter for Occam 

## issues

- Should have initially defined things like TRUE, FALSE, which are protected values.
- Not all tests pass right now, I didn't implement AND, OR, or some of the replicators yet.

## goals - code

- Errors per line number - Give each token a line number, have a syntax analyser step at the start to catch things like multiple output per channel

#### Things the AST checker should do.
- Prevent multiple processes output to the same channel/input from.
- Prevent modifying the replicator's variable inside the relevant process.


## goals - report

- Testing
    - Parser - 10 code snippets with/without erros etc.


Evaluation checklist
- Design and implement a better UI
- Do the user evaluation
- Do self evaluation

- Do what you would do at a bigger scale  for ~2 people - i.e. get test subjects, ask thm to do a task, Designing INteractive Systems, Benyon Turner Turner - Evaluation chapter

## unsure

- At the moment, if you put one PAR of 99 proceses in parallel with one SEQ of 99 processes, you will pick one of the PAR processes 99% of the time... is this what the user expects? is this a good behaviour?
- changle Unrolled handling to get true uniform dist. between threads
- andThen for Outcome - Cleans up the code but it's also kind of creating its own complexity with all the lambdas required

---

## discussion

Calculation spitting out one number is a good start
Ways to test all constructs in the language
Think bavck to how you tested it when coding

Thinking about demos
 - interleaving ( In and out )
 - pipe sort - User input numbers?
 - anything interactive

 Evaluation - give an exercise and ask how people think it compares to scala concurrent progamming?

 Todo for next time
 - FOR
