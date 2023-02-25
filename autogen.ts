async function autogenRapidoc() {
  const response = await fetch(
    "https://unpkg.com/rapidoc@9.3.4/dist/rapidoc-min.js",
  );
  const sourceCode = await response.text();

  await Deno.writeTextFile(
    "./src/autogen.rapidoc.ts",
    `export function rapidoc() {
      return decodeURIComponent(\`${encodeURIComponent(sourceCode)}\`);
    }`,
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
