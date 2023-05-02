import {basicSetup} from "codemirror"
import {EditorView, keymap} from "@codemirror/view"
import {indentWithTab} from "@codemirror/commands"
import {javascript} from "@codemirror/lang-javascript"

const exampleCode = `SEQ
    CHAN OF INT chan:
    INT x:
    INT y:
    x := 0
    PAR
        WHILE TRUE
            SEQ
                chan ! x
                x := (x+1)
        WHILE TRUE
            SEQ
                chan ? y
                SERIAL ! y
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
