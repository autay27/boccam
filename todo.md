# issues

- EOF-related parsing/lexing problem
- should have init defined things like TRUE, FALSE, which are protected values.
- probability for a seq is off because it takes a step to unroll it. If I split into "Ran" and "Unrolled" and step again on unrolled this wouldn't be a problem.
- At the moment for some reason a SEQ in a WHILE (or even whiles in a seq) doesn't execute in order. The whiles in a seq one is very telling that i have no fucking clue what the issue is. Why would two whiles in a seq both end up executing in parallel? Fucked up.

# goals

- channels - we'll have each channel having its own queue, enqueue during step and dequeue during unblock. idk, something like this.
- keyboard and screen channels which connect into elm
- start drafting final report - follow the paper on my wall and at least get all the headings going. Do it in epsilon so i can just keysmash into it whenever I do it.

# unsure

- andThen for Outcome RunErr/Blocked/Ran - Cleans up the code but it's also kind of creating its own complexity with all the lambdas required

---

# discussion

Thinking about whether to implement the type system from occam 2.1 so that users can easily work with strings and chars. > Enough to be able to draw primitves to the screen (maybe even have sounds) so users can make graphics easily 

codemirror can allow some services like automatic indentation help?