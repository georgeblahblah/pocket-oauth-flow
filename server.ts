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
const log = (text: any): void => console.log(`[pocket-oauth-flow]: ${text}`);

const port = portWithDefault(8080);
const config = {
  consumerKey: Deno.env.get("CONSUMER_KEY") || "",
  redirectUri: `http://localhost:${port}/callback`,
};

const htmlResponse = (html: string): Response =>
  new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });

const requestToken = await getRequestToken();

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const path = url.pathname;
  log(`Received request to ${path}`);
  switch (path) {
    case "/": {
      const url = new URL(`https://getpocket.com/auth/authorize`);
      url.searchParams.append("request_token", requestToken);
      url.searchParams.append("redirect_uri", config.redirectUri);
      return Response.redirect(url.toString());
    }
    case "/callback": {
      const accessToken = await convertRequestTokenToAccessToken(requestToken);
      return htmlResponse(`<h1>${accessToken}</h1>`);
    }
    default:
      return new Response("Unhandled path");
  }
};

async function post(url: string, body: string): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF8",
      "X-Accept": "application/json",
    },
    body,
  });
}

async function getRequestToken(): Promise<string> {
  log("Fetching request token");
  const resp = await post(
    "https://getpocket.com/v3/oauth/request",
    JSON.stringify({
      consumer_key: config.consumerKey,
      redirect_uri: config.redirectUri,
    })
  );
  const json = (await resp.json()) as { code: string };
  return json.code;
}

async function convertRequestTokenToAccessToken(
  requestToken: string
): Promise<string> {
  log("Converting request token to access token");
  const resp = await post(
    `https://getpocket.com/v3/oauth/authorize`,
    JSON.stringify({
      consumer_key: config.consumerKey,
      code: requestToken,
    })
  );
  const json = (await resp.json()) as { access_token: string };
  return json.access_token;
}

log(`Webserver running at http://localhost:${port}`);
serve(handler, { port });
