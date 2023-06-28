interface ZoomBotMessageRequestContent {
  head?: ZoomBotMessageRequestContentHeader;
  body: ZoomBotMessageRequestContentBody[];
}
interface ZoomBotMessageRequestContentHeader {
  text: string;
  sub_head?: {
    text: string;
  };
}
interface AttachmentMessage {
  type: 'attachments';
  img_url: string;
  ext?: 'jpg' | 'png' | 'gif' | 'jpeg';
  resource_url: string;
  information: {
    title: {
      text: string;
      style?: Record<string, string>;
    };
    description: {
      text: string;
      style?: Record<string, string>;
    };
  };
}
interface TextMessage {
  type: 'message';
  text: string;
}
interface SectionMessage {
  type: 'section';
  sections: [
    {
      type: 'message';
      style: Record<string, string>;
      text?: string;
      link?: string; // todo
    },
  ];
}

interface FieldsMessage {
  type: 'fields';
  items: {
    key: string;
    value: string;
    link?: string | undefined;
  }[];
}

interface ZoomBotMessageRequestContentBody {
  type: 'section' | 'message' | 'fields' | 'attachments';
  sidebar_color?: string;
  sections?: [AttachmentMessage | TextMessage | SectionMessage | FieldsMessage];
  text?: string;
  footer?: string;
  footer_icon?: string; // todo
}

type ZoomChatContext = {
  robot_jid: string;
  to_jid: string;
  account_id: string;
  user_jid: string;
};
type ZoomChatbotParams = ZoomChatContext & {
  content: ZoomBotMessageRequestContent;
  is_markdown_support?: boolean;
};

export {
  ZoomChatContext,
  ZoomChatbotParams,
  ZoomBotMessageRequestContent,
  ZoomBotMessageRequestContentHeader,
  ZoomBotMessageRequestContentBody,
  SectionMessage, // todo
};

// {
//   type: "attachments",
//   resource_url: "https://zoom.us",
//   information: {
//     title: {
//       text: "I am an attachment title"
//     },
//     description: {
//       text: "I am an attachment description"
//     }
//   }
// }

// {
//   head: {
//     text: "I am a header",
//     sub_head: {
//       text: "I am a sub header"
//     }
//   },
//   body: [
//     {
//       type: "section",
//       sidebar_color: "#ffffff",
//       sections: [
//         {
//           type: "message",
//           text: "I am a message with text"
//         }
//       ],
//       footer: "I am a footer",
//       footer_icon: "https://d24cgw3uvb9a9h.cloudfront.net/static/93516/image/new/ZoomLogo.png",
//       ts: 1560446471819
//     },
//     {
//       type: "section",
//       sidebar_color: "#F56416",
//       sections: [
//         {
//           type: "message",
//           text: "I am a message with text"
//         }
//       ],
//       footer: "I am a footer",
//       footer_icon: "https://upload.wikimedia.org/wikipedia/en/thumb/5/58/San_Francisco_Giants_Logo.svg/1200px-San_Francisco_Giants_Logo.svg.png",
//       ts: 1560446471819
//     }
//   ]

// }

// {
//   head: {
//     text: "_this header is italic_",
//     sub_head: {
//       text: "~this sub header has a strikethrough~"
//     }
//   },
//   body: [
//     {
//       type: "message",
//       text: ">this text is bold"
//     }
//   ]
// }

// {
//   head: {
//     text: "_this header is italic_",
//     sub_head: {
//       text: "~this sub header has a strikethrough~"
//     }
//   },
//   body: [
//     {
//       type: "section",
//       sections: [
//         {
//           type: "message",
//           text: "*this text is bold*"
//         },
//         {
//           type: "fields",
//           items: [
//             {
//               key: "Code",
//               value: "`console.log('this form field value is monospace')`",
//               editable: false
//             }
//           ]
//         }
//       ],
//       footer: "<https://zoom.us>"
//     }
//   ] }

// {
//   head: {
//     text: "I am a header",
//     sub_head: {
//       text: "I am a sub header"
//     }
//   },
//   body: [
//     {
//       type: "select",
//       text: "Cars",
//       select_items: [
//         {
//           text: "Tesla",
//           value: "tesla"
//         },
//         {
//           text: "Ferrari",
//           value: "ferrari"
//         },
//         {
//           text: "Porsche",
//           value: "porsche"
//         },
//         {
//           text: "Mclaren",
//           value: "mclaren"
//         }
//       ]
//     }
//   ]
// }

export interface MessageWithHeader {
  head?: {
    text: string;
    style?: {
      color?: string;
      bold?: boolean;
      italic?: boolean;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

export interface MessageWithSubHeader {
  head?: {
    text: string;
    style?: {
      color?: string;
      bold?: boolean;
      italic?: boolean;
      [k: string]: unknown;
    };
    sub_head?: {
      text: string;
      style?: {
        color?: string;
        bold?: boolean;
        italic?: boolean;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

export interface MessageWithText {
  head?: {
    text: string;
    style?: {
      color?: string;
      bold?: boolean;
      italic?: boolean;
      [k: string]: unknown;
    };
    sub_head?: {
      text: string;
      style?: {
        color?: string;
        bold?: boolean;
        italic?: boolean;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

export interface MySchema {
  head?: {
    text: string;
    style?: {
      color?: string;
      bold?: boolean;
      italic?: boolean;
      [k: string]: unknown;
    };
    sub_head?: {
      text: string;
      style?: {
        color?: string;
        bold?: boolean;
        italic?: boolean;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  body?: {
    type: 'select';
    text: string;
    selected_item?: {
      text: string;
      value: string;
      [k: string]: unknown;
    };
    /**
     * Required if `static_source` is  **not** set.
     */
    select_items?: {
      text: string;
      value: string;
      [k: string]: unknown;
    }[];
    /**
     * Required if `select_items` is  **not** set.
     */
    static_source?: 'members' | 'channels';
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}

export interface MessageWithFormField {
  head?: {
    text: string;
    style?: {
      color?: string;
      bold?: boolean;
      italic?: boolean;
      [k: string]: unknown;
    };
    sub_head?: {
      text: string;
      style?: {
        color?: string;
        bold?: boolean;
        italic?: boolean;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  body?: {
    type: 'fields';
    items: {
      key: string;
      value: string;
      short?: boolean;
      style?: {
        color?: string;
        bold?: boolean;
        italic?: boolean;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}

export interface MessageWithAttachment {
  head?: {
    text: string;
    style?: {
      color?: string;
      bold?: boolean;
      italic?: boolean;
      [k: string]: unknown;
    };
    sub_head?: {
      text: string;
      style?: {
        color?: string;
        bold?: boolean;
        italic?: boolean;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  body?: {
    type: 'attachments';
    resource_url: string;
    img_url: string;
    information: {
      title: {
        text: string;
        style?: {
          color?: string;
          bold?: boolean;
          italic?: boolean;
          [k: string]: unknown;
        };
        [k: string]: unknown;
      };
      description?: {
        text: string;
        style?: {
          color?: string;
          bold?: boolean;
          italic?: boolean;
          [k: string]: unknown;
        };
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    ext?: 'pdf' | 'txt' | 'doc' | 'xlsx' | 'zip' | 'jpeg' | 'png';
    size?: number;
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
