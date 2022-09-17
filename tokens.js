//adapted from https://github.com/lezer-parser/python/blob/main/src/tokens.js
//see https://lezer.codemirror.net/docs/guide/#external-tokens

import {ExternalTokenizer, ContextTracker} from "@lezer/lr"

const newline = 10, carriageReturn = 13, space = 32, tab = 9

export const newlines = new ExternalTokenizer((input, stack) => {
    if (input.next < 0) {
      input.acceptToken(eof)
    } else if (input.next != newline && input.next != carriageReturn) {
    } else if (stack.context.depth < 0) {
      input.acceptToken(newlineBracketed, 1)
    } else {
      input.advance()
      let spaces = 0
      while (input.next == space || input.next == tab) { input.advance(); spaces++ }
      let empty = input.next == newline || input.next == carriageReturn || input.next == hash
      input.acceptToken(empty ? newlineEmpty : newlineToken, -spaces)
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
          input.next != newline && input.next != carriageReturn && input.next != hash) {
        if (depth < cDepth) input.acceptToken(dedent, -chars)
        else input.acceptToken(indent)
      }
    }
  })