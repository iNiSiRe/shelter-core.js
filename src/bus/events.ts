import {Event} from 'netbus';

export enum ShelterEvent {
    DeviceUpdate = 'Device.Update',
    DiscoverRequest = 'Discover.Request',
    DiscoverResponse = 'Discover.Response',
}

export type DeviceUpdateData = {device: string, update: object, properties: object};
export type DiscoverResponseData = {device: string, model: string, properties: object};

export class DeviceUpdate extends Event<DeviceUpdateData>
{
    constructor(
        deviceId: string,
        update: object,
        properties: object
    ) {
        super(ShelterEvent.DeviceUpdate, {device: deviceId, update: update, properties: properties});
    }
}

export class DiscoverRequest extends Event<null>
{
    constructor() {
        super(ShelterEvent.DiscoverRequest, null);
    }
}

export class DiscoverResponse extends Event<DiscoverResponseData>
{
    constructor(
        deviceId: string,
        model: string,
        properties: object
    ) {
        super(ShelterEvent.DiscoverResponse, {
            device: deviceId,
            model: model,
            properties: properties
        });
    }
}