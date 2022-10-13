//adapted from https://github.com/lezer-parser/python/blob/main/src/tokens.js
//see https://lezer.codemirror.net/docs/guide/#external-tokens

import {ExternalTokenizer, ContextTracker} from "@lezer/lr"

import {
  newline as newlineToken, eof, indent, dedent,
} from "./occam.terms.js"

const newline = 10, carriageReturn = 13, space = 32, tab = 9

export const newlines = new ExternalTokenizer((input, stack) => {
    if (input.next < 0) {
      input.acceptToken(eof)
    } else if (input.next != newline && input.next != carriageReturn) {
    } else if (stack.context.depth < 0) {
      input.acceptToken(newline, 1)
    } else {
      input.advance()
      let spaces = 0
      while (input.next == space || input.next == tab) { input.advance(); spaces++ }
      let empty = input.next == newline || input.next == carriageReturn
      input.acceptToken(empty ? newline : newlineToken, -spaces)
    }
  }, {contextual: true, fallback: true})
  

export const indentation = new ExternalTokenizer((input, stack) => {
    let cDepth = stack.context.depth
    if (cDepth < 0) return
    let prev = input.peek(-1), depth
    if ((prev == newline || prev == carriageReturn) && stack.context.depth >= 0) {
      let depth = 0, chars = 0
      for (;;) {
        if (input.next == space) depth++
        else if (input.next == tab) depth += 8 - (depth % 8)
        else break
        input.advance()
        chars++
      }
      if (depth != cDepth &&
          input.next != newline && input.next != carriageReturn) {
        if (depth < cDepth) input.acceptToken(dedent, -chars)
        else input.acceptToken(indent)
      }
    }
  })

  function IndentLevel(parent, depth) {
    this.parent = parent
    // -1 means this is not an actual indent level but a set of brackets
    this.depth = depth
    this.hash = (parent ? parent.hash + parent.hash << 8 : 0) + depth + (depth << 4)
  }
  
  const topIndent = new IndentLevel(null, 0)
  
  function countIndent(space) {
    let depth = 0
    for (let i = 0; i < space.length; i++)
      depth += space.charCodeAt(i) == tab ? 8 - (depth % 8) : 1
    return depth
  }

  export const trackIndent = new ContextTracker({
    start: topIndent,
    reduce(context, term) {
      return context.depth < 0 ? context.parent : context
    },
    shift(context, term, stack, input) {
      if (term == indent) return new IndentLevel(context, countIndent(input.read(input.pos, stack.pos)))
      if (term == dedent) return context.parent
      return context
    },
    hash(context) { return context.hash }
  })