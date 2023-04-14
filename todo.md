# Boccam - Browser interpreter for Occam 

## issues

- EOF-related parsing/lexing problem. Actually there seem to be a lot of problems here related to trailing spaces and such. Either fix it or make it unfindable.
- Should have initially defined things like TRUE, FALSE, which are protected values.

- Replicator is not working anymore? What changed? Oh my god, I was doing everything with the changes from the stupid testing package. Need to roll that back.

## goals - code

- hook up with codemirror
- Errors per line number - Give each token a line number, have a syntax analyser step at the start to catch things like multiple output per channel
- Graphics
- Enough of occam to run game of life
    - process names, probably
    - 2d arrays
    - drawing to pixels (on the "update" command)
    - how to describe colours to send to pixels

For the graphics,  a pixelated screen and set the color of each brick by a number. Then, you only need to implement 2d arrays and you can draw to the screen easily.
> Game of life becomes ez
> 1d automata
> Compare to LOGO turtle teaching program.

#### Things the AST checker should do.
- Prevent multiple processes output to the same channel/input from.
- Prevent modifying the replicator's variable inside the relevant process.


## goals - report

- Testing
    - Parser - 10 code snippets with/without erros etc.
    - AST generator/ error checker
    - Interpreter - test first n things coming out of display(?) with det. seed / Could even dump the state and somehow check against it . (would also be good to printout the state for teaching purpose....) Just mention that you could examine state etc and do cafv but it's not within the scope of small educational project.

- Evaluation - Do what you would do at a bigger scale  for ~2 people - i.e. get test subjects, ask thm to do a task, Designing INteractive Systems, Benyon Turner Turner - Evaluation chapter

## unsure

- change the det.seed to always 1 instead of always n because I don't think that was really what AR meant.
- to implement the type system from occam 2.1 so that users can easily work with strings and chars. > Enough to be able to draw primitves to the screen (maybe even have sounds) so users can make graphics easily 
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
