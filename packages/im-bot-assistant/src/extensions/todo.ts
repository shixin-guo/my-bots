import { config } from 'dotenv';

import { Client } from '@notionhq/client';
import {
  CreatePageResponse,
  PageObjectResponse,
  UpdatePageResponse,
} from '@notionhq/client/build/src/api-endpoints';

config({ path: '.env' });

if (!process.env.NOTION_API_KEY) {
  throw new Error('NOTION_API_KEY is not defined');
}
if (!process.env.NOTION_DATABASE_ID) {
  throw new Error('NOTION_DATABASE_ID is not defined');
}

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
let cachedTodoList: ({ name: string; id?: string } | undefined)[] = [];

type TodoItemType = {
  id: string;
  name: string;
  link?: string;
  created_time: string;
};
const getTodoList = async (completed?: boolean): Promise<TodoItemType[]> => {
  const databases = await notion.databases.query({
    database_id: NOTION_DATABASE_ID,
    filter: {
      property: 'Done',
      checkbox: {
        equals: Boolean(completed),
      },
    },
  });
  const list = (databases.results as PageObjectResponse[]).map((item) => {
    if (item.properties) {
      const { Name, Done, created_time } = item.properties as any;
      if (Name && Done) {
        return {
          id: item.id,
          created_time: created_time.created_time, // todo
          name: Name.title[0].plain_text,
        };
      }
    }
  });
  cachedTodoList = list.filter((item) => item);
  return list.filter((item) => item !== undefined) as TodoItemType[];
};

const updateTodoItem = async ({
  index,
  done,
}: {
  index: number;
  done: boolean;
}): Promise<UpdatePageResponse> => {
  if (typeof cachedTodoList[index]?.id !== 'string') {
    throw new Error('Todo item not found');
  }
  const todo = await notion.pages.update({
    page_id: cachedTodoList[index]!.id || '',
    properties: {
      Done: {
        checkbox: done,
      },
    },
  });
  return todo;
};

const addTodoItem = async (text: string): Promise<CreatePageResponse> => {
  const result = await notion.pages.create({
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
      Name: { title: [{ text: { content: text } }] },
      Done: { checkbox: false },
    },
  });
  return result;
};

export const todoHandler = async (cmd: string[]): Promise<TodoItemType[]> => {
  const [_command, action, ...rest] = cmd;
  const text = rest.join(' ');
  switch (action) {
    case 'list': {
      return await getTodoList(false);
      break;
    }
    case 'finished': {
      return await getTodoList(true);
      break;
    }
    case 'add': {
      await addTodoItem(text);
      return await getTodoList(false);
      break;
    }
    case 'update':
    case 'done': {
      await updateTodoItem({ index: Number(text), done: true });
      return await getTodoList(false);
      break;
    }
    case 'all': {
      const completed = await getTodoList(true);
      const unCompleted = await getTodoList(false);
      return [...unCompleted, ...completed];
      break;
    }
    default: {
      return await getTodoList(false);
      break;
    }
  }
};
