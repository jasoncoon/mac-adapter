import plist from "https://esm.sh/simple-plist@1.4.0";
import { Data } from "./types.ts";

export async function getAdapters(verbose: boolean): Promise<{
  data: Data;
  xmlData: Uint8Array;
}> {
  const args = ["-ar", "-c", "AppleSmartBattery"];

  logIfVerbose(verbose, `Running ioreg ${args.join(" ")}`);

  const command = new Deno.Command("ioreg", {
    args,
  });

  const { code, stdout: xmlData } = await command.output();

  if (code !== 0) {
    throw new Error(`ioreg returned error code ${code}`);
  }

  logIfVerbose(
    verbose,
    `Parsing ${xmlData.length.toLocaleString()} bytes from ioreg stdout`
  );

  const root = plist.parse<Data[]>(new TextDecoder().decode(xmlData));

  const data = root[0];

  return { data, xmlData };
}

// deno-lint-ignore no-explicit-any
export function logIfVerbose(verbose: boolean, ...data: any[]) {
  if (!verbose) {
    return;
  }

  console.log(data);
}

export function getDescription(description: string): string {
  switch (description) {
    case "usb host":
      return "USB Host";

    case "pd charger":
      return "USB PD Charger";
  }

  return description;
}

const numberFormat = new Intl.NumberFormat(undefined, {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatNumber(number: number): string {
  return numberFormat.format(number);
}
