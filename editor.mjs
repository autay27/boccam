import {basicSetup} from "codemirror"
import {EditorView, keymap} from "@codemirror/view"
import {indentWithTab} from "@codemirror/commands"
import {javascript} from "@codemirror/lang-javascript"

const exampleCode = `SEQ
    [9]INT verticalPosition:
    SEQ i = [0 FOR 8]
        verticalPosition[i] := 0
    PAR i = [0 FOR 8]
        WHILE i+verticalPosition[i] < 32
            SEQ
                GRAPHICS[i+verticalPosition[i]][verticalPosition[i]] ! i
                verticalPosition[i] := verticalPosition[i]+1
`

var cm;

window.onload = function() {
  cm = new EditorView({
  extensions: [
    basicSetup,
    keymap.of([indentWithTab]),
  ],
  parent: document.getElementById("editor")
  })

  cm.dispatch({
    changes: {from: 0, to: 0, insert: exampleCode}
  })

}

export function getCode() {
  return cm.state.doc.toString()
}

export function replaceContents(newContent) {
  cm.dispatch({
    changes: {from: 0, to: cm.state.doc.length, insert: newContent}
  })
}
