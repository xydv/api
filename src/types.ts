import { t } from "elysia";

export const TrackData = t.Object({
  duration: t.String(),
  artist: t.String(),
  album: t.String(),
  track: t.String(),
});

export type TrackDataType = typeof TrackData.static;
