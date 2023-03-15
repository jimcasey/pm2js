import Ajv from 'ajv/dist/2020'
import { Schema } from 'prosemirror-model'

type JSONObject = { [key: string]: any }

// https://json-schema.org/draft/2020-12/release-notes.html
const SCHEMA_VERSION = 'https://json-schema.org/draft/2020-12/schema'

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

const createMarksDef = (marks: string, schema: Schema) => {
  // https://prosemirror.net/docs/guide/#schema.marks
  // https://prosemirror.net/docs/ref/#model.NodeSpec.marks
}

// TODO comment this up
export const toJSONSchema = (schema: Schema): object => {
  try {
    const topNode = schema.nodes[schema.topNodeType.name]

    console.log(JSON.stringify(schema.nodes['paragraph'].spec))
    const jsonSchema: JSONObject = createNodeJSONSchema('doc', schema)

    // ---
    // const jsonSchema: JSONObject = {
    //   $schema: SCHEMA_VERSION,
    //   type: 'object',
    //   properties: {
    //     type: { const: 'doc' },
    //     content: { $ref: '#/$defs/doc_content' },
    //   },
    //   required: ['type', 'content'],
    //   additionalProperties: false,
    //   $defs: {},
    // }

    // Object.keys(schema.nodes).forEach((nodeName) => {
    //   const node = schema.nodes[nodeName]
    //   const nodeSpec = node.spec
    //   const refName = `${nodeName}_content`

    //   console.log(nodeName, schema.topNodeType)

    //   if (nodeName === 'doc') {
    //     jsonSchema.$defs[refName] = createContentDef(nodeSpec.content, schema)
    //     return
    //   }

    //   const def: JSONObject = {
    //     type: 'object',
    //     properties: {
    //       type: { const: nodeName },
    //     },
    //     required: ['type'],
    //   }
    //   jsonSchema.$defs[`${nodeName}`] = def

    //   if (nodeSpec.content) {
    //     // https://prosemirror.net/docs/ref/#model.NodeSpec.content
    //     def.properties.content = {
    //       $ref: `#/$defs/${refName}`,
    //     }

    //     const contentRef = createContentDef(nodeSpec.content, schema)
    //     if (contentRef.minItems && contentRef.minItems > 0) {
    //       def.required.push('content')
    //     }
    //     jsonSchema.$defs[refName] = contentRef

    //     // console.log(nodeName, nodeSpec.content, node.contentMatch)
    //     // Object.keys(schema.nodes).forEach((contentNodeName) => {
    //     //   console.log(
    //     //     '\t',
    //     //     contentNodeName,
    //     //     node.compatibleContent(schema.nodes[contentNodeName]),
    //     //   )
    //     // })
    //   }

    //   // https://prosemirror.net/docs/ref/#model.NodeSpec.marks
    //   // The marks that are allowed inside of this node. May be a space-separated string referring to
    //   // mark names or groups, "_" to explicitly allow all marks, or "" to disallow marks. When not
    //   // given, nodes with inline content default to allowing all marks, other nodes default to not
    //   // allowing marks.

    //   // const marks = nodeSpec.marks || nodeSpec.group === 'inline' ? '_' : ''
    //   // console.log(nodeName, node.markSet, nodeSpec.marks, marks)
    //   // Object.keys(schema.marks).forEach((markName) => {
    //   //   console.log('\t', markName, node.allowsMarkType(schema.marks[markName]))
    //   // })

    //   // const marks = nodeSpec.marks || nodeSpec.group === 'inline' ? '_' : ''
    //   // if (node. marks === '') {
    //   //   def.not = { required: ['marks'] }
    //   // } else {
    //   // }

    //   if (nodeSpec.attrs) {
    //     // https://prosemirror.net/docs/ref/#model.NodeSpec.attrs
    //     const nodeAttrs = nodeSpec.attrs

    //     const attrs: JSONObject = {
    //       type: 'object',
    //       properties: {},
    //       required: [],
    //     }
    //     def.properties.attrs = attrs

    //     let isRequired = false
    //     Object.keys(nodeAttrs).forEach((attrName) => {
    //       const attr = {
    //         // TODO it's impossible to infer type from attrs, see:
    //         // https://github.com/jimcasey/pm2js/issues/20
    //         anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }],
    //       }
    //       attrs.properties[attrName] = attr

    //       if (nodeAttrs[attrName].default === undefined) {
    //         attrs.required.push(attrName)
    //         isRequired = true
    //       }
    //     })

    //     if (isRequired) {
    //       def.required.push('attrs')
    //     }
    //   }
    // })
    // /---

    return jsonSchema
  } catch (error) {
    console.error(error)
    return {}
  }
}

const createNodeJSONSchema = (name: string, schema: Schema) => {
  const jsonSchema: JSONObject = {
    type: 'object',
    properties: {
      type: { const: name },
    },
    required: ['type'],
  }

  const node = schema.nodes[name]

  // https://prosemirror.net/docs/ref/#model.NodeSpec.content
  if (node.spec.content) {
    console.log(name, node.spec.content, node.contentMatch.matchType(schema.nodes['paragraph']))
    // https://prosemirror.net/docs/guide/#schema.content_expressions
    const [_, content, repeat] = /^(\w*)(\+|\*)?/.exec(node.spec.content) || []

    const contentTypes: string[] = []
    if (/^(content|inline)?/.test(content)) {
      // filter all content or inline nodes
      contentTypes.push(
        ...Object.keys(schema.nodes).filter(
          (nodeName) => schema.nodes[nodeName].spec.group === content,
        ),
      )
    } else {
      // TODO this isn't used in prosemirror-schema-basic and needs to be tested
    }

    jsonSchema.properties.content = {
      type: 'array',
    }

    // jsonSchema.properties.content.items = {
    //   anyOf: Object.keys(schema.nodes)
    //     .filter((nodeName) => schema.nodes[nodeName].spec.group === content)
    //     .map((nodeName) => ({ $ref: `#/$defs/${nodeName}` })),
    // }
  }
  //     def.type = 'array'
  // const createGroupRefs = (schema: Schema, group: string) => {
  //   return Object.keys(schema.nodes)
  //     .filter((nodeName) => schema.nodes[nodeName].spec.group === group)
  //     .map((nodeName) => ({ $ref: `#/$defs/${nodeName}` }))
  // }

  //     if (type === 'block') {
  //       def.items = { anyOf: createGroupRefs(schema, 'block') }
  //     } else if (type === 'inline') {
  //       def.items = { anyOf: createGroupRefs(schema, 'inline') }
  //     } else {
  //       def.items = { $ref: `#/$defs/${type}` }
  //     }

  //     if (repeat === '+') {
  //       def.minItems = 1
  //     }
  //   } else {
  //     // TODO this isn't used in prosemirror-schema-basic and needs to be tested
  //     def.type = type
  //   }

  //   return def
  // }

  //     const contentRef = createContentDef(nodeSpec.content, schema)
  //     if (contentRef.minItems && contentRef.minItems > 0) {
  //       def.required.push('content')
  //     }
  //     jsonSchema.$defs[refName] = contentRef

  //     // console.log(nodeName, nodeSpec.content, node.contentMatch)
  //     // Object.keys(schema.nodes).forEach((contentNodeName) => {
  //     //   console.log(
  //     //     '\t',
  //     //     contentNodeName,
  //     //     node.compatibleContent(schema.nodes[contentNodeName]),
  //     //   )
  //     // })
  //   }

  // $defs: [
  //   [`${nodeName}_content`]:
  // ]

  return jsonSchema

  //   const def: JSONObject = {
  //     type: 'object',
  //     properties: {
  //       type: { const: nodeName },
  //     },
  //     required: ['type'],
  //   }
  //   jsonSchema.$defs[`${nodeName}`] = def
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
