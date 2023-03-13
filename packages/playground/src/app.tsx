import { toJSONSchema, validateDocument } from '@pm2js/converter'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { schema } from 'prosemirror-schema-basic'
import { useState, useRef, useEffect } from 'react'

import { DEFAULT_DOCUMENT } from './data'

import './app.css'
import 'prosemirror-view/style/prosemirror.css'

const App = () => {
  const editorRef = useRef<HTMLDivElement>(null)

  const [document, setDocument] = useState<object>(DEFAULT_DOCUMENT)
  const [state] = useState(() =>
    EditorState.create({
      schema,
      doc: schema.nodeFromJSON(document),
    }),
  )
  const [jsonSchema] = useState(() => toJSONSchema(state.schema))
  const [jsonSchemaValid, setJsonSchemaValid] = useState<boolean>()

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

  useEffect(() => {
    setJsonSchemaValid(validateDocument(jsonSchema, document))
  }, [jsonSchema, document])

  return (
    <div className="container">
      <Box title="ProseMirror Editor">
        <div ref={editorRef} />
      </Box>
      <Box title="ProseMirror Document">
        <Fixed text={document} />
      </Box>
      <Box title="ProseMirror Schema">
        <Fixed text={state.schema.spec} />
      </Box>
      <Box title="JSON Schema" isValid={jsonSchemaValid}>
        <Fixed text={jsonSchema} />
      </Box>
    </div>
  )
}

const Box = ({
  title,
  isValid,
  children,
}: {
  title: string
  isValid?: boolean
  children: React.ReactNode
}) => {
  return (
    <div className="box">
      <div className="title">
        {title}:{' '}
        {isValid !== undefined && (
          <div className="valid">{isValid ? '✅' : '❌'}</div>
        )}
      </div>
      <div className="content">{children}</div>
    </div>
  )
}

const Fixed = ({ text }: { text: object }) => (
  <pre>{JSON.stringify(text, null, 2)}</pre>
)

export default App
