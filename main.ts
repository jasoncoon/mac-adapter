import { Command } from "@cliffy/command";
import plist from "https://esm.sh/simple-plist@1.4.0";

class Runner {
  constructor(readonly verbose: boolean, readonly output: string) {}

  async run() {
    const { output } = this;

    const args = ["-ar", "-c", "AppleSmartBattery"];

    this.logIfVerbose(`Running ioreg ${args.join(" ")}`);

    const command = new Deno.Command("ioreg", {
      args,
    });

    const { code, stdout } = await command.output();

    if (code !== 0) {
      console.log(`ioreg returned error code ${code}`);
      Deno.exit(code);
    }

    const directory = `output/${output}`;
    const filePath = `${Deno.cwd()}/${directory}/${output}`;

    if (output) {
      this.logIfVerbose(
        `Writing ${stdout.length.toLocaleString()} bytes to ${filePath}.xml`
      );

      await Deno.mkdir(directory, { recursive: true });
      await Deno.writeFile(`${filePath}.xml`, stdout);
    }

    this.logIfVerbose(
      `Parsing ${stdout.length.toLocaleString()} bytes from ioreg stdout`
    );

    const data = plist.parse<AppleSmartBattery[]>(
      new TextDecoder().decode(stdout)
    );

    if (output) {
      const json = JSON.stringify(data, null, 2);

      this.logIfVerbose(
        `Writing ${json.length.toLocaleString()} bytes to ${filePath}.json`
      );

      await Deno.writeTextFile(`${filePath}.json`, json);
    }

    const root = data?.[0];
    const adapterDetails = root?.AdapterDetails;

    if (!root.ExternalConnected || !adapterDetails) {
      console.log("No connected adapter details found, is it plugged in?");
      Deno.exit(1);
    }

    const {
      Manufacturer: manufacturer,
      Name: name,
      Description: description,
      UsbHvcMenu: capabilities,
      UsbHvcHvcIndex: activeCapabilityIndex,
    } = adapterDetails;

    const details = [
      { name: "Manufacturer", value: manufacturer },
      { name: "Name", value: name },
      { name: "Description", value: description },
    ];

    if (adapterDetails.UsbHvcMenu?.length) {
      details.push({
        name: "Capabilities",
        value: formatCapabilities(capabilities, activeCapabilityIndex),
      });
    }

    const markdown = `Adapter Details:
${details
  .filter((detail) => !!detail.value)
  .map((detail) => `* ${detail.name}: ${detail.value}`)
  .join("\n")}`;

    if (output) {
      this.logIfVerbose(
        `Writing ${markdown.length.toLocaleString()} bytes to ${filePath}.md`
      );

      await Deno.writeTextFile(`${filePath}.md`, markdown);
    }

    console.log(markdown);
  }

  // deno-lint-ignore no-explicit-any
  logIfVerbose(...data: any[]) {
    if (!this.verbose) {
      return;
    }

    console.log(data);
  }
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
  .action(
    async ({ verbose, output }) => await new Runner(verbose, output).run()
  )
  .parse();

function formatCapability(
  { MaxVoltage, MaxCurrent, Index }: Capability,
  activeIndex?: number
): string {
  if (!MaxCurrent || !MaxVoltage) return "";

  return `${MaxVoltage / 1000}V ${MaxCurrent / 1000}A (${
    (MaxVoltage / 1000) * (MaxCurrent / 1000)
  }W)${activeIndex === Index ? " <- active" : ""}`;
}

function formatCapabilities(
  capabilities?: Capability[],
  activeIndex?: number
): string | undefined {
  if (!capabilities) return undefined;

  return `
  * ${capabilities
    ?.map((item) => formatCapability(item, activeIndex))
    .join("\n  * ")}`;
}

interface AppleSmartBattery {
  AdapterDetails: {
    Description?: string;
    Manufacturer?: string;
    Name?: string;
    UsbHvcHvcIndex?: number;
    UsbHvcMenu?: Capability[];
  };
  ExternalConnected: boolean;
}

interface Capability {
  Index: number;
  MaxCurrent?: number;
  MaxVoltage?: number;
}
