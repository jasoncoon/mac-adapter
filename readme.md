# Mac Power Adapter Details

Use your MacBook as a USB-PD tester.

Tested only on a MacBook Pro with M4 Pro chip, running MacOS Sequoia 15.1.1. It may run and work on other hardware, but you may need to run or compile using Deno.

Run `./mac-adapter output` where `output` is any file name.

It'll write three files:

* output.xml
* output.json
* output.md

and print the adapter details out to the console.

## Examples:

### Apple Power Adapter 1:

Adapter Details:
* Manufacturer: Apple
* Name: 70W USB-C Power Adapter
* Description: pd charger
* Voltage: 20V
* Current: 3.39A
* Watts: 68
* Capabilities:
  * 5V 2.96A
  * 9V 2.98A
  * 15V 2.99A
  * 30V 3.39A

### Battery pack 1:

Adapter Details:
* Manufacturer: undefined
* Name: undefined
* Description: pd charger
* Voltage: 5V
* Current: 0.9A
* Watts: 5
* Capabilities:
  * 5V 0.9A

### Battery pack 2:

Adapter Details:
* Manufacturer: undefined
* Name: undefined
* Description: usb host
* Voltage: 5V
* Current: 3A
* Watts: 15
* Capabilities:
  * 5V 3A
  * 9V 2.22A

### Battery pack 3:

Adapter Details:
* Manufacturer: undefined
* Name: undefined
* Description: pd charger
* Voltage: 12V
* Current: 1.5A
* Watts: 18
* Capabilities:
  * 5V 2A
  * 9V 2A
  * 12V 1.5A
