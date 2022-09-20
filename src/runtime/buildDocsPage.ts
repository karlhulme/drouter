export function buildDocsPage() {
  // Important - must specify the !doctype directive and the meta charset tag.
  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <script type="module" src="https://unpkg.com/rapidoc/dist/rapidoc-min.js"></script>
      </head>
      <body>
        <rapi-doc
          spec-url="/openapi"
          theme = "dark"
        > </rapi-doc>
      </body>
    </html>
  `;
}
