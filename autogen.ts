import { encodeBase64 } from "./deps.ts";

async function autogenRapidoc() {
  const response = await fetch(
    "https://unpkg.com/rapidoc@9.3.4/dist/rapidoc-min.js",
  );

  const sourceCode = await response.text();

  const mapResponse = await fetch(
    "https://unpkg.com/rapidoc@9.3.4/dist/rapidoc-min.js.map",
  );

  const mapSourceCode = await mapResponse.text();

  // Base64 encoding increases size from 1.1MB to 1.4MB.
  await Deno.writeTextFile(
    "./src/autogen.rapidoc.ts",
    `
    import { decodeBase64 } from "../deps.ts"

    export function rapidoc() {
      return decodeBase64(\`${encodeBase64(sourceCode)}\`);
    }
    
    export function rapidocMap() {
      return decodeBase64(\`${encodeBase64(mapSourceCode)}\`);
    }
    `,
  );
}

async function autogenFavicon() {
  const contents = await Deno.readFile("./favicon.ico");

  const contentsAsString = `JSON.parse("[${contents.join(",")}]")`;

  // Develop icon using https://www.xiconeditor.com/.
  // Upload existing favicon, edit, and re-download.

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
