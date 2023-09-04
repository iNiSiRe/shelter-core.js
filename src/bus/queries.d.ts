import { Query } from "netbus";
export declare class DeviceCall extends Query {
    readonly deviceId: string;
    readonly method: string;
    readonly params: any;
    constructor(deviceId: string, method: string, params: any);
}
