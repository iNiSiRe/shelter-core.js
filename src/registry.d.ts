import { Bus, Event, RemoteEvent } from "netbus";
export declare class Registry {
    private readonly bus;
    private readonly devices;
    private readonly events;
    constructor(bus: Bus);
    handleDeviceUpdate(event: Event): void;
    handleDiscoverResponse(event: RemoteEvent): void;
    find(id: string): null | RemoteDevice;
    findAll(): Generator<RemoteDevice>;
    onUpdate(handler: (arg1: RemoteDevice) => void): void;
}
export declare class RemoteDevice implements Device {
    readonly busId: string;
    readonly id: string;
    readonly model: string;
    readonly properties: Map<string, any>;
    private events;
    constructor(busId: string, id: string, model: string, properties?: Map<string, any>);
    update(properties: Map<string, any>): void;
    onUpdate(handler: (arg1: Map<string, any>) => void): void;
}
export interface Device {
    readonly id: string;
    readonly model: string;
    readonly properties: Map<string, any>;
}
