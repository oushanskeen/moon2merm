#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs";
import moon2mermaidBox from "../src/moon2mermaidBox.js";
import path from "path";

const argv = yargs(hideBin(process.argv))
  .scriptName("moon2merm")
  .usage(`
moon2merm - Convert Moon task graph and run report into a Mermaid diagram in order to make task dependencies and execution status explicit

Usage:
  moon2merm --moonGraph <file> --runReport <file> --outdir <dir>
`)
  .option("moonGraph", {
    type: "string",
    describe: "Output of: moon task-graph --json",
    demandOption: true,
  })
  .option("runReport", {
    type: "string",
    describe: "Path to .moon/cache/runReport.json",
    demandOption: true,
  })
  .option("outdir", {
    alias: "o",
    type: "string",
    describe: "Output directory for Mermaid markdown",
    demandOption: true,
  })
  .check((argv) => {
    // File existence checks
    if (!fs.existsSync(argv.moonGraph)) {
      throw new Error(`moonGraph file not found: ${argv.moonGraph}`);
    }

    if (!fs.existsSync(argv.runReport)) {
      throw new Error(`runReport file not found: ${argv.runReport}`);
    }

    try {
      JSON.parse(fs.readFileSync(argv.moonGraph, "utf8"));
    } catch {
      throw new Error("moonGraph is not valid JSON");
    }

    try {
      JSON.parse(fs.readFileSync(argv.runReport, "utf8"));
    } catch {
      throw new Error("runReport is not valid JSON");
    }

    if (!fs.existsSync(argv.outdir)) {
      fs.mkdirSync(argv.outdir, { recursive: true });
    }

    return true;
  })
  .help("h")
  .alias("h", "help")
  .strict()
  .fail((msg, err, yargs) => {
    console.error("\n❌ Error:", msg || err.message);
    console.log(yargs.help());
    process.exit(1);
  })
  .parse();

const moonGraph = JSON.parse(fs.readFileSync(argv.moonGraph, "utf8"));
const runReport = JSON.parse(fs.readFileSync(argv.runReport, "utf8"));

const box = moon2mermaidBox(moonGraph, runReport);
const mermaidString= box.mermaidString();

// TODO: think an adding optional timstamp
// const ts = new Date().toISOString().replace(/[:.]/g, "-");
const outFile = path.join(argv.outdir, `mermaidTaskGraph.md`);

fs.writeFileSync(outFile, mermaidString, "utf8");

console.log(`[moon2merm.js] Mermaid diagram created:\n\n${mermaidString}\n`);
console.log(`[moon2merm.js] Diagram written to: ${outFile}`);