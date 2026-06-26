declare module "bun" {
  interface Env {
    SECRET: string;
    TG_ID: string;
    BOT_TOKEN: string;
    TG_SESSION: string;
    TG_API_ID: string;
    TG_API_HASH: string;
    ID_PASS: string;
    LASTFM_SECRET: string;
  }
}
