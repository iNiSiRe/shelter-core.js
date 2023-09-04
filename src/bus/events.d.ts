import { Event } from 'netbus';
export declare class DeviceUpdate extends Event {
    constructor(deviceId: string, update: object, properties: object);
}
