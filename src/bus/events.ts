import {Event} from 'netbus';

export class DeviceUpdate extends Event
{
    constructor(
        deviceId: string,
        update: object,
        properties: object
    ) {
        super('Device.Update', {device: deviceId, update: update, properties: properties});
    }
}