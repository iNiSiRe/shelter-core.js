import {Query} from "netbus";

export enum ShelterQuery {
    DeviceCall = 'Device.Call'
}

export type DeviceCallData = {device: string, method: string, parameters: any}

export class DeviceCall extends Query<DeviceCallData>
{
    constructor(
        public readonly deviceId: string,
        public readonly method: string,
        public readonly params: any
    ) {
        super(ShelterQuery.DeviceCall, {device: deviceId, method: method, parameters: params});
    }
}