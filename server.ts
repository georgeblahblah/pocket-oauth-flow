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
  consumerKey: Deno.env.get("CONSUMER_KEY") || "",
  redirectUri: `http://localhost:${port}/callback`,
};

const log = (text: string): void => console.log(`[pocket-oauth-flow]: ${text}`);

const htmlResponse = (html: string): Response =>
  new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const path = url.pathname;
  log(`Received request to ${path}`);
  switch (path) {
    case "/": {
      const requestToken = await getRequestToken();
      const url = new URL(`https://getpocket.com/auth/authorize`);
      url.searchParams.append("request_token", requestToken);
      url.searchParams.append("redirect_uri", config.redirectUri);
      return Response.redirect(url.toString());
    }
    case "/callback":
      return new Response("");
    default:
      return new Response("Unhandled path");
  }
};

log(`Webserver running at http://localhost:${port}`);
serve(handler, { port });

async function getRequestToken(): Promise<string> {
  const resp = await fetch("https://getpocket.com/v3/oauth/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF8",
      "X-Accept": "application/json",
    },
    body: JSON.stringify({
      consumer_key: config.consumerKey,
      redirect_uri: config.redirectUri,
    }),
  });
  const json = (await resp.json()) as { code: string };
  return json.code;
}
