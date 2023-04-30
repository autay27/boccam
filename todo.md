# Boccam - Browser interpreter for Occam 

## issues

- Should have initially defined things like TRUE, FALSE, which are protected values.
- Not all tests pass right now, I didn't implement AND, OR, or some of the replicators yet.
- Change DISPLAY channel to SERIAL.

- Why does run 50 steps say 'Terminated' when it should say 'blocked' (and step says  'blocked' as it should) on exercise example. Meanwhile step should say 'Terminated' sometimes and doesn't. Is it just because I gave them different error messages.

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


Evaluation checklist
- Design and implement a better UI
- Improve error handling
- Implement the 'run forever with a time delay' button
- Read the Evaluation chapter
- Design the user evaluation test
- Do self evaluation

- Do what you would do at a bigger scale  for ~2 people - i.e. get test subjects, ask thm to do a task, Designing INteractive Systems, Benyon Turner Turner - Evaluation chapter

## unsure

- At the moment, if you put one PAR of 99 proceses in parallel with one SEQ of 99 processes, you will pick one of the PAR processes 99% of the time... is this what the user expects? is this a good behaviour?
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
