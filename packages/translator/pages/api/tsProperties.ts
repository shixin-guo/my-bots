import { OpenAI } from 'langchain/llms/openai';
import { LLMChain } from 'langchain/chains';
import { CallbackManager } from 'langchain/callbacks';
import { ChainValues } from 'langchain/dist/schema';
import { CharacterTextSplitter } from 'langchain/text_splitter';

import { PromptTemplate } from 'langchain/prompts';
import { NextResponse } from 'next/server';

import { TranslateBody } from '@/types/types';
import { TranslatePropertiesPrompt } from '@/utils/prompt';
export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { inputLanguage, outputLanguage, inputCode } =
      (await req.json()) as TranslateBody;
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    let previousToken = '';
    const model = new OpenAI({
      streaming: true,
      maxTokens: 1000,
      callbackManager: CallbackManager.fromHandlers({
        handleLLMNewToken: async (curToken: string) => {
          await writer.ready;
          // add a test case and comment
          if (curToken !== '\n' || previousToken !== '\n') {
            await writer.write(encoder.encode(`${curToken}`));
          }
          previousToken = curToken;
        },
        handleLLMEnd: async () => {
          // console.log('====================handleLLMEnd====================');
        },
        handleLLMError: async (error: any) => {
          console.log('handleLLMError', error);
        },
      }),
      temperature: 0.1,
    });
    const splitter = new CharacterTextSplitter({
      separator: '\n',
      chunkSize: 800,
      chunkOverlap: 0,
    });
    const splitChunks = await splitter.createDocuments([inputCode]);
    const prompt = new PromptTemplate({
      template: TranslatePropertiesPrompt,
      inputVariables: ['inputLanguage', 'outputLanguage', 'inputCode'],
    });
    const chain = new LLMChain({ llm: model, prompt: prompt });

    const callChain = async ({
      pageContent,
    }: (typeof splitChunks)[0]): Promise<ChainValues> => {
      return new Promise((resolve, reject) => {
        chain
          .call({
            inputLanguage,
            outputLanguage,
            inputCode: pageContent.trim(),
          })
          .then((result) => {
            resolve(result);
          })
          .catch((error) => {
            reject(error);
          });
      });
    };
    const translateData = async (): Promise<void> => {
      for (let i = 0; i < splitChunks.length; i++) {
        await callChain(splitChunks[i]);
        if (i === splitChunks.length - 1) {
          await writer.ready;
          await writer.close();
        }
      }
    };
    translateData();
    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
};

export default handler;
