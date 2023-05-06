---
numbersections: true
bibliography: report.bib
csl: ieee-with-url.csl
title: "An interpreter for occam in the browser"
---

\tableofcontents

# Background

## History of occam

occam is a high-level procedural programming language designed to support concurrent applications. One of the earliest concurrent languages designed for industrial use, it was first released in 1983 by David May and others at Inmos, advised by Tony Hoare. It was intended for use on the transputer, an early microprocessor from Inmos which was designed for parallel computing (source). Transputers were used in large networks, with each having integrated memory and serial communication links, rather than the network needing a central bus or RAM.

occam's design is based on the Communicating Sequential Processes (CSP) process algebra created by Tony Hoare, meaning that its programs are expressed in terms of concurrent _processes_ which communicate exclusively by passing messages via _channels_ [@oc1]. There are algebraic laws proving equivalence between different expressions in occam, allowing for formal proofs of the correctness of programs [@laws].

While it is no longer in active use due to the transputer's failure to catch on, it has inspired the languages occam-pi [@occampi] and Ease [@ease] and shares features with other concurrent languages influenced by CSP, such as Go [@go] and Erlang [@erlang], both of which are currently popular in industry. occam and occam-pi have been used to teach concurrency and concurrent programming on Computer Science courses at various British universities (don't know how to cite this - I have an anecdote from my professor who learned it at Oxford, and some online comments).

occam retains interest as a teaching tool. It is suitable for an introduction to practical concurrent programming, as it natively supports concurrent processes and represents them clearly and intuitively as adjacent blocks of code, placed in a hierarchy by the use of significant whitespace (i.e. indentation changes the meaning of code). The use of channels makes the connections between processes explicit. It may also be useful for teaching theoretical computer science - its strong resemblance to CSP makes it a possible alternative to trace refinement checking tools for gaining intuition of how processes interact in a message-passing paradigm.

## Description of Occam

### Channels

Channels are the only shared-memory primitive in occam. Suppose we write an occam program which runs processes _p_ and _q_ concurrently, even on the same device; the only way they can share data without invoking race conditions is via channels.

For example, suppose that _p_ is a program which begins by sending the message 1 along channel `myChan`:

```
SEQ
    myChan ! 1
    ...
```
And suppose _q_ is a program which begins by setting variable `y` to the value received from channel `myChan`:

```
SEQ
    myChan ? y
    ...
```
`SEQ` denotes that the next code section should be executed sequentially line by line. `!` denotes output (i.e. the process outputs a value to the channel) and `?` denotes input (i.e. the process takes an input from the channel and stores it in a variable).

If we run _p_ and _q_ concurrently, then p will never move past the line `myChan ! 1` until q has executed `myChan ? y`, and vice versa. This is because channels are _blocking_, meaning an outputting process always waits (_blocks_) until its message on the channel has been received before proceeding, and an inputting process always waits until it receives some message before proceeding. Channels are not buffered, i.e. a queue or heap of messages cannot build up on a channel.

### Parallelisation and nondeterminism

Suppose instead we change the definition of _q_ to this:

```
PAR
    myChan ? y
    ...
```
`PAR` denotes that the next code block should be executed in parallel. In this case, only the single line `myChan ? y` will block until receiving the message from _p_. The subsequent lines of code, which are in parallel with it, will each run straight away as soon as they are scheduled. The order in which parallel processes are scheduled to run is not specified by occam and is down to the underlying implementation; we describe this as nondeterministic.

## Tools used

The interpreter is designed to run in the browser. This means that the interpreter must be built using only tools that compile to a language which can be run in the browser (i.e. with Javascript).

### Jison and Jison-Lex

Jison is a Javascript tool. Jison is a parser generator, while Jison-Lex is a lexer generator included in the package. The two are based on the widely used Flex and Bison, and have a similar API to them. The key difference is that Jison generates Javascript lexers and parsers, which can be run in the browser, and produce an output in the form of a Javascript array which can easily be processed further. [@jison] [@jisonlex]

Jison-Lex is a regular expression-based lexer generator; it generates a program that can break text down into a list of tokens, the 'words' of a programming language, including predefined keywords as well as user-defined names and values.

Jison is a shift-reduce parser generator; it generates a program that takes the list of tokens produced by the lexer, and repeatedly 'shifts' the first few tokens onto its stack, then 'reduces' them according to the rules of a context-free grammar, to arrive at the end result of an abstract syntax tree (AST).

### Elm

Elm is a functional programming language which compiles to Javascript, so it can be run in the browser. It is inspired by Haskell, but geared towards interactive uses, so I/O and other side effects are easy to use and cleanly separated out as part of Elm's program architecture. Elm also has functional languages' characteristic pattern matching capabilities, lack of runtime errors, and ease of handling user-defined exceptions. This makes it well suited for writing an interpreter.

### CodeMirror

CodeMirror is a Javascript tool which produces a customisable text editor which can be embedded in a web page. It is intended to be used for creating browser-based coding sites. Basic features such as line numbering, highlighting the line the text cursor is on, and indenting using the tab key are enough to make it feel familiar as a code editor and to make coding significantly easier. It is also extensible with features such as syntax highlighting, code linting, and automatic indenting.

# Design

The target audience for the interpreter is people who know the basics of programming, but have not done any concurrent programming before. These may be young people who are being encouraged to explore different programming concepts, or adults who are interested in concurrent programming or CSP. This project does not aim to provide a historical reference for the behaviour of the original occam language.

Existing literature on how to teach concurrency & programming - I'm not sure how to write about this. Many papers seem to be focused on specific teaching methods and topics, whereas I am writing about a tool which could be used in multiple ways.

https://www.sciencedirect.com/science/article/pii/S0743731517300023


## A simple version of the language

This project focuses on implementing and extending occam 1, a preliminary version of the language, which was designed with a minimal set of features in order to encourage users to get a feel for concurrent programming. This made it a perfect fit for our purposes. Notably, Occam 1 does not have common features of modern languages such as data types beyond integers, n-dimensional arrays, or functions [@oc1]. While these were added when occam was developed further with occam 2 and 2.1 [@oc21], we disregard their specifications and instead extend the language from occam 1 according to what makes sense for its use as a teaching tool.

Here is a non-exhaustive list of occam 1 features which were implemented in the interpreter:

- Variable declaration and assignment
- Arithmetic and comparison on integers, and logical operators on booleans
- Control structures (IF, WHILE)
- etc...

## Interactivity

We extended occam 1 to simulate input/output (IO) to hardware, and allow for displaying graphics in the browser. These would allow learners to create interactive and appealing programs such as games, simulations, calculators and visual artworks. This is a design philosophy also seen on the BBC micro:bit, a device designed for computer education, which provides input/outputs including two buttons, a serial connection and a "screen" consisting of a 5x5 LED matrix [@microbit]. Emphasis is also placed on visual outputs in the educational programming languages Logo, with its 'turtle graphics' [@logo], and Scratch, with its 'stage area' [@scratch].

Graphical applications are also uniquely suited to concurrent programming, due to the large number of similar calculations needed to render each pixel to produce a single image. And conversely, due to the concurrent nature of human vision - able to view images 'as a whole', rather than bit by bit - visuals are excellent for displaying concurrent behaviours of processes in an intuitive way, and for perceiving the ordering of various events over time.

![32 independent processes, each drawing one cell in the "Rule 30" 1-D automaton over time; they communicate with a ring of channels](timelapse.png)

To facilitate pixel-based graphics, the language is extended with n-dimensional arrays of variables and channels, as described in the occam 2.1 reference manual [@oc21]. The displayed pixels are set using a two-dimensional array, but more dimensions may still be useful. For example, one can imagine a 3-dimensional array which stores additional information about each 2d coordinate, used when calculating its colour, along the third dimension.

## Modelling nondeterminism

Since we simulate parallel processes with a fully sequential program, we have full control over what order parallel processes should be executed in. There are two basic options for what this order should be.

The first is to try to execute parallelised processes in the order they are written, so that the only difference from sequential code is that blocking processes can be skipped over and returned to later. This has the advantage of making it easier for the user to understand their code's behaviour and debug it, because they can deduce the order in which processes are executed simply by reading through the code. However, this may fail to reveal flaws in concurrent algorithms, because only one possible execution sequence is ever explored, and because things such as race conditions become essentially deterministic. Furthermore, it is not an accurate portrayal of how concurrent processes behave in reality.

The second is to, when faced with a set of parallelised processes, always choose one uniformly at random to execute next. (The extra time and computation needed to include pseudorandom choices in the interpreter is negligible.) This is truly nondeterministic - to the extent that the pseudorandom generator used in the implementation is nondeterministic - and forces the user to reason about their program without having any way to predict the order in which parallelised events happen. This is more realistic, although not perfectly so. In reality, processes are typically scheduled by the operating system, and this is not done uniformly at random, but rather optimising for combinations of qualities such as wait time, throughput, and response time [@scheduling]. Also, processes would be scheduled based on real-time events such as clock or I/O interrupts, but in our implementation this is not the case. Instead, when a process is chosen to be executed, we simply attempt to execute its first line and then return it to the process list if it is not completed. This lack of realism makes it much simpler to implement.

Due to the educational purpose of the interpreter and the target audience of more inexperienced programmers, we concluded that an unrealistic, yet unpredictable method of process scheduling was sufficient, so the second 'random' option was chosen.

## User interface

Since the interpreter runs in the browser, the interface is a website which can be hosted and made available online. This is convenient for teachers, and lowers the entry barrier for learners because they do not have to install anything to run their code.

We adopt the layout of code text box on the left, output on the right, which is used in other browser-based coding such as Codecademy [@codecademy]. Both the graphics display and a log of the serial output are shown.

Additionally, we include some features to help learners debug their code and understand its behaviour. Underneath the outputs, a list of all variables and their current values are displayed, similarly to in a normal debugger in a coding IDE. In the centre is a log of all inputs and outputs to channels, making it explicit when a process is attempting to send on a channel and what value is being sent, as well as when a process is attempting to receive from a channel.

![Screenshot of the website, with the code box on the left, output and state on the right, and channel log in the middle](website_bordered.png)

The following buttons are provided:

- **Submit code** - attempt to parse the user's code and load it into the interpreter. If this fails, the parser's error message is displayed underneath.
- **Step** - advance through the code execution by one step of the interpreter, typically corresponding to one line of code. Useful for slowly walking through the behaviour of the program.
- **50 Steps** - arbitrarily chosen number, which allows the user to 'skip ahead' in the program by 50 steps. Especially useful if there are many steps of preamble before any logic begins.
- **Run** - runs the code continuously with a 20ms delay between steps. This is slow enough to allow the user to perceive the program changing over time, e.g. noticing in what order pixels are drawn to the screen. It also allows for programs that can respond 'in real time' to keypresses.
- **Pause** - Pauses the program in the middle of running it, allowing the user to inspect the state and logs at that moment. Pressing the Run button turns it into the Pause button and vice versa.

# Implementation

## Lexing and parsing

After the user inputs code to the browser, the package Jison is used for converting it into an abstract syntax tree.

Because occam is a language with significant whitespace, the default Jison-Lex tokeniser had to be extended to correctly tokenise indents, dedents and newlines. The example indent/dedent scanner provided as part of the documentation [@whitespace] was adapted for this purpose. Encoding the grammar of occam went smoothly, thanks to the list of rules provided in Appendix H of the occam 2.1 Reference Manual [@oc21].

## Interpreting

The AST produced by Jison is converted into JSON format using Javascript, in order for Elm to be able to convert the tree into a native Elm datatype. Then, it becomes the first element in the 'list of running processes' used when constructing the Elm model of the program.

### Processes and blocking

Inspired by the workings of the actual transputer [@transputer], processes are stored in two lists: a _running_ list with all processes that are awaiting execution, and a _blocking_ list with all processes that are awaiting some event before they can be available to execute.

In the following, we say that a process can _spawn_ further processes by adding them to the running list; the original process is known as the _parent_ and the spawned processes are _children_.

We represent a process by:

- The abstract syntax tree of its code
- Its unique process id (PID)
- The PID of its 'latest waiting ancestor', i.e. the most recent process which is waiting for it to terminate. This is inherited from the parent when the parent does not wait for the child to terminate. Otherwise, it is set to the PID of the parent process.

Meanwhile, a blocking process is represented by:

- The original process
- Its unblocking condition: either when a message is sent or received on a channel, or when a list of processes have terminated (represented by their PIDs)

When a process terminates, its ID is removed from any unblocking conditions in the blocking list. If a list becomes empty because of this, the process whose condition it is can be moved back to the running list. When a process spawns a child, the child's PID is added to all unblocking conditions which contain the PID of the parent's latest waiting ancestor.

This ensures that if process _p_ blocks waiting for process _q_ to terminate (for example, if _p_ is a while loop and _q_ is the body of the loop), then even if _q_ spawns several more children or even multiple generations of descendants (for example, if it contains nested `PAR` statements), _p_ will not unblock until every descendant of _q_ has terminated.

### Channels and variables

Channels and variables are each stored in dictionaries, with strings as keys. Values are defined as a union of the three possible data types in Occam (integers, booleans, and arrays of values).

Arrays may be of either variables or channels (note that arrays of channels are not reassignable and are just a syntactic sugar for declaring channels en masse). They are defined recursively, so an array of type `[8][5][2]INT` is an array containing 8 entries of type `[5][2]INT` and so on.

Variables are represented merely by their value.

Channels are represented by:

- A value
- A boolean which is true iff the channel is full (so, whenever the value has not yet been read by a process)

When a process outputs on a channel, it sets the value and the boolean to true; the blocking list is also checked for whether a process can unblock, read the value and set the boolean to false. If not, the original process must block. Similarly, when a process inputs a message from a channel, it sets the boolean to false and the sender of the message is unblocked. This ensures that message passing via a channel is atomic.

### I/O

We provide buttons in the form of input via the keyboard. Key presses can be received along a designated `KEYBOARD` channel, with each key being mapped to a different integer (e.g. 1, 2, 3, 4 for up, down, left, right arrow keys; this mapping is arbitrary). We also simulate output via a serial connection, using a designated `SERIAL` channel; messages output to this channel are not received by another process, but instead displayed in order on the screen, simulating how they may be received instantaneously and recorded by another device. Both these channels are not truly channels, but instead are unlimited buffers. Each key press is enqueued in the _keyboard_ buffer, and a process taking input from `KEYBOARD` receives the first dequeued value, or blocks while the channel is empty; processes can output to `SERIAL` without blocking and the value will be enqueued in the _serial_ buffer until it can be dequeued and printed on the screen. This ensures that IO will behave as expected for the user, preserving the order and not losing any events.

We also provide a simplistic graphics display in the form of a 32x32 grid of squares (operating as 'pixels') which can each be set to one of several colours. The colour of a pixel at coordinates (i, j) can be set by outputting an integer to channel `GRAPHICS[i][j]`, with integers mapped to different colours (e.g. 0 is black, 1 is white, 2 is red, 3 is blue, everything above 3 is black; again, this is arbitrary).

![Drawing a variety of colours to the screen](rainbow.png)

### The program loop

So overall, the model is a record containing the following types of data[^2]:

- Running processes
- Blocking processes
- State (process IDs)
- State (channels, variables)
- I/O handling (buffers, arrays)

[^2]: Some other data is stored which is specific to the Elm implementation. These are data related to pseudorandom generators, and a dictionary of PIDs to ensure uniqueness.

The program transitions through states in this manner:

![The program loop](loop.jpg)

The 'execute' may end in one of 3 outcomes: an error, a success, or a stopped program (either fully terminated or fully blocked). The 'unblock' processes the outcome to move any newly unblocked processes to the running list. Then, the outcome is passed to the main program which responds to the outcome (either by displaying an error message, or allowing the controller to trigger further execution steps). These make up the inner workings of the model which fits into the standard Model-View-Controller pattern.

### Errors

Errors can occur in two places: syntactical errors in the code when it is lexed and parsed, and runtime errors.

Lexer and parser errors are the default ones displayed by Jison (showing the line where an error was detected, an arrow pointing to the exact spot, and what the expected and received tokens were). These errors are displayed underneath the code editor.

Runtime errors were generated by the Elm interpreter, often composited from different strings over the course of evaluating the code tree to give a better indication of what the issue was. These errors are displayed as part of the channel activity log, to help users figure out when an error occurs and the sequence of events that leads to the error.

# Testing & Evaluation

## Testing methodology

The parser was tested via _Testing framework tbd, at the moment I only have a hand written code expecting a result based on front matter and this seems like a bad idea_ on some simple programs, both with and without syntactic errors.

tba

A variety of simple programs were formulated to test that the interpreter behaved as expected. These can be found in Appendix (tba)

Because Occam programs do not directly return any values, they cannot be tested in the usual way by expecting certain outputs given certain inputs. The most formal and thorough way to test would be to consider the state of the program, define invariants and forbidden state transitions (i.e. a process attempting to output on channel *c* always blocks until another process is attempting to input from channel *c*; whenever the number of blocking processes increases, the number of running processes must decrease by the same amount) and ensure that these rules are never violated when tested on a variety of programs. To take it a step further one could model the program as an abstract state machine and verify it with computer-aided formal verification methods. However, these techniques are outside the scope of this project.

Instead, programs were tested using the `SERIAL` channel along which any process could pass a message without blocking. In addition to being displayed on the screen, these messages would be collected in an ordered list. We used this *serial list* to represent the output of a program; thus, we could once again test programs by inspecting their output. For example, we can test that messages are passed along a channel without duplications by having one process send messages 1,2,3... along channel *c* while another receives them on channel *c* and outputs them on the `SERIAL` channel. Then, we stop the program after an arbitrary number of steps (e.g. 100 steps) and expect the *serial list* to now contain a sequence [1,2,3...][^1]. We choose sequences or properties that can be easily checked using operations on lists such as filters, folds and length comparisons.

(Either explain why Elm made this hard to automate, or automate it with some JS.)

Invariants tested for:

- All comparison operators work as expected; IF statements work correctly
- While loops terminate as expected
- Assignments to variables affect the correct variable
- Processes block when and only when waiting to input or output on a channel
- Replicators behave as expected
- Arrays of variables and channels can be accessed and assigned to
- Messages passed along a channel are not lost or duplicated
- Messages from different processes are interleaved correctly
- Parallel and sequential blocks are executed as expected, including when nested
- The expression in a control statement must evaluate to a boolean
- Cannot perform arithmetic on unassigned variables
- Cannot assign to an undeclared variable

**put the programs in the appendix**

[^1]: Actually, due to the way lists are constructed it would be backwards, but this is not an obstacle.

## Evaluation

### User testing

#### Method

Three members of the target demographic participated in the user study. All three were university students who had done computer programming before, but not concurrent programming.

Users were asked to participate in a small coding exercise, lasting about 40 minutes, on their personal laptops. This consisted of following instructions in a document. They were first asked to read and understand the behaviour of some simple occam code. Then they were introduced to the concept of channels, and asked to modify the code using channels in order to achieve a desired result. Finally, they were given two larger fragments of code and asked to combine them using channels. Throughout the exercise they were encouraged to test out the code in the browser interpreter. The full document can be seen in Appendix (tba).

Following the advice in [@benyonturner], the author sat with each participant individually in order to make note of their reactions, and to get them unstuck if necessary to avoid pointless frustration. This also simulated the presence of a teacher or lab demonstrator who may be present when the interpreter is presented to learners in practice.

Afterwards, the participants were asked a few questions to check whether they were comfortable with the interface and how confident they felt in their understanding of processes and channels. These questions can also be seen in Appendix (tba).

#### User experience

One participant completed all four tasks within the time given, and another completed the first three tasks. The last completed the first two tasks, but was unable to solve the third, and completed the fourth using a shared variable rather than a channel (due to the lack of synchronisation between processes, this led to a slightly different, but mostly correct behaviour).

![A participant's completed answer to the fourth question, resulting in a red cursor that draws dripping blue lines as it moves](drippingcursor2.png)

All the participants found it easy to use the website interface, although it was noted that code highlighting and linting features would have been helpful. One participant suggested highlighting to show which lines of code were grouped together as one process (i.e. highlight a whole `WHILE` loop as one process, but highlight each line of a `SEQ` body as a separate process). Although occam already tries to show this information via the use of significant whitespace, the participants did not find it obvious.

`PAR` and `SEQ` replicators were used in the code and due to their un-intuitive syntax (unlike regular `PAR` and `SEQ`, they only allow one process in the body) their syntax had to be explained explicitly to the participants. Apart from this, they were able to understand all the code without further explanation, sometimes needing the help of trying it out on the interpreter.

Two of the participants struggled to understand the errors displayed by the website when they submitted code with syntactic errors or typos. Participants found the names of some tokens to be unclear and the errors often didn't point to the place in the code where a human would have caught the error.

In the third and fourth questions, participants would begin by writing code with runtime errors or logic errors, but eventually recover. One participant found it helpful to check the values of variables in the state.

Participants often re-ran the same code multiple times in order to gain a better understanding of its behaviour and how it was affected by nondeterminism. They seemed to enjoy watching graphics being drawn to the screen and seeing the screen change in response to keypresses.

#### User understanding

Some participants initially thought that a channel functioned like a 'mailbox', i.e. a value could be left inside it and the program would continue without blocking. However, at the end of the exercise, they were all able to correctly describe how blocking channels worked.

When asked to explain, they all referred to a channel as a type of shared variable which could be used for synchronisation, some saying that this was because variables were a familiar concept from other programming languages. This is accurate in the case of channels within a single machine, as in the interpreter. However, channels between different hardware cannot be classed as shared variables. Perhaps it would have been better if participants conceptualised channels as something completely distinct from variables, such as a metaphorical phone call.

All participants correctly described the behaviour of processes running in parallel, and noted the non-deterministic order of execution. Some initially attempted to determine a pattern in the order, or assumed that the interpreter was faulty because processes were not alternated between in a regular fashion.

### Self-evaluation

Due to the time constraints of the project, many improvements could still be made.

In order to improve the usability of the tool, the first thing to improve would be better parser errors, ideally on par with those for real interpreters. For example, describing the grammar rule that is being used wrongly and offering a suggestion for how to fix it. Runtime errors could also be clearer, following best practices and include a trace of line numbers of where the error originated from in the code. Code highlighting, and linting for incorrect syntax, would also help users to quickly get to grips with coding in the language and minimise frustration. It migth be worth trying out highlighting code blocks according to whether they form a single process, or highlighting in a way that makes it clear which code blocks will be executed in parallel (for example, sequential and parallel highlighted pale blue and pale red respectively).

Automatic indentation and other features commonly found in IDEs would also make life easier. The UI could also be tweaked (e.g. in hindsight a 'Reset' button would have been helpful). Extra features for beginners could be added such as example programs to be loaded in (common in tools like Scratch and Logo) and an accompanying documentation for the language.

The major feature of occam 1 that is missing from the implementation is the ability to call named subroutines; these would be especially useful to spawn copies of the same process at different times. This would also require a mechanism for scoping variables. Some invariants, such as rules forbidding two processes outputting to the same channel or variable shadowing, were implemented as runtime errors, but should have been detected by a code tree traversal prior to execution.

There are also many ways the language could be extended to make it more engaging as a teaching tool. For example, adding more datatypes for integers such as booleans, hexadecimal, characters and strings. Booleans are useful in control structures and more explicit than setting an integer to 0 or 1. The other types would allow for a greater variety of programs to be written and for the user to input text. These could also be used to implement a screen that can draw text, shapes and lines of various sizes directly, and for their colours to be specified via hexadecimal, which is a common convention.

Other concerns are improving the execution speed (it is currently a little slow when accessing arrays) and to find a way for automated unit testing to be used, e.g. writing a full interface to Javascript so that a Javascript testing framework could be used while calling Elm functions and reading from the state.

# Conclusions & Future Work

your experience/ what you learned / challenges and mistakes

- My first time coding a project that combines many different tools - parser, lexer, javascript processing, all the steps in elm. Debugging this kind of project it's invaluable to see a printout of the intermediate output after as many steps as possible.
- Learned the advantages of prototyping a thing very simply and iterating on it
- First time making major design choices. E.g. the program model, how should blocking work, etc. Designing with an end user experience in mind is fun
- It's a gigantic code project by my standards and I learned you really have to stick to conventions (e.g. naming conventions, meanings of words, where to handle what kind of data) to not get confused.
- First time using Jison, it doesn't have the clearest documentation, had to read old stuff about Flex and Bison
- Elm is awesome but it's SO strict about always needing to handle errors perfectly, I really felt the downside of functional programming and strict typing systems when trying to develop the prototype quickly. At the same time, these errors were useful because you could nearly always trace back to the exact bit of code where something failed.
- Testing was so hard, because Elm is really only set up to test functions _without_ side effects, but my thing needs to have either side effects or a simulation of them, for the nondeterminism.
- Well, need to do the user evaluation thing, then I'll have a lot more to say..
- Creating a full lesson plan / tutorials and examples using this interpreter (+ some kind of automatic feedback?)

## Future work

The interpreter could be re-used as part of a REPL allowing users to code with occam on their computer rather than requiring a browser and internet connection to access the website. In this case, the parallel execution of threads could really be parallelised on the user's operating system as opposed to just simulated, allowing users to witness the real performance benefits of paralellisation.

To extend the existing interpreter significantly, a server and networking features could be implemented so that users of the website could send messages to each other via channels, even if they are on different computers. Together with a online database of user submitted code, this could allow users to interact with each other, play online games together or participate in group exercises to learn concurrency.

Based on the findings of this project, a simple pedagogic programming language could also be designed for channel-based concurrency, modernising occam's design. A puzzle game could also be designed using pseudocode or code bricks similar to Scratch or videogames such as 'Baba is You', providing a more casual way to learn.

# Bibliography

::: {#refs}
:::
