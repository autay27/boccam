# Boccam - Browser interpreter for Occam 

## issues

- EOF-related parsing/lexing problem. Actually there seem to be a lot of problems here related to trailing spaces and such.
- Should have initially defined things like TRUE, FALSE, which are protected values.

## goals

- channels - we'll have each channel having its own slot, put in the slot during step and serve to a waiting process during unblock. idk, something like this.

so, channels can be just variables held in state for now? I think we can, they are kinda in the locl scope. but it would be nice to separate them fr. we can have 'variables' and 'channels' as two fields of state.

channels : Dict Ident Chan

damn, in the spec it says channels are single reader single writer

- keyboard and screen channels which connect into elm
- hook up with codemirror
- start drafting final report - follow the paper on my wall and at least get all the headings going. Do it in epsilon so i can just keysmash into it whenever I do it.

## unsure

- changle Unrolled handling to get true uniform dist. between threads
- andThen for Outcome RunErr/Blocked/Ran - Cleans up the code but it's also kind of creating its own complexity with all the lambdas required

---

## discussion

Thinking about whether to implement the type system from occam 2.1 so that users can easily work with strings and chars. > Enough to be able to draw primitves to the screen (maybe even have sounds) so users can make graphics easily 

Codemirror can allow some services like automatic indentation help.