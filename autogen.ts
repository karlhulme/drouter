async function autogenRapidoc() {
  const response = await fetch(
    "https://unpkg.com/rapidoc@9.3.4/dist/rapidoc-min.js",
  );

  const sourceCode = await response.text();

  const mapResponse = await fetch(
    "https://unpkg.com/rapidoc@9.3.4/dist/rapidoc-min.js.map",
  );

  const mapSourceCode = await mapResponse.text();

  await Deno.writeTextFile(
    "./src/autogen.rapidoc.ts",
    `export function rapidoc() {
      return decodeURIComponent(\`${encodeURIComponent(sourceCode)}\`);
    }
    
    export function rapidocMap() {
      return decodeURIComponent(\`${encodeURIComponent(mapSourceCode)}\`);
    }
    `,
  );
}

async function autogenFavicon() {
  const contents = await Deno.readFile("./favicon.ico");

  const contentsAsString = `JSON.parse("[${contents.join(",")}]")`;

  await Deno.writeTextFile(
    "./src/autogen.favicon.ts",
    `export function favicon() {
      return new Uint8Array(${contentsAsString});
    }`,
  );
}

const arg = Deno.args.length > 0 ? Deno.args[0] : "";

if (arg === "rapidoc") {
  await autogenRapidoc();
} else if (arg === "favicon") {
  await autogenFavicon();
} else {
  console.log(`Autogen instruction not recognised: ${arg}`);
}
