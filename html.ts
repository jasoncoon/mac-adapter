import { Adapter, Data, Detail, Mode } from "./types.ts";
import { formatNumber, getDescription } from "./utils.ts";

export function getDataHtml(data: Data): string {
  const title = "Apple MacBook Power Adapter Details";

  const { AppleRawAdapterDetails: adapters } = data;

  const adapterCount = adapters.length;

  const summary = `Found ${adapterCount.toLocaleString()} power adapter${
    adapterCount !== 1 ? "s" : ""
  }${adapterCount > 0 ? ":" : ""}`;

  return `<!doctype html>
<html lang="en" data-bs-theme="dark">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  </head>
  <body>

    <nav class="navbar bg-body-tertiary">
      <div class="container-fluid">
        <a class="navbar-brand">
          <i class='bi bi-apple'></i>
          ${title}
        </a>
        <a href="https://github.com/jasoncoon/mac-adapter" target="_blank" rel="noreferrer noopener">
          <i class="bi bi-github"></i>
        </a>
      </div>
    </nav>

    <div class="container">

      <div style="margin: 1rem; margin-left: 0px;">
        ${summary}
      </div>
      
      <div class="row row-cols-1 row-cols-md-2 g-4">
        ${getAdapterCards(data)}
      </div>

      ${adapterCount > 0 ? "<hr />" : ""}

      ${
        adapterCount > 0
          ? `
      <div class="accordion accordion-flush" id="accordion">
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseRaw" aria-expanded="false" aria-controls="collapseRaw">
              Raw Details
            </button>
          </h2>
          <div id="collapseRaw" class="accordion-collapse collapse" data-bs-parent="#accordion">
            <div class="accordion-body">
              <pre><code>${JSON.stringify(data, null, 2)}</code></pre>
            </div>
          </div>
        </div>
      </div>`
          : ""
      }

    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
  </body>
</html>`;
}

function getAdapterCards(data: Data) {
  return data.AppleRawAdapterDetails.map((adaper, index) =>
    getAdapterCard(adaper, index, data.BestAdapterIndex)
  ).join("\n");
}

function getAdapterCard(
  adapter: Adapter,
  index: number,
  bestAdapterIndex: number
): string {
  const {
    Description: description,
    Manufacturer: manufacturer,
    Name: name,
    UsbHvcMenu: modes,
    UsbHvcHvcIndex: activeModeIndex,
  } = adapter;

  const manufacturerValue =
    manufacturer === undefined
      ? undefined
      : `${
          manufacturer?.startsWith("Apple")
            ? '<i class="bi bi-apple"></i> '
            : ""
        }${manufacturer}`;

  const details: Detail[] = [
    {
      name: "Manufacturer",
      value: manufacturerValue,
    },
    {
      name: "Name",
      value: name,
    },
    {
      name: "Description",
      value: getDescription(description),
    },
  ];

  if (modes.length > 1) {
    details.push({
      name: "Modes",
      value: getModeTable(modes, activeModeIndex),
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

  const filteredDetails = details.filter(
    (detail) => detail.value !== undefined && detail.value !== ""
  );

  return `
    <div class="col">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Adapter ${(index + 1).toLocaleString()} ${
    index === bestAdapterIndex
      ? '<span title="Best"<i class="bi bi-star-fill"></i></span>'
      : ""
  }</h5>
          ${getAdapterDetailTable(filteredDetails)}
        </div>
      </div>
    </div>`;
}

function getAdapterDetailTable(details: Detail[]): string {
  if (!details.length) return "";

  return `<div class="table-responsive">
  <table class="table table-sm">
    <tbody>
      ${details
        .map(
          (detail) => `<tr>
              <td>${detail.name}:</td>
              <td>${detail.value}</td>
            </tr>`
        )
        .join("\n")}
    </tbody>
  </table>
  </div>`;
}

function getModeTable(modes: Mode[], activeModeIndex?: number): string {
  if (!modes.length) return "";

  return `<table class="table table-sm">
    <thead>
      <tr>
        <th></th>
        <th>Voltage</th>
        <th>Current</th>
        <th>Power</th>
      </tr>
    </thead>
    <tbody>
      ${modes.map((mode) => getModeDetails(mode, activeModeIndex)).join("\n")}
    </tbody>
  </table>`;
}

function getModeDetails(mode: Mode, activeModeIndex?: number): string {
  const { MaxVoltage, MaxCurrent } = mode;

  if (!MaxCurrent || !MaxVoltage) return "";

  const volts = MaxVoltage / 1000;
  const amps = MaxCurrent / 1000;
  const watts = volts * amps;

  return `
    <tr>
      <td>${getActiveIndicator(mode.Index, activeModeIndex)}</td>
      <td>${formatNumber(volts)}V</td>
      <td>${formatNumber(amps)}A</td>
      <td>${formatNumber(watts)}W</td>
    </tr>`;
}

function getActiveIndicator(index: number, activeModeIndex?: number): string {
  return index === activeModeIndex
    ? "<span title='Active'><i class='bi bi-check'></i></span>"
    : "";
}
