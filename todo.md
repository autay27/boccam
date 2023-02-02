# Boccam - Browser interpreter for Occam 

## issues

- EOF-related parsing/lexing problem. Actually there seem to be a lot of problems here related to trailing spaces and such.
- Should have initially defined things like TRUE, FALSE, which are protected values.
- We need some refactoring wrt how errors are handled, at the moment there is a lot of converting Err to RunErr etc which could be done automatically.
- Generally the code is messy and things are not cleanly separated out.
- PRoblematic error handling in alt guard evaluation.

## goals - code

- Implement ALT

    Firstly, the fact that the choice between true guards is nondet is so annoying. But let's leave that aside for now. 

    I need to make a list of all the guards which evaluate to true within the alt and also recursing on any alts within the alt. So it's basically an elaborate fold of
        case xs of 
            y::ys ->
                case y of 
                    Guard (b::p) -> if (guardeval b) then Guard (b::p)
                    Alt [AltList zs] -> recurse on zs

    Ummm so basically I just need to flatten it first then can filter it that'l be nicer?
    
    Then, I need to pick one. After that running it should not be a problem.

    Hmm, for some reason it's all turning out very cursedly. Will go back with a paper and pen tomorrow.

- Implementing all the parallel parts of occam 1
- hook up with codemirror
- Errors per line number - Give each token a line number, have a syntax analyser step at the start to catch things like multiple output per channel

## goals - report

- Testing
    - Parser - 10 code snippets with/without erros etc.
    - Interpreter - tast first n things coming out of display(?) / Could even dump the state and somehow check against it . (would also be good to printout the state for teaching purpose....)
- Evaluation - Do what you would do at a bigger scale  for ~2 people - i.e. get test subjects, ask thm to do a task, Designing INteractive Systems, Benyon Turner Turner - Evaluation chapter

## unsure

- changle Unrolled handling to get true uniform dist. between threads
- andThen for Outcome - Cleans up the code but it's also kind of creating its own complexity with all the lambdas required

---

## discussion

Thinking about whether to implement the type system from occam 2.1 so that users can easily work with strings and chars. > Enough to be able to draw primitves to the screen (maybe even have sounds) so users can make graphics easily 

Codemirror can allow some services like automatic indentation help.


