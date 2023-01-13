# Boccam - Browser interpreter for Occam 

## issues

- EOF-related parsing/lexing problem. Actually there seem to be a lot of problems here related to trailing spaces and such.
- Should have initially defined things like TRUE, FALSE, which are protected values.
- probability for a seq is off because it takes a step to unroll it. If I split into "Ran" and "Unrolled" and step again on unrolled this wouldn't be a problem.

## goals

- channels - we'll have each channel having its own queue, enqueue during step and dequeue during unblock. idk, something like this.
- keyboard and screen channels which connect into elm
- hook up with codemirror
- start drafting final report - follow the paper on my wall and at least get all the headings going. Do it in epsilon so i can just keysmash into it whenever I do it.

## unsure

- andThen for Outcome RunErr/Blocked/Ran - Cleans up the code but it's also kind of creating its own complexity with all the lambdas required

---

## discussion

Thinking about whether to implement the type system from occam 2.1 so that users can easily work with strings and chars. > Enough to be able to draw primitves to the screen (maybe even have sounds) so users can make graphics easily 

Codemirror can allow some services like automatic indentation help.