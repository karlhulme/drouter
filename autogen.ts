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

const arg = Deno.args.length > 0 ? Deno.args[0] : "";

if (arg === "rapidoc") {
  await autogenRapidoc();
} else {
  console.log(`Autogen instruction not recognised: ${arg}`);
}
