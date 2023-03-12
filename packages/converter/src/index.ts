import Ajv from 'ajv'
import { Schema } from 'prosemirror-model'

const TEST_SCHEMA = {
  title: 'ProseMirror',
  description: 'Converted from ProseMirror schema',
  type: 'object',
  properties: {
    nodes: { type: 'object' },
  },
  required: ['nodes'],
}

export const toJSONSchema = (schema: Schema): object => {
  return TEST_SCHEMA
}

export const validateJSONSchema = (
  schema: Schema,
  jsonSchema: object,
): boolean => {
  try {
    const ajv = new Ajv()
    const validate = ajv.compile(jsonSchema)
    return validate(schema.spec)
  } catch (error) {
    console.error(error)
    return false
  }
}
