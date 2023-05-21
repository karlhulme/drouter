import { rapidoc, rapidocMap } from "../autogen.rapidoc.ts";
import { ServiceConfig } from "../index.ts";

/**
 * Returns a response containing a documentation page.
 */
export function docsPageResponse(config: ServiceConfig): Response {
  // Important - must specify the !doctype directive and the meta charset tag.
  const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="description" content="Service documentation.">
        <script type="module" src="/rapidoc-min.js"></script>
      </head>
      <body>
        <rapi-doc
          spec-url="/openapi"
          theme="dark"
          sort-tags="true"
          sort-endpoints-by="summary"
          render-style="focused"
          show-header="false"
          schema-style="table"
          schema-description-expanded="true"
          persist-auth="true"
        >
          <div slot="overview">
            ${config.overviewHtml || ""}
          </div>

          <div slot="auth">
            ${config.authHtml || ""}
          </div>
        </rapi-doc>
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
