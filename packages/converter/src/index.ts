import Ajv from 'ajv/dist/2020'
import { Schema } from 'prosemirror-model'

type JSONObject = { [key: string]: any }

// https://json-schema.org/draft/2020-12/release-notes.html
const SCHEMA_VERSION = 'https://json-schema.org/draft/2020-12/schema'

const BASE_SCHEMA: JSONObject = {
  $schema: SCHEMA_VERSION,
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
    .filter((nodeName) => schema.nodes[nodeName].spec.group === group)
    .map((nodeName) => ({ $ref: `#/$defs/${nodeName}` }))
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

    Object.keys(schema.nodes).forEach((nodeName) => {
      const nodeSpec = schema.nodes[nodeName].spec
      const refName = `${nodeName}_content`

      if (nodeName === 'doc') {
        jsonSchema.$defs[refName] = createContentDef(nodeSpec.content, schema)
        return
      }

      const def: JSONObject = {
        type: 'object',
        properties: {
          type: { const: nodeName },
        },
        required: ['type'],
      }
      jsonSchema.$defs[`${nodeName}`] = def

      if (nodeSpec.content) {
        // https://prosemirror.net/docs/ref/#model.NodeSpec.content
        def.properties.content = {
          $ref: `#/$defs/${refName}`,
        }

        const contentRef = createContentDef(nodeSpec.content, schema)
        if (contentRef.minItems && contentRef.minItems > 0) {
          def.required.push('content')
        }
        jsonSchema.$defs[refName] = contentRef
      }

      if (nodeSpec.attrs) {
        // https://prosemirror.net/docs/ref/#model.NodeSpec.attrs
        const nodeAttrs = nodeSpec.attrs

        const attrs: JSONObject = {
          type: 'object',
          properties: {},
          required: [],
        }
        def.properties.attrs = attrs

        let isRequired = false
        Object.keys(nodeAttrs).forEach((attrName) => {
          const attr = {
            // TODO it's impossible to infer type from attrs, see:
            // https://github.com/jimcasey/pm2js/issues/20
            anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }],
          }
          attrs.properties[attrName] = attr

          if (nodeAttrs[attrName].default === undefined) {
            attrs.required.push(attrName)
            isRequired = true
          }
        })

        if (isRequired) {
          def.required.push('attrs')
        }
      }
    })

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
