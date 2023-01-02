# issues

- EOF-related parsing/lexing problem
- At the moment the threads inside a WHILE loop are less likely than the rest, I need to change it so that each thread has an ID and the while restarts when all processes with spawned ids are gone.

- should have init defined things like TRUE, FALSE, which are protected values.

# goals

- keyboard and screen channels which connect into elm
- start drafting final report - follow the paper on my wall and at least get all the headings going. Do it in epsilon so i can just keysmash into it

# unsure

- andThen for Outcome RunErr/Blocked/Ran - Cleans up the code but it's also kind of creating its own complexity with all the lambdas required

---

# discussion

Thinking about whether to implement the type system from occam 2.1 so that users can easily work with strings and chars. > Enough to be able to draw primitves to the screen (maybe even have sounds) so users can make graphics easily 

codemirror can allow some services like automatic indentation help?