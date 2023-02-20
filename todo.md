# Boccam - Browser interpreter for Occam 

## issues

- EOF-related parsing/lexing problem. Actually there seem to be a lot of problems here related to trailing spaces and such.
- Should have initially defined things like TRUE, FALSE, which are protected values.
- We need some refactoring wrt how errors are handled, at the moment there is a lot of converting Err to RunErr etc which could be done automatically.
- Generally the code is messy and things are not cleanly separated out.

## goals - code

- Implementing all the parallel parts of occam 1

What I don't have (overview): WAIT, SKIP, IF, FOR, DEF, Named processes, a lot of operators/initial constants, PRI ALT, PRI PAR, Replicators
For details, I've made a new checklist file...

- hook up with codemirror
- Errors per line number - Give each token a line number, have a syntax analyser step at the start to catch things like multiple output per channel

## goals - report

- Testing
    - Parser - 10 code snippets with/without erros etc.

We just need a JS script that reads a file which has the code and the expected output of the parser. Jeez.

    - Interpreter - tast first n things coming out of display(?) / Could even dump the state and somehow check against it . (would also be good to printout the state for teaching purpose....)

OK, so the format I want is 'here is a program, and the state should eventually reach this/go through these transitions/at the nth step should be this' OMG it's almost like formal verification except I really don't want that level of detail LOL

- Evaluation - Do what you would do at a bigger scale  for ~2 people - i.e. get test subjects, ask thm to do a task, Designing INteractive Systems, Benyon Turner Turner - Evaluation chapter

## unsure

- to implement the type system from occam 2.1 so that users can easily work with strings and chars. > Enough to be able to draw primitves to the screen (maybe even have sounds) so users can make graphics easily 
- changle Unrolled handling to get true uniform dist. between threads
- andThen for Outcome - Cleans up the code but it's also kind of creating its own complexity with all the lambdas required

---

## discussion

Testing - Check the first (eg 50) and don't even have a det.random seed, just pick the nth one every time
Just mention that you could examine state etc and do cafv but it's not within the scope of small educational project.

Calculation spitting out one number is a good start
Ways to test all constructs in the language
Think bavck to how you tested it when coding

Thinking about demos
 - interleaving ( In and out )
 - pipe sort - User input numbers?
 - anything interactive

 Evaluation - give an exercise and ask how people think it compares to scala concurrent progamming?

 Todo for next time
 - Test up to 50 
 - Gt, Lt etc
 - IF, FOR
