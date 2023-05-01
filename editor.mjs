import {basicSetup} from "codemirror"
import {EditorView, keymap} from "@codemirror/view"
import {indentWithTab} from "@codemirror/commands"
import {javascript} from "@codemirror/lang-javascript"

const doc = `if (true) {
  console.log("okay")
} else {
  console.log("oh no")
}
`

new EditorView({
  doc,
  extensions: [
    basicSetup,
    keymap.of([indentWithTab]),
    javascript()
  ],
  parent: document.getElementById("editarea")
})


/*import {basicSetup} from "codemirror"
import {EditorView, keymap} from "@codemirror/view"
import {indentWithTab} from "@codemirror/commands"

let exampleCode =
  `SEQ
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
                  DISPLAY ! y`


let editor = new EditorView({
  exampleCode,
  extensions: [basicSetup, keymap.of([indentWithTab])],
  parent: document.getElementById("editarea")
})

function inserttab(view) {
  view.dispatch({
    changes: {from: cm.state.selection.main.head, to: cm.state.selection.main.head, insert: "    "}
  })
}

editor.dispatch({
  changes: {from: 0, to: editor.state.doc.length, insert: exampleCode}
})

export function getCode() {
  return editor.state.doc.toString()
}
*/
