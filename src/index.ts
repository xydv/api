import { Elysia, status, t } from "elysia";
import { Api, TelegramClient } from "telegram";
import { MarkdownV2Parser } from "telegram/extensions/markdownv2";
import { StringSession } from "telegram/sessions";
import { cors } from "@elysiajs/cors";
import { createResponse } from "better-sse";
import { musicChannel } from "./channels/musicChannel";
import { TrackData } from "./types";

const session = new StringSession(Bun.env.TG_SESSION);

const client = new TelegramClient(
  session,
  parseInt(Bun.env.TG_API_ID!),
  Bun.env.TG_API_HASH!,
  {},
);

await client.connect();

const app = new Elysia();

app.use(cors());

app.get("/", async () => {
  const { messages } = (await client.invoke(
    new Api.channels.GetMessages({
      channel: "adityadebug",
      id: [new Api.InputMessageID({ id: 2 })],
    }),
  )) as Api.messages.ChannelMessages;

  const message = messages[0] as Api.Message;

  return message.message.split("\n");
});

app.get(
  "/:messageId",
  async ({ params: { messageId } }) => {
    const { count, messages } = (await client.invoke(
      new Api.channels.GetMessages({
        channel: "adityathinks",
        id: [new Api.InputMessageID({ id: messageId })],
      }),
    )) as Api.messages.ChannelMessages;

    if (count != 1) {
      return status(400, "Bad Request");
    }

    const message = messages[0] as Api.Message;

    const markdown = MarkdownV2Parser.unparse(
      message.message,
      message.entities,
    );

    return {
      id: message.id,
      date: message.date,
      editDate: message.editDate,
      markdown,
      views: message.views,
      displayText: message.message.replaceAll("\n", " "),
      reactions: message.reactions?.results.map((r) => {
        return { reaction: r.reaction, count: r.count };
      }),
    };
  },
  {
    params: t.Object({
      messageId: t.Number(),
    }),
  },
);

// sse
app.get("/music", (c) => {
  return createResponse(c.request, (session) => {
    musicChannel.register(session);
  });
});

// webhook to channel
app.post(
  `/wh/${process.env.SECRET}`,
  ({ body }) => {
    musicChannel.broadcast(body, "update");
    musicChannel.state.track = body;
    return status(200);
  },
  {
    body: TrackData,
  },
);

app.listen(8000);
