# Boccam - Browser interpreter for Occam 

## issues

- EOF-related parsing/lexing problem. Actually there seem to be a lot of problems here related to trailing spaces and such.
- Should have initially defined things like TRUE, FALSE, which are protected values.
- We need some refactoring wrt how errors are handled, at the moment there is a lot of converting Err to RunErr etc which could be done automatically.
- Generally the code is messy and things are not cleanly separated out.

## goals

- keyboard and screen channels which connect into elm

Hmm, I have a little questoin now about the behaviour of the keyboard. Obviously the keyboard outputs on a channel. But should the keyboard also block if noone receives its output? Surely not. so... doesn't this violate the design of occam?

- hook up with codemirror
- error messages to include line numbers
- how to prevent errors such as 'only one parallel process may output/input to a channel at once'?

## unsure

- changle Unrolled handling to get true uniform dist. between threads
- andThen for Outcome - Cleans up the code but it's also kind of creating its own complexity with all the lambdas required

---

## discussion

Thinking about whether to implement the type system from occam 2.1 so that users can easily work with strings and chars. > Enough to be able to draw primitves to the screen (maybe even have sounds) so users can make graphics easily 

Codemirror can allow some services like automatic indentation help.

discussion topics:
- Yep, have channels.
- Partly done IO, question about non-synchronising keyboard.
- What to do next. (error line numbers, preventing rule breaking such as the parallel channels, implementing occam 1, drawing to the screen...)
- How to deal with program organisation / spaghetti code.



- Keyboard - buffered channel
- Implemetning all the paralel parts of occam 1
- Errors per line number - Give each token a line number, have a syntax analyser step at the start.
- Bug - don't check for variable declared right now.
- Testing
    - Parser - 10 code snippets with/without erros etc.
    - Interpreter - tast first n things coming out of display(?) / Could even dump the state and somehow check against it . (would also be good to printout the state for teaching purpose....)

- Evaluation - Do what you would do at a bigger scale  for ~2 people - i.e. get test subjects, ask thm to do a task, Designing INteractive Systems, Benyon Turner Turner - Evaluation chapter