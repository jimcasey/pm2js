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

// TODO comment this up
export const toJSONSchema = (schema: Schema): object => {
  try {
    const jsonSchema = { ...BASE_SCHEMA }

    const blockRefs = createGroupRefs(schema, 'block')
    const inlineRefs = createGroupRefs(schema, 'inline')

    console.log('---')
    for (const name in schema.nodes) {
      const { spec } = schema.nodes[name]
      console.log(name, spec.group, spec.content)

      if (name === 'doc') {
        // TODO DRY this up
        jsonSchema.$defs[`${name}_content`] = {
          type: 'array',
          items: {
            anyOf: blockRefs,
          },
        }
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
        // see https://prosemirror.net/docs/guide/#schema.content_expressions
        const refName = `${name}_content`
        def.properties['content'] = {
          $ref: `#/$defs/${refName}`,
        }

        const [_, contentType, contentRepeat] =
          /^(\w*)(\+|\*)?/.exec(spec.content) || []

        const contentDef: JSONObject = {
          type: 'array',
        }
        jsonSchema.$defs[refName] = contentDef

        const isArray =
          contentType === 'block' ||
          contentType === 'inline' ||
          contentRepeat === '+' ||
          contentRepeat === '*'

        if (!isArray) {
          // TODO this isn't used in prosemirror-schema-basic and needs to be tested
          contentDef.type = contentType
        } else {
          contentDef.type = 'array'

          if (contentType === 'block') {
            contentDef.items = { anyOf: blockRefs }
          } else if (contentType === 'inline') {
            contentDef.items = { anyOf: inlineRefs }
          } else {
            contentDef.items = { $ref: `#/$defs/${contentType}` }
          }

          if (contentRepeat === '+') {
            def.required.push('content')
            contentDef.minItems = 1
          }
        }
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
