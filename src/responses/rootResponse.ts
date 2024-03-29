import { ServiceConfig } from "../interfaces/index.ts";

/**
 * Returns a root response.
 * @param config The configuration for the service.
 */
export function rootResponse(config: ServiceConfig) {
  const html = `<!doctype html>
    <html>
      <head>
        <meta name="description" content="Root.">
      </head>
      <style>
        body {
          background-color: white;
          color: black;
        }
        a {
          color: blue;
        }

        @media (prefers-color-scheme: dark) {
          body {
            background-color: black;
            color: white;
          }
          a {
            color: cyan;
          }
        }
      </style>
      <body>
        <h1>
          ${config.title}
        </h1>
        <p>
          ${config.description}
        </p>
        <ul>
          <li>
            <a href="/docs">Documentation</a>
          </li>
          <li>
            <a href="/health">Health</a>
          </li>
          <li>
            <a href="/openapi">OpenAPI specification</a>
          </li>
        </ul>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      "content-type": "text/html;charset=utf-8",
    },
  });
}
