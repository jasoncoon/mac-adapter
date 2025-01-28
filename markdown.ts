import { Data, Mode } from "./types.ts";
import { formatNumber, getDescription } from "./utils.ts";

export function getMarkdown(data: Data) {
  const adapters = data.AppleRawAdapterDetails;

  const markdownItems = adapters.map((adapter, adapterIndex) => {
    const {
      Description: description,
      Manufacturer: manufacturer,
      Name: name,
      UsbHvcMenu: modes,
      UsbHvcHvcIndex: activemodeIndex,
    } = adapter;

    const details = [
      { name: "Manufacturer", value: manufacturer },
      { name: "Name", value: name },
      {
        name: "Description",
        value: getDescription(description),
      },
    ];

    if (modes.length > 1) {
      details.push({
        name: "Modes",
        value: getModesMarkdown(modes, activemodeIndex),
      });
    } else if (modes.length < 2) {
      details.push(
        {
          name: "Voltage",
          value: `${formatNumber(adapter.AdapterVoltage / 1000)}V`,
        },
        {
          name: "Current",
          value: `${formatNumber(adapter.Current / 1000)}A`,
        },
        {
          name: "Power",
          value: `${formatNumber(adapter.Watts)}W`,
        }
      );
    }

    return `Adapter ${adapterIndex + 1}${
      adapters.length > 1 && data.BestAdapterIndex === adapterIndex
        ? " ★ Best"
        : ""
    }
${details
  .filter((detail) => !!detail.value)
  .map((detail) => `* ${detail.name}: ${detail.value}`)
  .join("\n")}`;
  });

  const markdown = markdownItems.join("\n\n---\n\n");
  return markdown;
}

function getModesMarkdown(
  modes: Mode[],
  activeIndex?: number
): string | undefined {
  if (!modes) return undefined;

  return `
  * ${modes
    ?.map((item) => getModeMarkdown(item, modes.length, activeIndex))
    .join("\n  * ")}`;
}

function getModeMarkdown(
  { MaxVoltage, MaxCurrent, Index }: Mode,
  count: number,
  activeIndex?: number
): string {
  if (!MaxCurrent || !MaxVoltage) return "";

  const volts = MaxVoltage / 1000;
  const amps = MaxCurrent / 1000;
  const watts = volts * amps;

  return `${formatNumber(volts)}V ${formatNumber(amps)}A (${formatNumber(
    watts
  )}W)${count > 1 && activeIndex === Index ? " ✔ Active" : ""}`;
}
