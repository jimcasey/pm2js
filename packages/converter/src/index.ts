import { Schema } from 'prosemirror-model'

export const toJSONSchema = (schema: Schema): object => {
  return schema.spec
}
