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

I'm gtting sleepy. I have a while that runs once then blocks forever. Now I need to
- add spawned threads ids to the while's waiting condition ( I guess this can be done within spawn? wherever my id is present, add my kids ids)
- make it unblock when all termination conditions are met (so, can we split the Ran type into Ran Model and RanTerminated Int Model)

Wait, what does it mean for a process to terminate? Just to have Ran? It always spawns a new proces to continue right? Yeah, so we should just add the id of the ran-process to Ran.

I'm looking ahead to channels and it would seem to make sense for any channel action to also be included in Ran. 

we need to take the result of the current run and feed it to unblock, which checks what things happened and updates/moves processes from waiting based on a) if anything terminated b) if anything attempted to send a message on a channel. it can also enqueue messages on a channel I guess. Hmm. Maybe it's better if we do that while running, but unblock would certainly dequeue from the channel.

# goals

- channels
- keyboard and screen channels which connect into elm
- start drafting final report - follow the paper on my wall and at least get all the headings going. Do it in epsilon so i can just keysmash into it whenever I do it.

# unsure

- andThen for Outcome RunErr/Blocked/Ran - Cleans up the code but it's also kind of creating its own complexity with all the lambdas required

---

# discussion

Thinking about whether to implement the type system from occam 2.1 so that users can easily work with strings and chars. > Enough to be able to draw primitves to the screen (maybe even have sounds) so users can make graphics easily 

codemirror can allow some services like automatic indentation help?