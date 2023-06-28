import { ZoomBotMessageRequestContent } from '../types';

const content: ZoomBotMessageRequestContent = {
  head: {
    text: 'Here is the list of commands',
  },
  body: [
    {
      type: 'section',
      sidebar_color: '#F56416',
      sections: [
        {
          type: 'fields',
          items: [
            {
              key: 'todo list',
              value: 'List all unfinished to-do items',
            },
            {
              key: 'todo add <item>',
              value: 'Add a new to-do item',
            },
            {
              key: 'todo update <index>',
              value: 'Mark a to-do item as done',
            },
            {
              key: 'todo all',
              value: 'List all to-do items',
            },
            {
              key: 'todo finished',
              value: 'List all finished to-do items',
            },
          ],
        },
      ],
      footer:
        'View More in Notion: <https://www.notion.so/15c028b3d5964dfb8270c7b46ec0803f?v=0810c029401a43b19bde45f4653c1b06>',
    },
  ],
};

export { content };
