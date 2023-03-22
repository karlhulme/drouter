import { rapidoc, rapidocMap } from "../autogen.rapidoc.ts";

/**
 * Returns a response containing a documentation page.
 */
export function docsPageResponse(): Response {
  // Important - must specify the !doctype directive and the meta charset tag.
  const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="description" content="Service documentation.">
        <script type="module" src="/rapidoc-min.js" />
      </head>
      <body>
        <rapi-doc
          spec-url="/openapi"
          theme="dark"
          render-style="focused"
          show-header="false"
          schema-style="table"
          schema-description-expanded="true"
          default-schema-tab="schema"
        ></rapi-doc>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      "content-type": "text/html;charset=utf-8",
    },
  });
}

/**
 * Returns the rapidoc code for the docs page.
 */
export function docsPageRapidocCodeResponse(): Response {
  return new Response(rapidoc(), {
    headers: {
      "content-type": "text/javascript; charset=utf-8",
    },
  });
}

/**
 * Returns the rapidoc source code map for the docs page.
 */
export function docsPageRapidocMapResponse(): Response {
  return new Response(rapidocMap(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
