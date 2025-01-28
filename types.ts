export interface Data {
  AppleRawAdapterDetails: Adapter[];
  BestAdapterIndex: number;
  ExternalConnected: boolean;
}

export interface Adapter {
  AdapterVoltage: number;
  Current: number;
  Description: string;
  Manufacturer?: string;
  Name?: string;
  UsbHvcHvcIndex: number;
  UsbHvcMenu: Mode[];
  Watts: number;
}

export interface Mode {
  Index: number;
  MaxCurrent?: number;
  MaxVoltage?: number;
}

export interface Detail {
  name: string;
  value?: string;
}
