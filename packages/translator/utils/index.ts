import endent from 'endent';
import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';

const createPrompt = (
  inputLanguage: string,
  outputLanguage: string,
  inputCode: string,
): string => {
  return endent`
    You are an expert translator in all languages. Translate the wording from "${inputLanguage}"  to "${outputLanguage}". Do not include \`\`\`.
    do not write explanations.
    do not replace "{**}" , "[*]" and any html tag with anything.
    input content format is '{key}={value}', do not translate key. and keep the same key in output.
    
    Example translating from English to Chinese:

    input example English: test_my_access_wording=You can only access to {0} in your own data center region ”{1}”.  <a href="/account/setting" target="_blank" aria-label="update storage location setting">Update Setting</a>
    output example Chinese: test_my_access_wording=你只能在自己的数据中心区域“{1}”中访问{0}。  <a href="/account/setting" target="_blank" aria-label="update storage location setting">更新设置</a>
    
    ${inputLanguage}:
    ${inputCode}

    please translate to ${outputLanguage}:
    `;
};

export const OpenAIStream = async (
  inputLanguage: string,
  outputLanguage: string,
  inputCode: string,
  model: string,
): Promise<ReadableStream<any>> => {
  const prompt = createPrompt(inputLanguage, outputLanguage, inputCode);
  const system = { role: 'system', content: prompt };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model,
      messages: [system],
      temperature: 0,
      stream: true,
    }),
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const statusText = res.statusText;
    const result = await res.body?.getReader().read();
    throw new Error(
      `OpenAI API returned an error: ${
        decoder.decode(result?.value) || statusText
      }`,
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval): void => {
        if (event.type === 'event') {
          const data = event.data;

          if (data === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};
