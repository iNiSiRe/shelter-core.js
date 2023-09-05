import {Event} from 'netbus';

export enum ShelterEvent {
    DeviceUpdate = 'Device.Update',
    DiscoverRequest = 'Discover.Request',
    DiscoverResponse = 'Discover.Response',
}

export class DeviceUpdate extends Event
{
    constructor(
        deviceId: string,
        update: object,
        properties: object
    ) {
        super(ShelterEvent.DeviceUpdate, {device: deviceId, update: update, properties: properties});
    }
}

export class DiscoverRequest extends Event
{
    constructor() {
        super(ShelterEvent.DiscoverRequest);
    }
}

export class DiscoverResponse extends Event
{
    constructor() {
        super(ShelterEvent.DiscoverResponse);
    }
}