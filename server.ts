import { serve } from "https://deno.land/std@0.132.0/http/server.ts";

const portWithDefault = (defaultPort: number): number => {
  const port = Deno.env.get("PORT");
  if (port) {
    try {
      return Number.parseInt(port);
    } catch {
      return defaultPort;
    }
  }
  return defaultPort;
};
const log = (text: string): void => console.log(`[pocket-oauth-flow]: ${text}`);

const handler = (request: Request): Response => {
  return new Response("Hello");
};

const port = portWithDefault(8080);
log(`Webserver running at http://localhost:${port}`);
await serve(handler, { port });
