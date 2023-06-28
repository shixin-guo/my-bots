require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Yeah, api hub is available');
});

const sendMessagesChatGpt = async ({
  url = 'https://api.openai.com/v1/chat/completions',
  payload,
  requestHeaders,
}) => {
  try {
    const response = await axios({
      url,
      headers: requestHeaders,
      method: 'POST',
      data: payload,
    });
    return response.data;
  } catch (error) {
    console.log('== error ==', error);
    return 'I am sorry, I am not able to answer your question.';
  }
};

const callBack = async (data) => {
  const response = await axios({
    url: 'https://bot-api-server.vercel.app/callback',
    method: 'POST',
    data: data,
  });
  return response;
};

app.post('/subscribe', (req, res) => {
  let requestData = req.body || {};
  console.log('Received request:', requestData);
  const {
    url,
    requestHeaders = {},
    payload = {},
    chatContext = {},
  } = requestData;
  if (!(requestHeaders.Authorization && payload.messages)) {
    console.log('not Authorization or messages');
    return res.status(400).send('Bad Request');
  }
  // do not block the request
  sendMessagesChatGpt({
    url,
    payload,
    requestHeaders,
  })
    .then((resData) => {
      console.log('res data from ChatGpt = ', resData);
      callBack({
        chatGptResponse: resData,
        chatContext,
        messages: payload.messages,
      });
    })
    .catch((err) => {
      console.log('err from ChatGpt = ', err);
      callBack({
        // todo add a type definition for this
        chatGptResponse: {
          choices: [
            {
              messages: {
                content: JSON.stringify(err),
              },
            },
          ],
        },
        chatContext,
        messages: payload.messages,
      });
    });

  res.status(200).send('Hello from hub!');
});
app.listen(port, () => console.log(`listening on port ${port}!`));
