import { toJSONSchema } from '@pm2js/converter'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { schema } from 'prosemirror-schema-basic'
import { useState, useRef, useEffect } from 'react'

import 'prosemirror-view/style/prosemirror.css'

const DEFAULT_DOCUMENT = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [
        { type: 'text', text: 'ProseMirror to JSON Schema Playground' },
      ],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Welcome to the playground.' }],
    },
  ],
}

function App() {
  const editorRef = useRef<HTMLDivElement>(null)

  const [document, setDocument] = useState<object>(DEFAULT_DOCUMENT)
  const [state] = useState(() =>
    EditorState.create({
      schema,
      doc: schema.nodeFromJSON(document),
    }),
  )

  useEffect(() => {
    if (editorRef.current) {
      const view = new EditorView(editorRef.current, {
        state,
        dispatchTransaction(transaction) {
          const newState = view.state.apply(transaction)
          view.updateState(newState)
          setDocument(newState.doc.toJSON())
        },
      })
      return () => view.destroy()
    }
  }, [state])

  return (
    <div>
      <div ref={editorRef} style={{ border: '1px solid grey' }} />
      <div style={{ border: '1px solid grey' }}>
        <pre>{JSON.stringify(document, null, 2)}</pre>
      </div>
      <div style={{ border: '1px solid grey' }}>
        <pre>{JSON.stringify(state.schema.spec, null, 2)}</pre>
      </div>
      <div style={{  border: '1px solid grey' }}>
        <pre>{JSON.stringify(toJSONSchema(state.schema), null, 2)}</pre>
      </div>
    </div>
  )
}

export default App
