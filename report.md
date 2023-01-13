# An interpreter for occam in the browser

## Abstract

## Contents

## Background

### Description of Occam

occam is a high-level procedural programming language designed to support concurrent applications. One of the earliest concurrent languages designed for industrial use, it was first released in 1983 by David May and others at Inmos, advised by Tony Hoare; it was intended for use on the transputer, an early microprocessor designed for parallel computing (source). occam's design is based on the Communicating Sequential Processes (CSP) process algebra, meaning that programs are expressed in terms of concurrent processes which communicate exclusively by passing messages via channels (source: book). While it is no longer in active use, it has inspired the languages occam-pi (source), XC (source), and Ease (source) and shares features with other concurrent languages influenced by CSP, such as Go (source) and Erlang (https://dl.acm.org/doi/10.1145/1810891.1810910).

// Example program and explanation

occam retains interest as a teaching tool. It is suitable for an introduction to practical concurrent programming, as it natively supports concurrent processes and represents them simply as adjacent blocks of code. It may also be useful in a theoretical computer science context - its strong resemblance to CSP makes it a possible alternative to trace refinement checking tools for gaining intuition of how processes interact in a message-passing paradigm.

This project focuses on implementing and extending occam 1, the original version of the language, which was designed with a minimal set of features in order to encourage users to get a feel for concurrent programming. Notably, Occam 1 does not have common features of modern languages such as data types or functions (source: book). While these were added and occam was developed further with occam 2 and 2.1, we disregard their specifications and instead extend the language according to what makes sense for its use as a teaching tool.

## Design

- Existing literature on how to teach concurrency & programming
- Non-determinism & equal prioritisation of parallel code blocks - teaching aid
- Extension beyond Occam 1 - keyboard & screen interface, primitives for graphics
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

- Running example programs / tests (no idea how to design tests)
- Opportunity to include lots of colorful pictures of it in use!
- Self assessment, send it to my friends idk. 
- I could request to send it to Concurrency students at the start of Trinity maybe. 

## Reflection and future work

u konw the drill
- your experience/ what you learned / challenges and mistakes 
- how could this project be extended
- what directions could a further full student project go 