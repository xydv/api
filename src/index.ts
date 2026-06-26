import { Elysia, status, t } from "elysia";
import { Api, TelegramClient } from "telegram";
import { MarkdownV2Parser } from "telegram/extensions/markdownv2";
import { StringSession } from "telegram/sessions";
import { cors } from "@elysiajs/cors";
import { createResponse } from "better-sse";
import { musicChannel } from "./channels/musicChannel";
import { TrackData } from "./types";
import { Telegraf } from "telegraf";

// const session = new StringSession(Bun.env.TG_SESSION);

// const client = new TelegramClient(
//   session,
//   parseInt(Bun.env.TG_API_ID!),
//   Bun.env.TG_API_HASH!,
//   {},
// );

// await client.connect();

const app = new Elysia();
const bot = new Telegraf(process.env.BOT_TOKEN);

app.use(cors());

// app.get("/", async () => {
//   const { messages } = (await client.invoke(
//     new Api.channels.GetMessages({
//       channel: "adityadebug",
//       id: [new Api.InputMessageID({ id: 2 })],
//     }),
//   )) as Api.messages.ChannelMessages;

//   const message = messages[0] as Api.Message;

//   return message.message.split("\n");
// });

// app.get(
//   "/:messageId",
//   async ({ params: { messageId } }) => {
//     const { count, messages } = (await client.invoke(
//       new Api.channels.GetMessages({
//         channel: "adityathinks",
//         id: [new Api.InputMessageID({ id: messageId })],
//       }),
//     )) as Api.messages.ChannelMessages;

//     if (count != 1) {
//       return status(400, "Bad Request");
//     }

//     const message = messages[0] as Api.Message;

//     const markdown = MarkdownV2Parser.unparse(
//       message.message,
//       message.entities,
//     );

//     return {
//       id: message.id,
//       date: message.date,
//       editDate: message.editDate,
//       markdown,
//       views: message.views,
//       displayText: message.message.replaceAll("\n", " "),
//       reactions: message.reactions?.results.map((r) => {
//         return { reaction: r.reaction, count: r.count };
//       }),
//     };
//   },
//   {
//     params: t.Object({
//       messageId: t.Number(),
//     }),
//   },
// );

// sse
app.get("/music", (c) => {
  return createResponse(c.request, (session) => {
    musicChannel.register(session);
  });
});

// send anonymous messages
app.post(
  "/message",
  async ({ body }) => {
    try {
      await bot.telegram.sendMessage(process.env.TG_ID, body.message);
      return status(200);
    } catch (e) {
      return status(500);
    }
  },
  {
    body: t.Object({ message: t.String() }),
  },
);

app.post(
  "/2.0",
  async ({ body }) => {
    switch (body.method) {
      case "auth.getMobileSession":
        if (
          body.username != process.env.ID_PASS ||
          body.password != process.env.ID_PASS
        )
          return status(400);
        return {
          session: {
            key: process.env.LASTFM_SECRET,
          },
        };
      case "track.updateNowPlaying": {
        if (body.sk != process.env.LASTFM_SECRET) return status(400);
        const trackData = {
          duration: body.duration !== undefined ? String(body.duration) : "0",
          artist: body.artist ?? "unknown artist",
          album: body.album ?? "unknown album",
          track: body.track ?? "unknown track",
        };
        musicChannel.broadcast(trackData, "update");
        musicChannel.state.track = trackData;
        return {};
      }
      case "track.scrobble":
        // musicChannel.broadcast(body, "update");
        return {};
      default:
        console.log(body);
        return {};
    }
  },
  {
    body: t.Object({
      method: t.String(),
      // auth.getMobileSession
      username: t.Optional(t.String()),
      password: t.Optional(t.String()),
      authToken: t.Optional(t.String()),
      format: t.Optional(t.Union([t.Literal("json"), t.Literal("xml")])),
      // track.updateNowPlaying / track.scrobble
      sk: t.Optional(t.String()),
      artist: t.Optional(t.String()),
      track: t.Optional(t.String()),
      album: t.Optional(t.String()),
      duration: t.Optional(t.Union([t.String(), t.Number()])),
    }),
  },
);

app.listen(3000);
