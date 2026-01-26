import { t } from "elysia";

export const TrackData = t.Object({
  duration: t.Number(),
  artist: t.String(),
  album: t.String(),
  id: t.String(),
  title: t.String(),
  liked: t.Boolean(),
  thumbnailUrl: t.String(),
});

export type TrackDataType = typeof TrackData.static;
