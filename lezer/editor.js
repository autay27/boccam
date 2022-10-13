import {EditorView, basicSetup} from "codemirror"

let editor = new EditorView({
  extensions: [basicSetup],
  parent: document.body
})
