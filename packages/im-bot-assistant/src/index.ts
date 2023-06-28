import { config } from 'dotenv';

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

import { sendChat, updateCacheChatInfo } from './zoom-chat';
import { ZoomBotMessageRequestContent } from './types';
import { log } from './utils';
import { commandHandler } from './command';
import { webhookHandler } from './cron';

config({ path: '.env' });
if (!process.env.OPENAI_API_KEY) {
  log('OPENAI_API_KEY not set, skipping chatgpt');
}

const app = express();
const port = process.env.PORT || 7777;

app.use(bodyParser.json());

app.get('/', async (req: Request, res: Response) => {
  res.status(200);
  res.send(
    "I'm your virtual assistant. I'm here to help make your work experience more enjoyable and efficient. What can I help you?",
  );
});

app.get('/authorize', (req: Request, res: Response) => {
  res.redirect(
    'https://zoom.us/launch/chat?jid=robot_' + process.env.zoom_bot_jid,
  );
});

app.get('/support', (req: Request, res: Response) => {
  res.send('Contact gzpoffline@gmail.com for support.');
});

app.get('/privacy', (req: Request, res: Response) => {
  res.send('The Chatbot for Zoom does not store any user data.');
});

app.get('/terms', (req: Request, res: Response) => {
  res.send(
    'By installing the Chatbot for Zoom, you are accept and agree to these terms...',
  );
});

app.get('/documentation', (req: Request, res: Response) => {
  res.send(
    'Try typing "island" to see a photo of an island, or anything else you have in mind!',
  );
});

app.get('/zoomverify/verifyzoom.html', (req: Request, res: Response) => {
  res.send(process.env.zoom_verification_code);
});

app.get('/test', async (req: Request, res: Response) => {
  const response = await commandHandler(req, res);
  res.status(200);
  res.send(response);
});
app.post('/deauthorize', async (req: Request, res: Response) => {
  if (req.headers.authorization === process.env.zoom_verification_token) {
    res.status(200);
    res.send();
    const { client_id, user_id, account_id } = req.body.payload;
    const response = await fetch('https://api.zoom.us/oauth/data/compliance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' +
          Buffer.from(
            process.env.zoom_client_id + ':' + process.env.zoom_client_secret,
          ).toString('base64'),
        'cache-control': 'no-cache',
      },
      body: JSON.stringify({
        client_id,
        user_id,
        account_id,
        deauthorization_event_received: req.body.payload,
        compliance_completed: true,
      }),
    });
    if (!response) {
      log('No response from Zoom.');
    }
    const data = await response.json()!;
    log('/deauthorize data', data);
  } else {
    res.status(401);
    res.send('Unauthorized request to Chatbot for Zoom.');
  }
});

app.post('/webhook', async (req: Request, res: Response) => {
  log('webhook', req.body);
  await webhookHandler();
  res.status(200);
  res.send('test webhook');
});

app.post('/endpoint', async (req: Request, res: Response) => {
  if (req.headers.authorization === process.env.zoom_verification_token) {
    const { toJid, accountId, userJid } = req.body.payload;
    updateCacheChatInfo({
      robot_jid: process.env.zoom_bot_jid!,
      to_jid: toJid,
      account_id: accountId,
      user_jid: userJid,
    });
    await commandHandler(req, res);
    res.status(200);
    res.send();
  } else {
    res.status(401);
    res.send('Unauthorized request to Chatbot for Zoom.');
  }
});

// only for long time running tasks such as chatgpt!
app.post('/callback', async (req: Request, res: Response) => {
  log('callback', req.body.chatGptResponse.choices, req.body);
  const { chatContext, chatGptResponse, messages } = req.body;
  const content: ZoomBotMessageRequestContent = {
    head: {
      text: messages[0].content,
    },
    // body: [{ type: "message", text: responseFromChatGPT.text }],
    body: [
      {
        type: 'message',
        text: chatGptResponse.choices[0].message.content.replace(/^\n+/, ''),
      },
    ], // todo
  };
  await sendChat({
    content,
    is_markdown_support: true,
    ...chatContext,
  });
  res.status(200);
  res.send('test callback');
});

app.listen(port, () => log(`Chatbot is living in http://localhost:${port}`));
