export const DEFAULT_DOCUMENT = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: {
        level: 3,
      },
      content: [
        {
          type: 'text',
          text: 'ProseMirror to JSON Schema',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Welcome to the playground.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'The basic schema supports ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'em',
            },
          ],
          text: 'emphasis',
        },
        {
          type: 'text',
          text: ', ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'strong',
            },
          ],
          text: 'strong text',
        },
        {
          type: 'text',
          text: ', ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'link',
              attrs: {
                href: 'https://github.com/jimcasey/pm2js',
                title: null,
              },
            },
          ],
          text: 'links',
        },
        {
          type: 'text',
          text: ', ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'code',
            },
          ],
          text: 'code font',
        },
        {
          type: 'text',
          text: ',  ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'link',
              attrs: {
                href: 'http://google.com',
                title: 'Google',
              },
            },
            {
              type: 'em',
            },
            {
              type: 'strong',
            },
          ],
          text: 'multiple formats',
        },
        {
          type: 'text',
          text: ', and ',
        },
        {
          type: 'image',
          attrs: {
            src: 'https://prosemirror.net/img/smiley.png',
            alt: null,
            title: null,
          },
        },
        {
          type: 'text',
          text: ' images.',
        },
      ],
    },
    {
      type: 'horizontal_rule',
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Above this line is a horizontal rule, and the following is a block quote:',
        },
      ],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'An investment in knowledge pays the best interest.',
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'There’s an empty text block above this, and this is a hard break:',
        },
        {
          type: 'hard_break',
        },
        {
          type: 'text',
          text: '...and here is a code block:',
        },
      ],
    },
    {
      type: 'code_block',
      content: [
        {
          type: 'text',
          text: 'const somethinElse = "somethin\' else"\nconsole.log(`ProseMirror is ${somethinElse}.` ',
        },
      ],
    },
  ],
}
