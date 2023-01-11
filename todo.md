# issues

- EOF-related parsing/lexing problem
- should have init defined things like TRUE, FALSE, which are protected values.
- At the moment the threads inside a WHILE loop are less likely than the rest (also while loop doesn't even work with e.g. a seq), I need to change it so that each thread has an ID and the while restarts when all processes with spawned ids are gone.

So, Proc type now refers to a (Tree, Int) but how do we ensure unique id? kinda hard to have a global side effect like that. could have it in the state I guess.

ok, I added it to the state. But what exactly am I doing here?

How to define behaviour of a while par... "While b, Par (x,y,z)" should run x,y,z to completion, then once all 3 are complete should check b and repeat

So how to implatmet?

- When we run a WHILE, we spawn the process with id n.
- When we run try to run the WHILE again, we need n and all processes spawned from n to be terminated. Alternatively, say the WHILE is blocking until they are all finished.

So, should we give WHILE a list of pids it's waiting for *termination* of, then put it in the blocking list and every time a process terminates we go to that list and take it off while's list there. Will there be any funny catches? I don't think so... However, having to go there and *add* to the list whenever we spawn new processes is so annoying. I guess I'll have to cope with that. Tbf I can give each process an 'which while loops are my parent?' list so this happens less often.

# goals

- keyboard and screen channels which connect into elm
- start drafting final report - follow the paper on my wall and at least get all the headings going. Do it in epsilon so i can just keysmash into it whenever I do it.

# unsure

- andThen for Outcome RunErr/Blocked/Ran - Cleans up the code but it's also kind of creating its own complexity with all the lambdas required

---

# discussion

Thinking about whether to implement the type system from occam 2.1 so that users can easily work with strings and chars. > Enough to be able to draw primitves to the screen (maybe even have sounds) so users can make graphics easily 

codemirror can allow some services like automatic indentation help?