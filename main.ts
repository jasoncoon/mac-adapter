import plist from "https://esm.sh/simple-plist@1.4.0";

if (import.meta.main) {
  printData();
}

async function printData() {
  const args = Deno.args;

  const filename = args[0] ?? "output";

  console.log(`Running ioreg -acrw0 AppleSmartBattery`);
  const command = new Deno.Command("ioreg", {
    args: ["-afrw0", "-c", "AppleSmartBattery"],
  });

  const { code, stdout } = await command.output();

  if (code !== 0) {
    console.log(`ioreg returned error code ${code}`);
    return;
  }

  console.log(
    `Writing ${stdout.length.toLocaleString()} bytes to ${filename}.xml`
  );

  await Deno.writeFile(`${filename}.xml`, stdout);

  console.log(`Parsing ${filename}.xml`);

  const data = plist.readFileSync<AppleSmartBattery[]>(`${filename}.xml`);

  const json = JSON.stringify(data, null, 2);

  console.log(
    `Writing ${json.length.toLocaleString()} bytes to ${filename}.json`
  );

  await Deno.writeTextFile(`${filename}.json`, json);

  if (!data.length) {
    console.log("No adapter details found, is it plugged in?");
    return;
  }

  const adapterDetails = data[0].AdapterDetails;

  if (!adapterDetails || !adapterDetails.Manufacturer) {
    console.log("No adapter details found, is it plugged in?");
    return;
  }

  console.log(`
Adapter Details:
* Manufacturer: ${adapterDetails.Manufacturer}
* Name: ${adapterDetails.Name}
* Voltage: ${(adapterDetails.AdapterVoltage ?? 0) / 1000}V
* Current: ${(adapterDetails.Current ?? 0) / 1000}A
* Capabilities:
${adapterDetails.UsbHvcMenu?.map(
  (capability) =>
    `  * ${capability.MaxVoltage / 1000}V ${capability.MaxCurrent / 1000}A`
).join("\n")}`);
}

interface AppleSmartBattery {
  AdapterDetails: {
    AdapterVoltage?: number;
    Current?: number;
    FamilyCode: number;
    Manufacturer?: string;
    Model?: string;
    Name?: string;
    UsbHvcHvcIndex?: number;
    UsbHvcMenu?: {
      Index: number;
      MaxCurrent: number;
      MaxVoltage: number;
    }[];
    Watts?: number;
  };
}
