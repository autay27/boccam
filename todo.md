# Boccam - Browser interpreter for Occam 

## issues

- EOF-related parsing/lexing problem. Actually there seem to be a lot of problems here related to trailing spaces and such.
- Should have initially defined things like TRUE, FALSE, which are protected values.
- We need some refactoring wrt how errors are handled, at the moment there is a lot of converting Err to RunErr etc which could be done automatically.

## goals

- channels - we'll have each channel having its own slot, put in the slot during step and serve to a waiting process during unblock. idk, something like this.

How to Input  (Receive)
- if channel !isFull
    block myself until channel isFull (someone will come wake me) 
    then I spawn as an Assign process with the gotten value I guess, since I wouldn't evaluate exactly which variable to input to until I'm successful.
- else 
    retrive value from the channel, empty it out, and terminate
    
How to Output (Send)
- if channel !isFull
    get my value, update the state with my value in the channel; block until channel !isFull (someone will come get me)
- else 
    block myself until channel !isFull (someone will come wake me) hmm, should my value get put in the channel instantly? I don't think so, that doesn't feel right. Looking at the book, it seems that the value of the expression x in chan ! x is not evaluated until the output is already successful.

in the spec it says channels are single reader single writer

So, I tried making it unblock by calling an 'unblock relevant stuff' every time I e.g. fill a channel. But now I'm concerned because e.g. in Output we add our proc. to blocking AFTER calling all that shebang. So an instantly-successful output will never get unblocked. Is it as simple as just calling it after adding? 

Furthermore, after such an unblock we should call unblock with the unblocked process, or return a Ran of that process.

Big problem atm is that I now realise that more than 1 proc can terminate in 1 step so i want to refactor some things.

Mini Todo
- write example program to test this stuff
- test it out 

- factor State out into another file
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