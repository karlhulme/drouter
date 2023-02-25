import { rapidoc } from "../autogen.rapidoc.ts";

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
        <script type="module">
          ${rapidoc()}
        </script>
      </head>
      <body>
        <rapi-doc
          spec-url="/openapi"
          theme="dark"
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
