# Boccam - Browser interpreter for Occam 

## issues

- EOF-related parsing/lexing problem. Actually there seem to be a lot of problems here related to trailing spaces and such.
- Should have initially defined things like TRUE, FALSE, which are protected values.
- We need some refactoring wrt how errors are handled, at the moment there is a lot of converting Err to RunErr etc which could be done automatically.
- Generally the code is messy and things are not cleanly separated out.

## goals

- keyboard and screen channels which connect into elm

how to do this? They are not like ordinary channels where both sides are processes. Instead, we need to... I guess have them as channels, sure, but then on the last step of run, have an 'unblock by IO' thing which will unblock them and convert their value to a custom dtatype which will be used to update the IO stuff.... Bah, my model expanded again. And to input, we need to put values in the channel and kinda call 'channelFilled' like normal right. Idk. I guess this will force me to do some better separating out huh.

I think I'll have 'screen' as an extra field in the model.

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
- How to deal with program organisation / spaghetti code.