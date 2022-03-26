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

const port = portWithDefault(8080);

const config = {
  consumerKey: Deno.env.get("CONSUMER_KEY"),
  redirectUri: `http://localhost:${port}/requestToken`,
};

const log = (text: string): void => console.log(`[pocket-oauth-flow]: ${text}`);

const htmlResponse = (html: string): Response =>
  new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });

const root = (): Response => {
  return htmlResponse(
    `
        <html>
            <body>
                <p><a href="#" onclick="document.forms[0].submit()">Start</a></p>
                <form method="post" action="https://getpocket.com/v3/oauth/request">
                    <input type="hidden" value="${config.consumerKey}" name="consumer_key" />
                    <input type="hidden" value="${config.redirectUri}" name="redirect_uri" />
                </form>
        </html>
    `
  );
};

const handler = (request: Request): Response => {
  const url = new URL(request.url);
  const path = url.pathname;
  log(`Received request to ${path}`);
  switch (path) {
    case "/":
      return root();
    default:
      return new Response("Unhandled root");
  }
};

log(`Webserver running at http://localhost:${port}`);
await serve(handler, { port });
