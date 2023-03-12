import { toJSONSchema } from '@pm2js/converter'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { schema } from 'prosemirror-schema-basic'
import { useState, useRef, useEffect } from 'react'

import './app.css'
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

const App = () => {
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
    <div className="container">
      <Box title="ProseMirror Editor">
        <div ref={editorRef} />
      </Box>
      <Box title="ProseMirror Document">
        <pre>{JSON.stringify(document, null, 2)}</pre>
      </Box>
      <Box title="ProseMirror Schema">
        <pre>{JSON.stringify(state.schema.spec, null, 2)}</pre>
      </Box>
      <Box title="JSON Schema">
        <pre>{JSON.stringify(toJSONSchema(state.schema), null, 2)}</pre>
      </Box>
    </div>
  )
}

const Box = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => {
  return (
    <div className="box">
      <div className="title">{title}:</div>
      <div className="content">{children}</div>
    </div>
  )
}

export default App
