import GetWeatherDataAlert from './extensions/weather';
import { cacheChatInfo, sendChat } from './zoom-chat';

export const webhookHandler = async (): Promise<void> => {
  const weatherTips = await GetWeatherDataAlert();
  await sendChat({
    content: {
      head: {
        text: '_Daily Alert_',
        sub_head: {
          text: '*Weather Tips and something*',
        },
      },
      body: [
        {
          type: 'message',
          text: `>${weatherTips}`,
        },
      ],
    },
    is_markdown_support: true,
    ...cacheChatInfo,
  });
};
