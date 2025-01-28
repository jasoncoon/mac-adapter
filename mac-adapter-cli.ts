import { Command } from "@cliffy/command";
import { getDataHtml } from "./html.ts";
import { getMarkdown } from "./markdown.ts";
import { Data } from "./types.ts";
import { getAdapters, logIfVerbose } from "./utils.ts";

async function start(verbose: boolean, output: string) {
  let data: Data;
  let xmlData: Uint8Array;

  try {
    const result = await getAdapters(verbose);
    data = result.data;
    xmlData = result.xmlData;
  } catch (error) {
    console.log(error);
    Deno.exit();
  }

  const directory = `output/${output}`;
  const filePath = `${Deno.cwd()}/${directory}/${output}`;

  if (output) {
    logIfVerbose(
      verbose,
      `Writing ${xmlData.length.toLocaleString()} bytes to ${filePath}.xml`
    );

    await Deno.mkdir(directory, { recursive: true });
    await Deno.writeFile(`${filePath}.xml`, xmlData);
  }

  if (output) {
    const json = JSON.stringify(data, null, 2);

    logIfVerbose(
      verbose,
      `Writing ${json.length.toLocaleString()} bytes to ${filePath}.json`
    );

    await Deno.writeTextFile(`${filePath}.json`, json);
  }

  if (output) {
    const html = getDataHtml(data);

    logIfVerbose(
      verbose,
      `Writing ${html.length.toLocaleString()} bytes to ${filePath}.html`
    );

    await Deno.writeTextFile(`${filePath}.html`, html);
  }

  if (!data.ExternalConnected || !data.AppleRawAdapterDetails.length) {
    console.log("No connected adapter details found, is it plugged in?");
    Deno.exit(1);
  }

  const markdown = getMarkdown(data);

  if (output) {
    logIfVerbose(
      verbose,
      `Writing ${markdown.length.toLocaleString()} bytes to ${filePath}.md`
    );

    await Deno.writeTextFile(`${filePath}.md`, markdown);
  }

  console.log(markdown);
}

await new Command()
  .name("mac-adapter")
  .description(
    `Mac power adapter details utility.

If --output <name> is supplied, a directory will be created in the current working directory with the path: ./output/name/

In this directory three files will be created:

* /output/name/name.xml
  * the raw output of running the 'ioreg -acrw0 AppleSmartBattery' command, in PList XML format. This can be very hard to read.

* ./output/name/name.json
  * the output converted to JSON format, which I find much easier to read, both manually and programmatically.

* ./output/name/name.md
  * the adapter details from the output summarized in Markdown format.`
  )
  .version("1.0.0")
  .option("-v, --verbose", "Print verbose debug information to the console.", {
    default: false,
  })
  .option(
    "-o, --output <name>",
    "The name of optional output directory and files. If unspecified, no output directory or files will be created. See the Description above for more details.",
    { default: "" }
  )
  .action(async ({ verbose, output }) => await start(verbose, output))
  .parse();
