# An interpreter for occam in the browser

## Abstract

## Contents

## Background

//Summarise the whole project/story

//Separate descripton of occam from descripton of what i've done

more historical context doesn't hurt

who invented occam, why, where are they now

### Description of Occam

add stuff from here http://www.transputer.net/obooks/isbn-013629312-3/book.asp

occam is a high-level procedural programming language designed to support concurrent applications. One of the earliest concurrent languages designed for industrial use, it was first released in 1983 by David May and others at Inmos, advised by Tony Hoare; it was intended for use on the transputer, an early microprocessor from Inmos which was designed for parallel computing (source). Transputers were used in large networks, with each having integrated memory and serial communication links, rather than the network needing a central bus or RAM.

occam's design is based on the Communicating Sequential Processes (CSP) process algebra, meaning that programs are expressed in terms of concurrent processes which communicate exclusively by passing messages via channels (source: book). There are algebraic laws proving equivalence between different expressions in occam, allowing for formal proofs of the correctness of programs (https://www.sciencedirect.com/science/article/pii/0304397588900497).

While it is no longer in active use, it has inspired the languages occam-pi (source), XC (source), and Ease (source) and shares features with other concurrent languages influenced by CSP, such as Go (source) and Erlang (https://dl.acm.org/doi/10.1145/1810891.1810910).

// Example program and explanation

occam retains interest as a teaching tool. It is suitable for an introduction to practical concurrent programming, as it natively supports concurrent processes and represents them simply as adjacent blocks of code. It may also be useful in a theoretical computer science context - its strong resemblance to CSP makes it a possible alternative to trace refinement checking tools for gaining intuition of how processes interact in a message-passing paradigm.

This project focuses on implementing and extending occam 1, the original version of the language, which was designed with a minimal set of features in order to encourage users to get a feel for concurrent programming. Notably, Occam 1 does not have common features of modern languages such as data types or functions (source: book). While these, among other things, were added when occam was developed further with occam 2 and 2.1, we disregard their specifications and instead extend the language from occam 1 according to what makes sense for its use as a teaching tool.

## Design

- Existing literature on how to teach concurrency & programming
- Non-determinism & equal prioritisation of parallel code blocks - teaching aid
- What parts of occam 1 were implemented - see "impl checklist" and justify that implementing them would be easy in the future.
- Extension beyond Occam 1 - keyboard & screen interface, primitives for graphics
- Graphics allow for concurrent viewing of agnts on the screen rather than via a linear output of messages.
- User interface design


## Implementation

I have no idea, I feel like this part is necessary but not interesting

### Lexing and parsing
- Lexer, parser - jison

### Interpreting

In Elm

- The model
- Program loop 
- Modeling concurrent threads & blocking
- Modeling channels

### Interface

Elm, JS and CodeMirror

## Testing & Evaluation

### Testing methodology

A variety of simple programs were formulated to test that the interpreter behaved as expected.

Because Occam programs do not directly return any values, they cannot be tested in the usual way by expecting certain outputs given certain inputs. The most formal and thorough way to test would be to consider the state of the program, define invariants and forbidden state transitions (i.e. a process attempting to output on channel *c* always blocks until another process is attempting to input from channel *c*; whenever the number of blocking processes increases, the number of running processes must decrease by the same amount) and ensure that these rules are never violated when tested on a variety of programs. To take it a step further one could model the program as an abstract state machine and verify it with computer-aided formal verification methods. However, these techniques are outside the scope of this project.

Instead, programs were tested by defining a *display* channel along which any process could pass a message without blocking. Rather than being received by another process, these messages would be collected in an ordered list. We used this *display* list to represent the output of a program; thus, we could once again test programs by inspecting their output. For example, we can test that messages are passed along a channel in the correct order by having one process send messages 1,2,3... along channel *c* while another receives them on channel *c* and outputs them on the *display* channel. Then, we stop the program after an arbitrary number of steps (e.g. 100 steps) and expect the *display* list to now contain a sequence [1,2,3...][^1: Actually, due to the way lists are constructed it would be reversed, but this does not affect the testing method.]. We choose sequences or properties that can be easily checked using operations on lists such as filters, folds and length comparisons.

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

**should I include the programs in the **

### Demonstration program

Either do Conway's game of life or the 2d automata. I think 2d automata might actually be better because it shows a pretty pattern and maybe average CS professor will be like 'oh yeah, THAT thing'
- Opportunity to include lots of colorful pictures of it in use!

### User Evaluation

- Self assessment, send it to my friends. (see todo)


## Reflection

u konw the drill
- your experience/ what you learned / challenges and mistakes 
- how could this project be extended, what would be "another project"

### Future work
- what directions could a further full student project go 
