import {Query} from "netbus";

export class DeviceCall extends Query
{
    constructor(
        public readonly deviceId: string,
        public readonly method: string,
        public readonly params: any
    ) {
        super('Device.Call', {device: deviceId, method: method, parameters: params});
    }
}