# Mac Power Adapter Details

Use your MacBook as a USB-PD tester.

Tested only on a MacBook Pro with M4 Pro chip, running MacOS Sequoia 15.1.1. It may run and work on other hardware, but you may need to run or compile using [Deno](https://deno.com).

## Usage:

Run `./mac-adapter` from the command line.

Options:

| Option | Description | Default |
| ------ | ----------- | ------- |
| -h, --help | Show this help. | false |
| -V, --version | Show the version number for this program. | false |
| -v, --verbose | Print verbose debug information to the console. | false |
| -o, --output \<name> | The name of optional output directory and files. | "" |

If `--output <name>` is not specified, no output directory or files will be created.

If it is, a directory will be created in the current working directory with the path: ./output/name/

In this directory three files will be created:

* `/output/name/name.xml`
  * the raw output of running the 'ioreg -acrw0 AppleSmartBattery' command, in PList XML format. This can be very hard to read.
* `./output/name/name.json`
  * the output converted to JSON format, which I find much easier to read, both manually and programmatically.
* `./output/name/name.md`
  * the adapter details from the output summarized in Markdown format.

## Markdown Output Examples:

### Apple 70W USB-C Power Adapter:

Adapter Details:
* Manufacturer: Apple Inc.
* Name: 70W USB-C Power Adapter 
* Description: pd charger
* Wireless: false
* Capabilities:
  * 5V 2.96A (14.8W)
  * 9V 2.98A (26.82W)
  * 15V 2.99A (44.85W)
  * 20V 3.39A (67.8W) <- active

### Apple 20W USB-C Power Adapter:

Adapter Details:
* Manufacturer: Apple Inc.
* Name: 20W USB-C Power Adapter
* Description: pd charger
* Capabilities:
  * 5V 3A (15W)
  * 9V 2.22A (19.98W) <-active

### Battery pack 1:

Adapter Details:
* Manufacturer: undefined
* Name: undefined
* Description: pd charger
* Capabilities:
  * 5V 0.9A (4.5W) <-active

### Battery pack 2:

Adapter Details:
* Manufacturer: undefined
* Name: undefined
* Description: pd charger
* Capabilities:
  * 5V 3A (15W)
  * 9V 2.22A (19.98W) <-active

### Battery pack 3:

Adapter Details:
* Manufacturer: undefined
* Name: undefined
* Description: pd charger
* Voltage: 12V
* Current: 1.5A
* Watts: 18
* Capabilities:
  * 5V 2A (10W)
  * 9V 2A (18W)
  * 12V 1.5A (18W)
