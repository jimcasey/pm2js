import Ajv from 'ajv'
import { Schema } from 'prosemirror-model'

type JSONObject = { [key: string]: any }

const BASE_SCHEMA: JSONObject = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    type: { const: 'doc' },
    content: { $ref: '#/$defs/doc_content' },
  },
  required: ['type', 'content'],
  additionalProperties: false,
  $defs: {},
}

const createGroupRefs = (schema: Schema, group: string) => {
  return Object.keys(schema.nodes)
    .filter((name) => schema.nodes[name].spec.group === group)
    .map((name) => ({ $ref: `#/$defs/${name}` }))
}

const createContentDef = (content: string = '', schema: Schema) => {
  // https://prosemirror.net/docs/guide/#schema.content_expressions
  const def: JSONObject = {}
  const [_, type, repeat] = /^(\w*)(\+|\*)?/.exec(content) || []

  if (
    type === 'block' ||
    type === 'inline' ||
    repeat === '+' ||
    repeat === '*'
  ) {
    def.type = 'array'

    if (type === 'block') {
      def.items = { anyOf: createGroupRefs(schema, 'block') }
    } else if (type === 'inline') {
      def.items = { anyOf: createGroupRefs(schema, 'inline') }
    } else {
      def.items = { $ref: `#/$defs/${type}` }
    }

    if (repeat === '+') {
      def.minItems = 1
    }
  } else {
    // TODO this isn't used in prosemirror-schema-basic and needs to be tested
    def.type = type
  }

  return def
}

// TODO comment this up
export const toJSONSchema = (schema: Schema): object => {
  try {
    const jsonSchema = { ...BASE_SCHEMA }

    for (const name in schema.nodes) {
      const { spec } = schema.nodes[name]
      const refName = `${name}_content`

      if (name === 'doc') {
        jsonSchema.$defs[refName] = createContentDef(spec.content, schema)
        continue
      }

      const def: JSONObject = {
        type: 'object',
        properties: {
          type: { const: name },
        },
        required: ['type'],
      }
      jsonSchema.$defs[`${name}`] = def

      if (spec.content) {
        def.properties.content = {
          $ref: `#/$defs/${refName}`,
        }

        const contentRef = createContentDef(spec.content, schema)
        if (contentRef.minItems && contentRef.minItems > 0) {
          def.required.push('content')
        }
        jsonSchema.$defs[refName] = contentRef
      }
    }

    return jsonSchema
  } catch (error) {
    console.error(error)
    return {}
  }
}

export const validateDocument = (
  jsonSchema: object,
  document: object,
): boolean => {
  try {
    const ajv = new Ajv()
    const validate = ajv.compile(jsonSchema)
    return validate(document)
  } catch (error) {
    console.error(error)
    return false
  }
}
