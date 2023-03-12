import Ajv from 'ajv'
import { Schema } from 'prosemirror-model'

const BASE_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    type: { const: 'doc' },
    content: { $ref: '#/definitions/Content' },
  },
  required: ['type', 'content'],
  additionalProperties: false,
  definitions: {
    Content: {
      type: 'array',
      items: {
        type: 'object',
      },
    },
  },
}

export const toJSONSchema = (schema: Schema): object => {
  return BASE_SCHEMA
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
