# Boccam - Browser interpreter for Occam 

## issues

- EOF-related parsing/lexing problem. Actually there seem to be a lot of problems here related to trailing spaces and such.
- Should have initially defined things like TRUE, FALSE, which are protected values.

## goals

- channels - we'll have each channel having its own slot, put in the slot during step and serve to a waiting process during unblock. idk, something like this.

How to Input  (Receive)
- if channel !isFull
    block myself until channel isFull (someone will come wake me) 
    then I spawn as an Assign process with the gotten value I guess, since I wouldn't evaluate exactly which variable to input to until I'm successful.
- else 
    retrive value from the channel, empty it out, and terminate
    
How to Output (Send)
- if channel isFull
    get my value, empty the channel and update my state; terminate
- else 
    block myself until channel isFull (someone will come wake me) hmm, should my value get put in the channel instantly? I don't think so, that doesn't feel right. Looking at the book, it seems that the value of the expression x in chan ! x is not evaluated until the output is already successful.

so, channels can be just variables held in state for now? I think we can, they are kinda in the locl scope. but it would be nice to separate them fr. we can have 'variables' and 'channels' as two fields of state.

channels : Dict Ident Chan

damn, in the spec it says channels are single reader single writer

Mini Todo
- add in, var decls to jison
- add var decls to AST stuff
- code var decls
- write example program to test this stuff
- code output 
- test it out 

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