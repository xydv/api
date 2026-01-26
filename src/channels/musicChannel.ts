import { createChannel } from "better-sse";
import { TrackDataType } from "../types";

const musicChannel = createChannel<{ track: TrackDataType }>({
  state: {
    track: {
      duration: 420,
      artist: "http",
      album: "404",
      id: "xxx",
      title: "not playing",
      liked: false,
      thumbnailUrl: "",
    },
  },
});

// new user gets the last played song directly
musicChannel.on("session-registered", (session) => {
  session.push(musicChannel.state.track, "update");
});

export { musicChannel };
