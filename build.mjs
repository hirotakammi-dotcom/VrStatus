import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import swc from "@swc/core";

const pluginDir = "plugins/VrStatus";
const outputDir = "dist/VrStatus";
const manifest = JSON.parse(await readFile(`${pluginDir}/manifest.json`, "utf8"));

const extensions = [".js", ".jsx", ".mjs", ".ts", ".tsx", ".cts", ".mts"];
const plugins = [
    nodeResolve(),
    commonjs(),
    {
        name: "swc",
        async transform(code, id) {
            const ext = id.slice(id.lastIndexOf("."));
            if (!extensions.includes(ext)) return null;

            const isTypeScript = ext.includes("ts");
            const isTsx = isTypeScript ? ext.endsWith("x") : undefined;
            const isJsx = !isTypeScript ? ext.endsWith("x") : undefined;

            const result = await swc.transform(code, {
                filename: id,
                jsc: {
                    parser: {
                        syntax: isTypeScript ? "typescript" : "ecmascript",
                        tsx: isTsx,
                        jsx: isJsx
                    },
                    target: "es2020"
                },
                module: { type: "es6" }
            });
            return result.code;
        }
    },
    esbuild({ minify: true })
];

await mkdir(outputDir, { recursive: true });

const bundle = await rollup({
    input: `${pluginDir}/${manifest.main}`,
    external: (id) => id.startsWith("@vendetta/") || id === "react",
    plugins,
    onwarn(warning, defaultHandler) {
        if (warning.code === "THIS_IS_UNDEFINED") return;
        defaultHandler(warning);
    }
});

await bundle.write({
    file: `${outputDir}/index.js`,
    format: "iife",
    name: "VrStatus",
    compact: true,
    exports: "named",
    globals(id) {
        if (id.startsWith("@vendetta/")) {
            return id.replace(/^@/, "").replace(/\\//g, ".");
        }
        if (id === "react") return "window.React";
        return id;
    }
});
await bundle.close();

const js = await readFile(`${outputDir}/index.js`);
manifest.main = "index.js";
manifest.hash = createHash("sha256").update(js).digest("hex");
await writeFile(`${outputDir}/manifest.json`, JSON.stringify(manifest, null, 2) + "\n");
await writeFile("dist/.nojekyll", "");
await writeFile("dist/index.html", "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>VrStatus</title></head><body><h1>VrStatus</h1><p>Kettu plugin files are published in <a href=\"./VrStatus/\">./VrStatus/</a>.</p></body></html>");
console.log("Built dist/VrStatus/manifest.json and dist/VrStatus/index.js");
